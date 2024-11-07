from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from typing import List

class UserCreate(BaseModel):
    username: str
    password: str
    firstname: str  
    lastname: str   
    age: int        

class User(BaseModel):
    user_id: int
    username: str
    firstname: str
    lastname: str
    age: int

    class Config:
        orm_mode = True

class UserLogin(BaseModel):  
    username: str
    password: str

class BMICreate(BaseModel):
    height: float
    weight: float
    user_id: int

class BMI(BaseModel):
    bmi_id: int
    height: float
    weight: float
    bmi: float

    class Config:
        orm_mode = True 

class UserResponse(BaseModel):
    firstname: str  

    class Config:
        orm_mode = True

class RecommendationResponse(BaseModel):
    daily_calories: int  
    plan: str
    class Config:
        orm_mode = True

class BMI(BaseModel):
    bmi_id: int
    height: float
    weight: float
    bmi: float
    user: UserResponse  
    recommendation: RecommendationResponse  

    class Config:
        orm_mode = True



class FoodFilter(BaseModel):
    pork: bool
    allergic_to_milk: bool
    allergic_to_fish: bool
    allergic_to_soy: bool
    allergic_to_chicken: bool
    allergic_to_mussels: bool  
    allergic_to_beef: bool 


class FilteredFoodResponse(BaseModel):
    filtered_id: int
    food_name: str
    calories: int
    type: str
    grams: int
    categories: str
    mealtype: str
    carbs: int
    protein: int
    fats: int
    recipe_link: Optional[str]  # Add recipe_link here and make it optional

    class Config:
        orm_mode = True


class RecordCreate(BaseModel):
    user_id: int
    filtered_id: int  # Change to filtered_id to maintain consistency

    class Config:
        orm_mode = True

class RecordResponse(BaseModel):
    record_id: int
    user_id: int
    filtered_id: int | None
    food_name: str
    type: str
    carbs: float  # Changed from int to float
    protein: float  # Changed from int to float
    fats: float  # Changed from int to float
    calorie: int
    grams: int
    meal_type: str
    category: str
    consumed_at: datetime




class UpdateWeightSchema(BaseModel):
    weight: float 
    class Config:
        orm_mode = True

class ProgressCreate(BaseModel):
    user_id: int
    filtered_id: int

    class Config:
        orm_mode = True  # This tells Pydantic to read data from the ORM model

# Schema for returning Progress data in the API
class DailyCaloriesResponse(BaseModel):
    daily_calories: int

    class Config:
        orm_mode = True

# Schema for returning Progress data in the API
class ProgressResponse(BaseModel):
    progress_id: int
    user_id: int
    filtered_id: int
    total_calories: int
    date: date
    # Instead of embedding the whole BMI model, use this to extract only daily_calories
    bmi: DailyCaloriesResponse  # Here, bmi contains only daily_calories

    class Config:
        orm_mode = True

class CaloriesPerDayResponse(BaseModel):
    date: date
    total_calories: int

    class Config:
        orm_mode = True


class NewRecordCreate(BaseModel):
    user_id: int
    food_name: str
    type: str
    carbs: int
    protein: int
    fats: int
    calorie: int
    grams: int
    meal_type: str
    category: str
    consumed_at: datetime = datetime.now()

    class Config:
        orm_mode = True
