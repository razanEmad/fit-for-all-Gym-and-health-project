from fastapi import FastAPI
#This imports your MongoDB collection from database.py
from app.database import users_collection
#Go to profile.py and bring me its router
from app.routes.profile import router as profile_router
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.gym import router as gym_router


app = FastAPI(title="Fit For All API")
#I want to create a web server/API
#Think of app as your backend server/application
#You will attach all your endpoints/routes to it

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500",
        "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(profile_router)
#Hey FastAPI, take all the endpoints inside profile_router and add them to my application
app.include_router(gym_router)

#When someone sends a GET request to /, run the function below
@app.get("/")
def root(): #you can name it anything not just root() 
    return {"message": "Fit For All API is running"}