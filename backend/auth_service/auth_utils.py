from datetime import datetime, timedelta
from typing import Optional
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from dotenv import load_dotenv

from database import get_database

load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme for JWT token
security = HTTPBearer()

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE = os.getenv("JWT_EXPIRE", "30d")


def parse_jwt_expire(expire_str: str) -> int:
    """Parse JWT expiration string (e.g., '30d', '7d', '24h') to seconds"""
    unit = expire_str[-1]
    value = int(expire_str[:-1])
    
    if unit == 'd':
        return value * 24 * 60 * 60
    elif unit == 'h':
        return value * 60 * 60
    elif unit == 'm':
        return value * 60
    else:
        return value  # assume seconds


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> str:
    """
    Create JWT access token
    
    Args:
        user_id: User's unique identifier
        
    Returns:
        Encoded JWT token
    """
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET is not set in environment variables")
    
    expire_seconds = parse_jwt_expire(JWT_EXPIRE)
    expire = datetime.utcnow() + timedelta(seconds=expire_seconds)
    
    to_encode = {
        "id": user_id,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Decode and verify JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_database)
):
    """
    Dependency to get current authenticated user
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        db: Database instance
        
    Returns:
        User document from database
    """
    token = credentials.credentials
    
    try:
        # Decode token
        payload = decode_token(token)
        user_id = payload.get("id")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Get user from database
        users_collection = db["users"]
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.get("isActive", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is deactivated"
            )
        
        # Remove password from user object
        user.pop("password", None)
        
        return user
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency to ensure user is active
    """
    if not current_user.get("isActive", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(*allowed_roles: str):
    """
    Dependency factory to check if user has required role
    
    Usage:
        @app.get("/admin", dependencies=[Depends(require_role("admin"))])
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "user")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role}' is not authorized to access this route"
            )
        return current_user
    
    return role_checker
