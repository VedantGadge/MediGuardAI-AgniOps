# MediGuardAI - System Architecture

## Complete API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HUGGING FACE SPACE                          │
│                  (Docker Container - Port 7860)                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              MediGuardAI FastAPI Application              │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │         AUTHENTICATION SERVICE                  │    │ │
│  │  │  • POST /api/auth/signup                        │    │ │
│  │  │  • POST /api/auth/login                         │    │ │
│  │  │  • GET  /api/auth/me (Protected)                │    │ │
│  │  │  • GET  /api/auth/health                        │    │ │
│  │  │                                                  │    │ │
│  │  │  [JWT Tokens + Bcrypt Passwords]                │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │                           │                              │ │
│  │                           ↓                              │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │         MEDICAL ANALYSIS SERVICES               │    │ │
│  │  │                                                  │    │ │
│  │  │  ┌──────────────┐    ┌──────────────┐          │    │ │
│  │  │  │ OCR Service  │    │ LLM Service  │          │    │ │
│  │  │  │              │    │              │          │    │ │
│  │  │  │ Gemini AI    │    │ Groq LLM     │          │    │ │
│  │  │  │              │    │              │          │    │ │
│  │  │  │ POST /api/   │    │ POST /api/   │          │    │ │
│  │  │  │ ocr/extract  │    │ predict      │          │    │ │
│  │  │  └──────────────┘    └──────────────┘          │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │         INTERACTIVE DOCUMENTATION               │    │ │
│  │  │  • GET  /docs     (Swagger UI)                  │    │ │
│  │  │  • GET  /redoc    (ReDoc)                       │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (TLS/SSL)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │ MongoDB      │   │ Google       │   │ Groq Cloud   │       │
│  │ Atlas        │   │ Gemini AI    │   │              │       │
│  │              │   │              │   │              │       │
│  │ User Data    │   │ OCR          │   │ Predictions  │       │
│  │ Auth Records │   │ Analysis     │   │ Explanations │       │
│  └──────────────┘   └──────────────┘   └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            ↑
                            │ API Calls
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND APPLICATION                       │
│                   (React - Port 3000)                           │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Signup    │  │   Login    │  │  Dashboard │               │
│  │  Component │  │  Component │  │  Component │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│         │                │                │                     │
│         └────────────────┴────────────────┘                     │
│                          │                                      │
│                          ↓                                      │
│              ┌────────────────────┐                             │
│              │  API Client        │                             │
│              │  (fetch/axios)     │                             │
│              │                    │                             │
│              │  JWT Token in      │                             │
│              │  localStorage      │                             │
│              └────────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Authentication Flow

```
┌──────────┐                                      ┌──────────┐
│  User    │                                      │  Backend │
│ (Client) │                                      │   API    │
└────┬─────┘                                      └────┬─────┘
     │                                                 │
     │  1. POST /api/auth/signup                      │
     │    { name, email, password }                   │
     ├──────────────────────────────────────────────→ │
     │                                                 │
     │                                            2. Hash password
     │                                            3. Save to MongoDB
     │                                            4. Generate JWT
     │                                                 │
     │  5. Return { success, token, user }            │
     │ ←──────────────────────────────────────────────┤
     │                                                 │
     │  6. Save token to localStorage                 │
     │                                                 │
     │  7. POST /api/auth/login                       │
     │    { email, password }                         │
     ├──────────────────────────────────────────────→ │
     │                                                 │
     │                                            8. Verify password
     │                                            9. Generate JWT
     │                                                 │
     │  10. Return { success, token, user }           │
     │ ←──────────────────────────────────────────────┤
     │                                                 │
     │  11. Update token in localStorage              │
     │                                                 │
     │  12. GET /api/auth/me                          │
     │     Header: Authorization: Bearer <token>      │
     ├──────────────────────────────────────────────→ │
     │                                                 │
     │                                           13. Decode token
     │                                           14. Get user from DB
     │                                                 │
     │  15. Return { success, user }                  │
     │ ←──────────────────────────────────────────────┤
     │                                                 │
```

