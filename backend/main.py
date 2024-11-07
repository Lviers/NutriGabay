from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import engine, SessionLocal, Base
import crud
import schemas
from starlette.middleware.cors import CORSMiddleware
from models import FilteredFood, Food, User, Record, Progress
from schemas import FoodFilter, FilteredFoodResponse, RecordCreate, RecordResponse, NewRecordCreate,ProgressResponse,DailyCaloriesResponse
from crud import filter_foods, get_filtered_foods
from models import BMI as BMIDB
from datetime import datetime, date
import logging
import pytz

app = FastAPI()

origins = [
    "http://localhost:8081",
    "http://localhost",
    "http://127.0.0.1",
    "http://192.168.1.5",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    print(f"Debug: Attempting to register user with username '{user.username}'. Found user: {db_user}")  # Debug line

    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # If not registered, proceed with creating the user
    return crud.create_user(db=db, user=user)


@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Look up the user by username
    db_user = crud.get_user_by_username(db, username=user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Verify the password
    if not crud.pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Attempt to retrieve BMI record
    bmi_record = crud.get_bmi_records_by_user(db, user_id=db_user.user_id)

    if bmi_record:
        return {
            "user_id": db_user.user_id,
            "redirect_to": "HomeScreen",
            "message": "Login successful, redirecting to HomeScreen"
        }
    else:
        # If no BMI record exists, redirect to BMI setup
        return {
            "user_id": db_user.user_id,
            "redirect_to": "BMICalculator",
            "message": "Login successful, redirecting to BMICalculator to set up BMI"
        }



@app.post("/bmi", response_model=schemas.BMI)
def create_bmi(bmi_data: schemas.BMICreate, db: Session = Depends(get_db)):
    return crud.create_bmi_record(db=db, bmi_data=bmi_data)

@app.get("/bmi/user/{user_id}", response_model=schemas.BMI)
def get_bmi_records_by_user(user_id: int, db: Session = Depends(get_db)):
    bmi_record = crud.get_bmi_records_by_user(db, user_id=user_id)
    if bmi_record is None:
        raise HTTPException(status_code=404, detail="BMI record not found")
    return bmi_record

@app.post("/recommendation")
def get_recommendation(bmi: float, db: Session = Depends(get_db)):
    recommendation = crud.get_recommendation(db, bmi)
    
    if recommendation:
        return {"plan": recommendation.plan}
    else:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
@app.post("/filter-foods/{user_id}", response_model=List[FilteredFoodResponse])
def filter_and_store_foods(user_id: int, answer: FoodFilter, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found.")
        
        filtered_foods = filter_foods(db, answer, user_id)
        if not filtered_foods:
            raise HTTPException(status_code=404, detail="No foods found matching the criteria.")
        
        response = [
            FilteredFoodResponse(
                filtered_id=food.filtered_id,
                food_name=food.food_name,
                calories=food.calorie,
                type=food.type,
                grams=food.grams,
                categories=food.category,
                mealtype=food.meal_type,
                carbs=int(float(food.carbs.replace('g', '').strip())) if isinstance(food.carbs, str) else food.carbs,
                protein=int(float(food.protein.replace('g', '').strip())) if isinstance(food.protein, str) else food.protein,
                fats=int(float(food.fats.replace('g', '').strip())) if isinstance(food.fats, str) else food.fats,
                recipe_link=food.recipe_link
            )
            for food in db.query(FilteredFood).filter(FilteredFood.user_id == user_id).all()
        ]

        return response

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@app.get("/filtered-foods/{user_id}", response_model=List[FilteredFoodResponse])
def get_filtered_foods(user_id: int, db: Session = Depends(get_db)):
    # Query the filtered_foods table directly
    filtered_foods = db.query(FilteredFood).filter(FilteredFood.user_id == user_id).all()

    if not filtered_foods:
        raise HTTPException(status_code=404, detail="No filtered foods found for the given user ID.")

    # Prepare the response including filtered_id and necessary fields
    response = [
        FilteredFoodResponse(
            filtered_id=entry.filtered_id,  # Ensure the filtered_id is included in the response
            food_name=entry.food_name,
            calories=entry.calorie,
            type=entry.type,
            grams=entry.grams,
            categories=entry.category,
            mealtype=entry.meal_type,
            carbs=int(float(entry.carbs.replace('g', '').strip())) if isinstance(entry.carbs, str) else entry.carbs,
            protein=int(float(entry.protein.replace('g', '').strip())) if isinstance(entry.protein, str) else entry.protein,
            fats=int(float(entry.fats.replace('g', '').strip())) if isinstance(entry.fats, str) else entry.fats,
            recipe_link=entry.recipe_link  
        )
        for entry in filtered_foods
    ]

    return response




@app.post("/record-consumption", response_model=RecordResponse)
def record_consumption(record_data: RecordCreate, db: Session = Depends(get_db)):
    # Check if the user and filtered food exist
    user = db.query(User).filter(User.user_id == record_data.user_id).first()
    filtered_food = db.query(FilteredFood).filter(FilteredFood.filtered_id == record_data.filtered_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not filtered_food:
        raise HTTPException(status_code=404, detail="Filtered food not found")

    # Convert 'carbs', 'protein', and 'fats' to floats if they're strings with "g"
    carbs = float(filtered_food.carbs.replace('g', '').strip()) if isinstance(filtered_food.carbs, str) else filtered_food.carbs
    protein = float(filtered_food.protein.replace('g', '').strip()) if isinstance(filtered_food.protein, str) else filtered_food.protein
    fats = float(filtered_food.fats.replace('g', '').strip()) if isinstance(filtered_food.fats, str) else filtered_food.fats

    # Create the record with all the food details
    record = Record(
        user_id=record_data.user_id,
        filtered_food_id=record_data.filtered_id,
        food_name=filtered_food.food_name,
        type=filtered_food.type,
        carbs=carbs,
        protein=protein,
        fats=fats,
        calorie=filtered_food.calorie,
        grams=filtered_food.grams,
        meal_type=filtered_food.meal_type,
        category=filtered_food.category,
        consumed_at=datetime.now(pytz.timezone('Asia/Manila'))
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return RecordResponse(
        record_id=record.record_id,
        user_id=record.user_id,
        filtered_id=record.filtered_food_id,
        food_name=record.food_name,
        type=record.type,
        carbs=int(round(record.carbs)),  # Convert to int with rounding
        protein=int(round(record.protein)),  # Convert to int with rounding
        fats=int(round(record.fats)),  # Convert to int with rounding
        calorie=record.calorie,
        grams=record.grams,
        meal_type=record.meal_type,
        category=record.category,
        consumed_at=record.consumed_at
    )


@app.get("/records/{user_id}", response_model=List[schemas.RecordResponse])
def get_user_records(user_id: int, db: Session = Depends(get_db)):
    # Query to get all records for a specific user
    records = db.query(Record).filter(Record.user_id == user_id).all()

    if not records:
        raise HTTPException(status_code=404, detail="No records found for the given user ID.")

    # Prepare the response by explicitly including `filtered_id`
    response = [
        schemas.RecordResponse(
            record_id=record.record_id,
            user_id=record.user_id,
            filtered_id=record.filtered_food_id,  # Ensure `filtered_id` is set correctly
            food_name=record.food_name,
            type=record.type,
            carbs=int(record.carbs.replace('g', '').strip()) if isinstance(record.carbs, str) else record.carbs,
            protein=int(record.protein.replace('g', '').strip()) if isinstance(record.protein, str) else record.protein,
            fats=int(record.fats.replace('g', '').strip()) if isinstance(record.fats, str) else record.fats,
            calorie=record.calorie,
            grams=record.grams,
            meal_type=record.meal_type,
            category=record.category,
            consumed_at=record.consumed_at
        )
        for record in records
    ]

    return response
 

@app.put("/bmi/user/{user_id}/update-weight", response_model=schemas.BMI)
def update_user_weight(user_id: int, weight_data: schemas.UpdateWeightSchema, db: Session = Depends(get_db)):
    # Fetch the BMI record for the user
    bmi_record = crud.get_bmi_records_by_user(db, user_id=user_id)
    if not bmi_record:
        raise HTTPException(status_code=404, detail="BMI record not found")

    # Update the weight
    bmi_record.weight = weight_data.weight

    # Since height is already in meters, no need for conversion
    height_in_meters = bmi_record.height  # Assume height is already stored in meters

    # Ensure height is greater than 0 to avoid division by zero error
    if height_in_meters <= 0:
        raise HTTPException(status_code=400, detail="Height must be greater than zero")

    bmi_value = bmi_record.weight / (height_in_meters ** 2)  # BMI calculation
    bmi_record.bmi = bmi_value

    if bmi_value < 18.5:
        bmi_record.recommendation_id = 1  
    elif 18.5 <= bmi_value <= 24.9:
        bmi_record.recommendation_id = 2  
    else:
        bmi_record.recommendation_id = 3 

    db.commit()
    db.refresh(bmi_record)
    
    return bmi_record




@app.get("/foods")
def read_foods(db: Session = Depends(get_db)):
    foods = db.query(Food).all()
    return {"foods": foods}


@app.post("/progress/{user_id}/update", response_model=schemas.ProgressResponse)
def update_daily_progress(user_id: int, filtered_id: int, db: Session = Depends(get_db)):
    try:
        progress = crud.update_progress(db=db, user_id=user_id, filtered_id=filtered_id)
        return progress
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/progress/{user_id}/update", response_model=schemas.ProgressResponse)
def update_daily_progress(user_id: int, filtered_id: int, db: Session = Depends(get_db)):
    """
    Endpoint to update or create daily progress for the user when consuming a food.
    This adds the calories of the consumed food to today's total calories.
    """
    try:
        progress = crud.update_progress(db=db, user_id=user_id, filtered_id=filtered_id)
        return progress
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress/{user_id}/today", response_model=ProgressResponse)
def get_today_progress(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch progress for the current day, including BMI's daily_calories.
    """
    today = date.today()

    progress = db.query(Progress).filter(Progress.user_id == user_id, Progress.date == today).first()

    if not progress:
        raise HTTPException(status_code=404, detail="No progress found for today.")
    
    bmi_record = db.query(BMIDB).options(joinedload(BMIDB.recommendation)).filter(BMIDB.user_id == user_id).order_by(BMIDB.bmi_id.desc()).first()

    if bmi_record and bmi_record.recommendation:
        bmi_response = DailyCaloriesResponse(daily_calories=bmi_record.recommendation.daily_calories)
    else:
        bmi_response = DailyCaloriesResponse(daily_calories=2000)  

    return ProgressResponse(
        progress_id=progress.progress_id,
        user_id=progress.user_id,
        filtered_id=progress.filtered_id,
        total_calories=progress.total_calories,
        date=progress.date,
        bmi=bmi_response 
    )


@app.get("/progress/{user_id}/calories-per-day", response_model=List[ProgressResponse])
def get_calories_per_day(user_id: int, start_date: date, end_date: date, db: Session = Depends(get_db)):
    """
    Get total calories consumed per day for a specific user between start_date and end_date.
    """
    progress_records = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.date >= start_date,
        Progress.date <= end_date
    ).all()

    if not progress_records:
        raise HTTPException(status_code=404, detail="No progress records found for the specified date range.")

    response = []
    for progress in progress_records:
        bmi_record = db.query(BMIDB).options(joinedload(BMIDB.recommendation)).filter(BMIDB.user_id == user_id).order_by(BMIDB.bmi_id.desc()).first()

        if bmi_record and bmi_record.recommendation:
            bmi_response = DailyCaloriesResponse(daily_calories=bmi_record.recommendation.daily_calories)
        else:
            bmi_response = DailyCaloriesResponse(daily_calories=2000)

        response.append(ProgressResponse(
            progress_id=progress.progress_id,
            user_id=progress.user_id,
            filtered_id=progress.filtered_id,
            total_calories=progress.total_calories,
            date=progress.date,
            bmi=bmi_response  
        ))

    return response


@app.get("/progress/{user_id}/calories-per-day", response_model=List[schemas.ProgressResponse])
def get_calories_per_day(user_id: int, start_date: date, end_date: date, db: Session = Depends(get_db)):
    """
    Get total calories consumed per day for a specific user between start_date and end_date.
    """
    progress_records = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.date >= start_date,
        Progress.date <= end_date
    ).all()

    if not progress_records:
        raise HTTPException(status_code=404, detail="No progress records found for the specified date range.")
    
    return progress_records

@app.post("/add-record", response_model=schemas.RecordResponse)
def add_record(record_data: NewRecordCreate, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == record_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_record = Record(
        user_id=record_data.user_id,
        food_name=record_data.food_name,
        type=record_data.type,
        carbs=record_data.carbs,
        protein=record_data.protein,
        fats=record_data.fats,
        calorie=record_data.calorie,
        grams=record_data.grams,
        meal_type=record_data.meal_type,
        category=record_data.category,
        consumed_at=record_data.consumed_at or datetime.now(pytz.timezone('Asia/Manila')),
        filtered_food_id=None  
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Step 3: Fetch the user's latest BMI and its associated recommendation
    bmi_record = db.query(BMIDB).filter(BMIDB.user_id == record_data.user_id).order_by(BMIDB.bmi_id.desc()).first()
    if not bmi_record or not bmi_record.recommendation:
        raise HTTPException(status_code=404, detail="No BMI record or recommendation found for the user.")

    # Get the recommended daily calories from the user's plan
    daily_calories = bmi_record.recommendation.daily_calories

    # Step 4: Update the user's progress for today
    today = datetime.now(pytz.timezone('Asia/Manila')).date()
    
    # Check if a progress entry already exists for today
    progress = db.query(Progress).filter(Progress.user_id == record_data.user_id, Progress.date == today).first()

    if progress:
        # Update the total calories
        progress.total_calories += new_record.calorie
    else:
        # Create a new progress entry
        new_progress = Progress(
            user_id=record_data.user_id,
            filtered_id=None,  # Set to None if not using filtered food
            total_calories=new_record.calorie,
            date=today,
            daily_calories=daily_calories  # Use the recommended daily calories from the plan
        )
        db.add(new_progress)

    # Commit changes to progress
    db.commit()

    # Explicitly set filtered_id to None in the response if no filtered_food_id exists
    return RecordResponse(
        record_id=new_record.record_id,
        user_id=new_record.user_id,
        filtered_id=new_record.filtered_food_id,  # Pass None if filtered_food_id is not set
        food_name=new_record.food_name,
        type=new_record.type,
        carbs=new_record.carbs,
        protein=new_record.protein,
        fats=new_record.fats,
        calorie=new_record.calorie,
        grams=new_record.grams,
        meal_type=new_record.meal_type,
        category=new_record.category,
        consumed_at=new_record.consumed_at
    )
