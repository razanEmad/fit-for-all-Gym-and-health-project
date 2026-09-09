from fastapi import APIRouter, HTTPException,Depends
from app.database import users_collection
from app.schemas.auth import RegisterRequest, LoginRequest,UpdateAccountRequest
from passlib.context import CryptContext
from jose import jwt
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "change-this-later"
ALGORITHM = "HS256"


@router.post("/register")
def register(user: RegisterRequest):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(user.password)

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    result = users_collection.insert_one(user_data)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    existing_user = users_collection.find_one({
        "email": form_data.username
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(
        form_data.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = jwt.encode(
        {
            "user_id": str(existing_user["_id"]),
            "email": existing_user["email"]
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.put("/account")
def update_account(
    account: UpdateAccountRequest,
    current_user=Depends(get_current_user)
):
    # Check if email is already used by another account
    existing_user = users_collection.find_one({
        "email": account.email,
        "_id": {"$ne": current_user["_id"]}
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    update_data = {
        "name": account.name,
        "email": account.email
    }

    # Password change requested
    if account.new_password:

        # Current password is required
        if not account.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password is required"
            )

        # Verify current password
        if not pwd_context.verify(
            account.current_password,
            current_user["password"]
        ):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )

        # Hash new password
        update_data["password"] = pwd_context.hash(
            account.new_password
        )

    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )

    return {
        "message": "Personal information updated successfully"
    }

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "name": current_user["name"],
        "email": current_user["email"]
    }