### 2. Medical Report Analysis Flow

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  User    │                    │  Backend │                    │ External │
│ (Client) │                    │   API    │                    │ Services │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                                │                               │
     │  1. Upload medical report      │                               │
     │     (image file)               │                               │
     ├─────────────────────────────→  │                               │
     │                                │                               │
     │                                │  2. Send to Gemini AI         │
     │                                ├────────────────────────────→  │
     │                                │                               │
     │                                │                          3. OCR
     │                                │                          4. Extract
     │                                │                             params
     │                                │                               │
     │                                │  5. Return extracted data     │
     │                                │ ←────────────────────────────┤
     │                                │                               │
     │  6. Return extracted params    │                               │
     │ ←─────────────────────────────┤                               │
     │                                │                               │
     │  7. Submit for prediction      │                               │
     │     (extracted params)         │                               │
     ├─────────────────────────────→  │                               │
     │                                │                               │
     │                                │  8. Send to Groq LLM          │
     │                                ├────────────────────────────→  │
     │                                │                               │
     │                                │                          9. Analyze
     │                                │                         10. Generate
     │                                │                             explanation
     │                                │                               │
     │                                │ 11. Return prediction         │
     │                                │ ←────────────────────────────┤
     │                                │                               │
     │ 12. Return { prediction,       │                               │
     │     confidence, explanation }  │                               │
     │ ←─────────────────────────────┤                               │
     │                                │                               │
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT LAYER                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Hugging Face Spaces (Docker + GPU/CPU)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│                                                                 │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  FastAPI           │         │  Uvicorn (ASGI)    │         │
│  │  (Web Framework)   │←────────│  (Web Server)      │         │
│  └────────────────────┘         └────────────────────┘         │
│                                                                 │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  Pydantic          │         │  Python-JOSE       │         │
│  │  (Validation)      │         │  (JWT Tokens)      │         │
│  └────────────────────┘         └────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYER                           │
│                                                                 │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  Passlib + Bcrypt  │         │  CORS Middleware   │         │
│  │  (Password Hash)   │         │  (Cross-Origin)    │         │
│  └────────────────────┘         └────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                           │
│                                                                 │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  Motor             │         │  MongoDB Atlas     │         │
│  │  (Async Driver)    │←────────│  (Cloud Database)  │         │
│  └────────────────────┘         └────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          AI/ML LAYER                            │
│                                                                 │
│  ┌────────────────────┐         ┌────────────────────┐         │
│  │  Google Gemini AI  │         │  Groq LLM          │         │
│  │  (OCR + Vision)    │         │  (Predictions)     │         │
│  └────────────────────┘         └────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  1. TRANSPORT LAYER                                       │ │
│  │     • HTTPS/TLS (Enforced by Hugging Face)                │ │
│  │     • All data encrypted in transit                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  2. AUTHENTICATION LAYER                                  │ │
│  │     • JWT Tokens (HS256 algorithm)                        │ │
│  │     • Bearer Token in Authorization header                │ │
│  │     • Token expiration (30 days default)                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  3. PASSWORD SECURITY                                     │ │
│  │     • Bcrypt hashing (cost factor 12)                     │ │
│  │     • Password complexity requirements                    │ │
│  │     • No plain text storage                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  4. INPUT VALIDATION                                      │ │
│  │     • Pydantic schema validation                          │ │
│  │     • Email format validation                             │ │
│  │     • Type checking                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  5. AUTHORIZATION LAYER                                   │ │
│  │     • Protected routes via dependencies                   │ │
│  │     • User role checking                                  │ │
│  │     • Account status verification                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ↓                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  6. SECRETS MANAGEMENT                                    │ │
│  │     • Hugging Face Secrets (not in code)                  │ │
│  │     • Environment variables                               │ │
│  │     • No hardcoded credentials                            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB - mediguard Database                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Collection: users                                        │ │
│  │                                                           │ │
│  │  {                                                        │ │
│  │    "_id": ObjectId("507f1f77bcf86cd799439011"),          │ │
│  │    "name": "John Doe",                                   │ │
│  │    "email": "john.doe@example.com",    // Unique, indexed│ │
│  │    "password": "$2b$12$hashed...",     // Bcrypt hash    │ │
│  │    "role": "user",                     // user/admin     │ │
│  │    "isActive": true,                   // Account status │ │
│  │    "createdAt": ISODate("2025-11-23T..."),              │ │
│  │    "updatedAt": ISODate("2025-11-23T...")               │ │
│  │  }                                                        │ │
│  │                                                           │ │
│  │  Indexes:                                                 │ │
│  │    • email (unique)                                       │ │
│  │    • createdAt                                            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## API Response Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    STANDARD API RESPONSES                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SUCCESS RESPONSE                                         │ │
│  │                                                           │ │
│  │  {                                                        │ │
│  │    "success": true,                                      │ │
│  │    "message": "Operation successful",                    │ │
│  │    "data": { ... }                                       │ │
│  │  }                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ERROR RESPONSE                                           │ │
│  │                                                           │ │
│  │  {                                                        │ │
│  │    "success": false,                                     │ │
│  │    "message": "Error message",                           │ │
│  │    "detail": "Detailed error information"                │ │
│  │  }                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Pipeline

```
Developer                  Git Repository              Hugging Face
   │                            │                            │
   │  1. Code Changes           │                            │
   ├──────────────────────────→ │                            │
   │                            │                            │
   │  2. Git Push               │                            │
   ├──────────────────────────→ │  3. Auto Deploy           │
   │                            ├──────────────────────────→ │
   │                            │                            │
   │                            │                       4. Build Docker
   │                            │                       5. Install deps
   │                            │                       6. Start app
   │                            │                            │
   │                            │  7. Build Complete        │
   │                            │ ←──────────────────────────┤
   │                            │                            │
   │  8. Live API               │                            │
   │ ←──────────────────────────┴──────────────────────────→ │
   │                                                          │
```

This architecture provides:
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ High Availability
- ✅ Easy Deployment
