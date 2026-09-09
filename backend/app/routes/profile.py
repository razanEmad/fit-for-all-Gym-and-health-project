from fastapi import APIRouter, Depends
#APIRouter lets you organize your API endpoints into separate files
from app.database import users_collection
from app.schemas.user import HealthProfile
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])
#This creates a router specifically for profile-related endpoints
#tags=["Profile"] -> This is mainly for your /docs. It groups these endpoints under: Profile

#Create/save a user's health profile
@router.post("/")
def create_profile(profile: HealthProfile, current_user=Depends(get_current_user)):
    #profile: HealthProfile. This means:
    #"The incoming request data should follow the HealthProfile schema."
    #So profile becomes a Python object containing the validated data 
    # that pydantic/FastAPI validated it


    profile_data = profile.model_dump()
    #profile is a Pydantic model object.
    #MongoDB wants something like a Python dictionary
    #so model_dump converts the object into a dictionary that mongoDB can save 


    #result = users_collection.insert_one(profile_data)
    #Insert this profile as a new document inside the users collection

    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"health_profile": profile_data}}
    )

    return {
        "message": "Health profile created successfully"
    }

@router.get("/")
def get_profile(
    current_user=Depends(get_current_user)
):
    health_profile = current_user.get("health_profile")

    if health_profile is None:
        return {
            "name": current_user["name"],
            "message": "Health profile not created yet"
        }

    return {
        "name": current_user["name"],
        **health_profile
    }

@router.put("/")
def update_profile(
    profile: HealthProfile,
    current_user=Depends(get_current_user)
):
    profile_data = profile.model_dump()

    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"health_profile": profile_data}}
    )

    return {
        "message": "Health profile updated successfully"
    }