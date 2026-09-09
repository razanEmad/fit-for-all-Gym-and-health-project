print("DATABASE.PY IS RUNNING")

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

#Create a connection/client that knows how to communicate with this MongoDB server
client = MongoClient(MONGODB_URI)

#Inside MongoDB, I want to work with the fit_for_all database
db = client[DATABASE_NAME]

#I want to work with the users collection inside the fit_for_all database
users_collection = db["users"]

try:
    client.admin.command("ping")
    print("MongoDB connected successfully!")
except Exception as e:
    print("MongoDB connection failed:", e)