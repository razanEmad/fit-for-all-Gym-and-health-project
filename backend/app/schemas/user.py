from pydantic import BaseModel
#Pydantic is a library that FastAPI uses for data validation.
#BaseModel lets you create a model that says:
#"These are the fields I expect, and these are their types."
from typing import List

#I'm creating a data model called HealthProfile
class HealthProfile(BaseModel):
    age: int
    weight: float
    height: float
    goal: str
    budget: str
    allergies: List[str] = []
    dietary_preferences: List[str] = []