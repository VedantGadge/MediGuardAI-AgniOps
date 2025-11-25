from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime
import os
from dotenv import load_dotenv

from database import connect_to_mongo, close_mongo_connection, get_database
from schemas import SignupRequest, LoginRequest, UserResponse, TokenResponse
from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

# Load environment variables
load_dotenv()

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Initialize FastAPI app
app = FastAPI(
    title="MediGuard Auth API",
    description="Authentication service for MediGuard",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "success": True,
        "message": "Auth service is running",
        "timestamp": str(datetime.utcnow())
    }


@app.post("/api/auth/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: SignupRequest, db=Depends(get_database)):
    """
    Register a new user
    
    - **name**: User's full name (max 50 characters)
    - **email**: Valid email address
    - **password**: At least 6 characters with uppercase, lowercase, and number
    """
    try:
        users_collection = db["users"]
        
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user_data.email.lower()})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists with this email"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user document
        from datetime import datetime
        user_doc = {
            "name": user_data.name,
            "email": user_data.email.lower(),
            "password": hashed_password,
            "role": "user",
            "isActive": True,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert user into database
        result = await users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Generate token
        token = create_access_token(user_id)
        
        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "id": user_id,
                "name": user_data.name,
                "email": user_data.email.lower(),
                "role": "user",
                "token": token
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error during registration: {str(e)}"
        )


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db=Depends(get_database)):
    """
    Login user
    
    - **email**: Valid email address
    - **password**: User's password
    """
    try:
        users_collection = db["users"]
        
        # Find user by email
        user = await users_collection.find_one({"email": credentials.email.lower()})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is active
        if not user.get("isActive", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your account has been deactivated"
            )
        
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Generate token
        user_id = str(user["_id"])
        token = create_access_token(user_id)
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "id": user_id,
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "token": token
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error during login: {str(e)}"
        )


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    Requires Bearer token in Authorization header
    """
    return {
        "success": True,
        "data": {
            "id": str(current_user["_id"]),
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user.get("role", "user")
        }
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if os.getenv("NODE_ENV") == "development" else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AUTH_PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
