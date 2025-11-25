# FastAPI Authentication Service

This is a FastAPI-based authentication service that replaces the Node.js authentication endpoints while maintaining compatibility with the existing MongoDB database.

## Features

- ✅ User signup with validation
- ✅ User login with JWT token generation
- ✅ Password hashing using bcrypt
- ✅ JWT token-based authentication
- ✅ Protected routes with role-based access control
- ✅ Compatible with existing MongoDB schema
- ✅ CORS enabled
- ✅ Request validation using Pydantic
- ✅ Async/await for better performance

## Directory Structure

```
auth_service/
├── main.py              # FastAPI application and routes
├── database.py          # MongoDB connection using Motor
├── auth_utils.py        # JWT and password utilities
├── schemas.py           # Pydantic schemas for validation
├── middleware.py        # Custom middleware
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend/auth_service
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string (same as Node.js backend)
- `JWT_SECRET`: Same JWT secret as your Node.js backend for token compatibility
- `JWT_EXPIRE`: Token expiration time (e.g., "30d", "7d", "24h")
- `AUTH_PORT`: Port for the auth service (default: 8001)
- `CLIENT_URL`: Your frontend URL for CORS

### 5. Run the Service

**Development mode (with auto-reload):**
```bash
uvicorn main:app --reload --port 8001
```

**Or using Python:**
```bash
python main.py
```

**Production mode:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

## API Endpoints

### Health Check
```
GET /api/health
```

### User Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Password Requirements:**
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### User Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

## Response Format

All endpoints return JSON with the following structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "jwt_token"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "detail": "Detailed error information"
}
```

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integration with Frontend

Update your frontend API calls to point to `http://localhost:8001` instead of `http://localhost:5000` for authentication endpoints.

Example with axios:
```javascript
const API_BASE_URL = 'http://localhost:8001';

// Signup
const signup = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, userData);
  return response.data;
};

// Login
const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  return response.data;
};

// Get current user
const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

## Using the Authentication Dependency in Other Routes

To protect routes in your FastAPI application:

```python
from fastapi import Depends
from auth_utils import get_current_user, require_role

# Require authentication
@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['name']}"}

# Require specific role
@app.get("/admin", dependencies=[Depends(require_role("admin"))])
async def admin_route():
    return {"message": "Admin access granted"}
```

## Migration from Node.js

The FastAPI service is designed to be a drop-in replacement for the Node.js authentication endpoints:

1. **Same Database**: Uses the same MongoDB database and collection structure
2. **Same JWT Secret**: Configure the same JWT_SECRET to maintain token compatibility
3. **Same API Routes**: `/api/auth/signup` and `/api/auth/login` work identically
4. **Same Response Format**: Returns the same JSON structure
5. **Same Password Hashing**: Uses bcrypt with same complexity

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## Performance

FastAPI with async/await provides better performance than Node.js for I/O-bound operations:
- Async MongoDB operations using Motor
- Concurrent request handling
- Lower memory footprint
- Fast JSON serialization

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token validation
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Rate limiting middleware (optional)
- ✅ Secure headers

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### JWT Token Issues
- Ensure JWT_SECRET matches between Node.js and FastAPI
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`

### Port Already in Use
```bash
# Change AUTH_PORT in .env or specify different port
uvicorn main:app --port 8002
```

## License

Same as the main project.
