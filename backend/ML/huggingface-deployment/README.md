---
title: MediGuardAI Complete API
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
---

# MediGuardAI - Complete Medical Analysis & Authentication API

This unified API provides comprehensive medical analysis and user authentication services:

## 🌟 Features

### Authentication Service
- 👤 **User Registration** - Secure signup with password validation
- 🔐 **User Login** - JWT-based authentication
- 🛡️ **Protected Routes** - Secure endpoints with Bearer token authentication
- 📧 **Email Validation** - Built-in email format validation
- 🔒 **Password Security** - Bcrypt hashing with complexity requirements

### Medical Analysis Service
- 📊 **OCR Extraction** - Extract biomedical parameters from medical report images using Gemini AI
- 🤖 **AI Predictions** - Medical predictions with explainable AI using Groq LLM
- 🔍 **Feature Analysis** - SHAP-based feature importance analysis
- 📈 **Confidence Scores** - Prediction confidence metrics

### Technical Features
- 🌐 RESTful API with CORS support
- 📝 Interactive API documentation (Swagger UI)
- 🗄️ MongoDB database integration
- 🔑 JWT token-based authentication
- 🚀 Fast and scalable

## 📋 API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires Bearer token)
- `GET /api/auth/health` - Auth service health check

### OCR Endpoints
- `POST /api/ocr/extract` - Extract medical data from image
- `GET /api/ocr/health` - OCR health check

### LLM Prediction Endpoints
- `POST /api/predict` - Get medical prediction with explanation
- `GET /api/predict/health` - LLM health check

### Documentation
- `GET /` - API information and endpoints list
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## 🔐 Environment Variables

Required secrets in Hugging Face Space Settings:

| Secret Name | Description | Required |
|------------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for OCR | ✅ Yes |
| `GROQ_API_KEY` | Groq API key for LLM predictions | ✅ Yes |
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ Yes |
| `JWT_EXPIRE` | Token expiration time (e.g., "30d") | ⚠️ Optional (default: 30d) |
| `DB_NAME` | MongoDB database name | ⚠️ Optional (default: mediguard) |

## 🚀 Quick Start

### 1. Authentication Flow

#### Signup
```bash
curl -X POST "https://your-space.hf.space/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```bash
curl -X POST "https://your-space.hf.space/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

#### Get Current User (Protected)
```bash
curl -X GET "https://your-space.hf.space/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Medical Analysis

#### OCR Extract
```bash
curl -X POST "https://your-space.hf.space/api/ocr/extract" \
  -F "image=@medical_report.jpg"
```

#### Disease Prediction
```bash
curl -X POST "https://your-space.hf.space/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Glucose": 120,
    "Troponin": 0.05,
    "BMI": 27,
    "BloodPressure": 140,
    "Hemoglobin": 13.5,
    "predicted_disease": "Type 2 Diabetes"
  }'
```

## 🔧 Frontend Integration

```javascript
const API_BASE_URL = 'https://your-space.hf.space';

// Signup
const signupResponse = await fetch(`${API_BASE_URL}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
});
const { data } = await signupResponse.json();
localStorage.setItem('token', data.token);

// Protected Request
const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **Motor** - Async MongoDB driver
- **Python-JOSE** - JWT token handling
- **Passlib** - Password hashing with bcrypt
- **Pydantic** - Data validation

### AI/ML
- **Google Gemini AI** - OCR and image analysis
- **Groq** - Fast LLM inference for predictions

### Database
- **MongoDB** - NoSQL database for user data

### Server
- **Uvicorn** - ASGI server
- **Docker** - Containerization

## 🔒 Security Features

- ✅ Bcrypt password hashing
- ✅ JWT token-based authentication
- ✅ Password complexity validation (uppercase, lowercase, number, min 6 chars)
- ✅ Email format validation
- ✅ Token expiration (30 days default)
- ✅ Protected routes with Bearer token
- ✅ Account status checking (active/inactive)
- ✅ HTTPS only (provided by Hugging Face)

## 📖 Documentation

For detailed deployment instructions, see:
- **[Complete Deployment Guide](AUTH_DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Quick Setup Checklist](QUICK_SETUP.md)** - Quick reference for deployment

## 🤝 Support

For issues or questions:
- Check the [Deployment Guide](AUTH_DEPLOYMENT_GUIDE.md)
- Visit [FastAPI Documentation](https://fastapi.tiangolo.com/)
- Visit [MongoDB Documentation](https://www.mongodb.com/docs/)

## 📄 License

MIT License
