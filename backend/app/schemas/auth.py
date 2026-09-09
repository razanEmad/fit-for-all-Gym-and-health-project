from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UpdateAccountRequest(BaseModel):
    name: str
    email: EmailStr
    current_password: str | None = None
    new_password: str | None = None