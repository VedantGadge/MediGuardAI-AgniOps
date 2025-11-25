from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from typing import Optional
import re


class SignupRequest(BaseModel):
    """Request schema for user signup"""
    name: str = Field(..., min_length=1, max_length=50, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User's password")
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @validator('password')
    def password_complexity(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        
        # Check for at least one uppercase, one lowercase, and one digit
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "password": "SecurePass123"
            }
        }


class LoginRequest(BaseModel):
    """Request schema for user login"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "password": "SecurePass123"
            }
        }


class UserData(BaseModel):
    """User data in response"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(..., serialization_alias="_id")
    name: str
    email: str
    role: str


class UserWithToken(UserData):
    """User data with JWT token"""
    token: str


class TokenResponse(BaseModel):
    """Response schema for authentication endpoints"""
    success: bool = True
    message: str
    data: UserWithToken
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Login successful",
                "data": {
                    "_id": "507f1f77bcf86cd799439011",
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "role": "user",
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
            }
        }


class UserResponse(BaseModel):
    """Response schema for user data endpoints"""
    success: bool = True
    data: UserData
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "_id": "507f1f77bcf86cd799439011",
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "role": "user"
                }
            }
        }


class ErrorResponse(BaseModel):
    """Response schema for errors"""
    success: bool = False
    message: str
    detail: Optional[str] = None
    errors: Optional[list] = None
