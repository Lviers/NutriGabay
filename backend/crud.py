from sqlalchemy.orm import Session
from models import User, BMI, Recommendation, Food, FilteredFood,Progress
from schemas import UserCreate, BMICreate, FoodFilter, FilteredFoodResponse,ProgressResponse  
from passlib.context import CryptContext
from fastapi import HTTPException
import logging
from datetime import date 
from sqlalchemy.orm import joinedload

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    user = db.query(User).filter(User.username == username).first()
    print(f"Debug: User found for username '{username}': {user}")  
    return user

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        firstname=user.firstname,
        lastname=user.lastname,
        age=user.age
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def calculate_bmi(weight: float, height: float) -> float:
    return weight / (height ** 2)

def create_bmi_record(db: Session, bmi_data: BMICreate):
    bmi_value = calculate_bmi(bmi_data.weight, bmi_data.height)

    if bmi_value < 18.5:
        recommendation_id = 1
    elif 18.5 <= bmi_value <= 24.9:
        recommendation_id = 2
    else:
        recommendation_id = 3

    db_bmi = BMI(
        height=bmi_data.height,
        weight=bmi_data.weight,
        bmi=bmi_value,
        user_id=bmi_data.user_id,
        recommendation_id=recommendation_id
    )
    db.add(db_bmi)
    db.commit()
    db.refresh(db_bmi)
    return db_bmi

def get_bmi_records_by_user(db: Session, user_id: int):
    return db.query(BMI).filter(BMI.user_id == user_id).first()

def filter_foods(db: Session, answer: FoodFilter, user_id: int):
    filters = []

    if answer.pork:
        filters.append(Food.type != 'Pork')
    if answer.allergic_to_milk:
        filters.append(Food.type != 'Milk')
    if answer.allergic_to_fish:
        filters.append(Food.type != 'Fish')
    if answer.allergic_to_soy:
        filters.append(Food.type != 'Soy')
    if answer.allergic_to_chicken:
        filters.append(Food.type != 'Chicken')
    if answer.allergic_to_mussels:
        filters.append(Food.type != 'Mussels')
    if answer.allergic_to_beef:
        filters.append(Food.type != 'Beef')

    try:
        query = db.query(Food)
        for filter_condition in filters:
            query = query.filter(filter_condition)

        filtered_foods = query.all()
        logging.info(f"Filtered foods: {filtered_foods}")  

        if not filtered_foods:
            raise HTTPException(status_code=404, detail="No foods found matching the criteria.")

        filtered_food_entries = []
        for food in filtered_foods:
            filtered_food_entry = FilteredFood(
                user_id=user_id,
                food_id=food.food_id,
                food_name=food.food_name,
                type=food.type,
                carbs=food.carbs,
                protein=food.protein,
                fats=food.fats,
                calorie=food.calorie,
                grams=food.grams,
                meal_type=food.meal_type,
                category=food.category,
                recipe_link=food.recipe_link  
            )
            db.add(filtered_food_entry)
            db.flush()  
            filtered_food_entries.append(filtered_food_entry)

        db.commit()  
        return filtered_food_entries  
    except Exception as e:
        logging.error(f"Error in filter_foods: {str(e)}")
        raise


def get_filtered_foods(db: Session, user_id: int):
    filtered_foods = db.query(FilteredFood).filter(FilteredFood.user_id == user_id).all()

    if not filtered_foods:
        raise HTTPException(status_code=404, detail="No filtered foods found for the given user ID.")

    response = [
        FilteredFoodResponse(
            filtered_id=entry.filtered_id,
            food_name=entry.food_name,
            calories=entry.calorie,
            type=entry.type,
            grams=entry.grams,
            categories=entry.category,
            mealtype=entry.meal_type,
            carbs=int(entry.carbs.replace('g', '').strip()) if isinstance(entry.carbs, str) else entry.carbs,
            protein=int(entry.protein.replace('g', '').strip()) if isinstance(entry.protein, str) else entry.protein,
            fats=int(entry.fats.replace('g', '').strip()) if isinstance(entry.fats, str) else entry.fats,
            recipe_link=entry.recipe_link  # Return recipe_link in the response
        )
        for entry in filtered_foods
    ]

    return response


def get_latest_bmi_record_for_user(db: Session, user_id: int):
    return db.query(BMI).filter(BMI.user_id == user_id).order_by(BMI.bmi_id.desc()).first()

def get_recommendation(db: Session, bmi: float):
    if bmi < 18.5:
        return db.query(Recommendation).filter(Recommendation.id == 1).first()
    elif 18.5 <= bmi <= 24.9:
        return db.query(Recommendation).filter(Recommendation.id == 2).first()
    else:
        return db.query(Recommendation).filter(Recommendation.id == 3).first()


def update_progress(db: Session, user_id: int, filtered_id: int):
    food = db.query(FilteredFood).filter(FilteredFood.filtered_id == filtered_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Filtered food not found.")

    today = date.today()

    progress = db.query(Progress).filter(Progress.user_id == user_id, Progress.date == today).first()

    if progress:
        progress.total_calories += food.calorie
    else:
        bmi_record = db.query(BMI).options(joinedload(BMI.recommendation)).filter(BMI.user_id == user_id).order_by(BMI.bmi_id.desc()).first()
        
        if not bmi_record or not bmi_record.recommendation:
            raise HTTPException(status_code=404, detail="No BMI record or recommendation found.")
        
        daily_calories = bmi_record.recommendation.daily_calories
        
        new_progress = Progress(
            user_id=user_id,
            filtered_id=filtered_id,
            total_calories=food.calorie,
            date=today,
            daily_calories=daily_calories  
        )
        db.add(new_progress)
        progress = new_progress

    db.commit()
    db.refresh(progress)
    
    return ProgressResponse(
        progress_id=progress.progress_id,
        user_id=progress.user_id,
        filtered_id=progress.filtered_id,
        total_calories=progress.total_calories,
        date=progress.date,
        bmi={"daily_calories": progress.daily_calories}  
    )
