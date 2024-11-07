from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Boolean,Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import pytz  # Import pytz for timezone handling


class User(Base):
    __tablename__ = "tbl_users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    firstname = Column(String)
    lastname = Column(String)
    age = Column(Integer)

    # Relationships
    bmi_records = relationship("BMI", back_populates="user")
    records = relationship("Record", back_populates="user") 


class BMI(Base):
    __tablename__ = "bmi_data"

    bmi_id = Column(Integer, primary_key=True, index=True)
    height = Column(Float)
    weight = Column(Float)
    bmi = Column(Float)
    user_id = Column(Integer, ForeignKey("tbl_users.user_id"))
    
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"))

    user = relationship("User", back_populates="bmi_records")
    recommendation = relationship("Recommendation", back_populates="bmi_records")  # Added back_populates


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    plan = Column(String)
    daily_calories = Column(Integer)

    bmi_records = relationship("BMI", back_populates="recommendation")  # Added relationship


class Food(Base):
    __tablename__ = 'foods'

    food_id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    carbs = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)
    calorie = Column(Integer, nullable=False)
    grams = Column(Integer, nullable=False)
    meal_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    recipe_link = Column(String, nullable=True)

class FilteredFood(Base):
    __tablename__ = "filtered_foods"

    filtered_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("tbl_users.user_id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.food_id"), nullable=False)
    food_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    carbs = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)
    calorie = Column(Integer, nullable=False)
    grams = Column(Integer, nullable=False)
    meal_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    recipe_link = Column(String, nullable=True) 

    user = relationship("User", backref="filtered_foods")
    food = relationship("Food")
    records = relationship("Record", back_populates="filtered_food")



class Record(Base):
    __tablename__ = "records"
    record_id = Column(Integer, primary_key=True, index=True)  # Renamed 'id' to 'record_id'
    user_id = Column(Integer, ForeignKey("tbl_users.user_id"), nullable=False)
    filtered_food_id = Column(Integer, ForeignKey("filtered_foods.filtered_id"), nullable=True)  # Referenced filtered_id
    food_name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    carbs = Column(Integer, nullable=False)
    protein = Column(Integer, nullable=False)
    fats = Column(Integer, nullable=False)
    calorie = Column(Integer, nullable=False)
    grams = Column(Integer, nullable=False)
    meal_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    consumed_at = Column(DateTime, default=lambda: datetime.now(pytz.timezone('Asia/Manila')))  # Timezone

    # Relationships
    user = relationship("User", back_populates="records")
    filtered_food = relationship("FilteredFood", back_populates="records")  # Unchanged


class Progress(Base):
    __tablename__ = "progress"

    progress_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("tbl_users.user_id"), nullable=False)
    filtered_id = Column(Integer, ForeignKey("filtered_foods.filtered_id"), nullable=False)
    total_calories = Column(Integer, nullable=False)  # Track total calories consumed
    date = Column(Date, default=lambda: datetime.now(pytz.timezone('Asia/Manila')).date())  # Date when calories are tracked
    daily_calories = Column(Integer, ForeignKey("recommendations.daily_calories"))  # Link to daily calorie recommendation

    # Relationships
    user = relationship("User", backref="progress_records")
    filtered_food = relationship("FilteredFood", backref="progress_records")