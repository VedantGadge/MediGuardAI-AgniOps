# MediGuardAI - Complete API Deployment Guide (Auth + ML)

## Overview

This deployment includes both **Authentication Service** and **ML Services** (OCR + Prediction) in a single unified API on Hugging Face Spaces.

### Features Included:
✅ User Registration (Signup)  
✅ User Login (JWT-based)  
✅ Protected Routes (Get Current User)  
✅ Medical Report OCR Extraction  
✅ AI-Powered Disease Prediction  

---

## Prerequisites

Before deployment, ensure you have:

1. **Hugging Face Account** - Sign up at https://huggingface.co/
2. **MongoDB Atlas Account** - Free cluster at https://www.mongodb.com/cloud/atlas
3. **API Keys**:
   - `GEMINI_API_KEY` - From Google AI Studio: https://makersuite.google.com/app/apikey
   - `GROQ_API_KEY` - From Groq Console: https://console.groq.com/
4. **Git** installed on your machine

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Click **"Create a New Cluster"**
4. Select **"Free Shared Cluster"** (M0 Sandbox)
5. Choose cloud provider and region (preferably close to your location)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.2 Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `mediguard_user`
5. Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Set role: **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is necessary for Hugging Face to connect
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **"Python"** and version **"3.12 or later"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://mediguard_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the password you saved earlier
7. **SAVE THIS CONNECTION STRING** - you'll need it for Hugging Face secrets

---

## Step 2: Generate JWT Secret

You need a secure random string for JWT token signing.

### Option A: Using PowerShell (Windows)
```powershell
# Generate a secure random JWT secret
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### Option B: Using Python
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**SAVE THIS JWT SECRET** - you'll need it for Hugging Face secrets.

---

## Step 3: Create Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in the details:
   - **Space name**: `mediguardai-complete-api` (or your preferred name)
   - **License**: MIT
   - **Select SDK**: Docker
   - **Hardware**: CPU basic (free tier)
   - **Visibility**: Public (or Private if you prefer)
4. Click **"Create Space"**

---

## Step 4: Configure Hugging Face Secrets

**IMPORTANT**: Do NOT commit sensitive keys to the repository!

1. Go to your Space on Hugging Face website
2. Click on **"Settings"** tab
3. Scroll down to **"Variables and secrets"** section
4. Click **"New secret"** for each of the following:

| Secret Name | Value | Source |
|------------|-------|--------|
| `GEMINI_API_KEY` | Your Gemini API key | Google AI Studio |
| `GROQ_API_KEY` | Your Groq API key | Groq Console |
| `MONGODB_URI` | Your MongoDB connection string | MongoDB Atlas |
| `JWT_SECRET` | Your generated JWT secret | Step 2 above |
| `JWT_EXPIRE` | `30d` | Token expiration (30 days) |
| `DB_NAME` | `mediguard` | Database name |

5. Click **"Save"** for each secret

---

## Step 5: Clone Your Space Repository

```powershell
# Navigate to a directory where you want to clone
cd D:\temp  # or any directory you prefer

# Clone the space (replace YOUR_USERNAME and YOUR_SPACE_NAME)
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cd YOUR_SPACE_NAME
```

---

## Step 6: Copy Deployment Files

```powershell
# Copy all files from the huggingface-deployment folder to your cloned space
Copy-Item "D:\MediGuardAI\MediGuardAI-AgniOps\backend\ML\huggingface-deployment\*" -Destination . -Recurse -Force
```

Your directory should now contain:
- `app.py` (main application with auth + ML)
- `requirements.txt` (all dependencies)
- `Dockerfile` (Docker configuration)
- `README.md` (space documentation)
- Other supporting files

---

## Step 7: Push Code to Hugging Face

```powershell
# Add all files
git add .

# Commit changes
git commit -m "Deploy MediGuardAI Complete API with Authentication"

# Push to Hugging Face
git push
```

---

## Step 8: Monitor Deployment

1. Go to your Space page on Hugging Face
2. The Space will automatically build and deploy (takes 3-7 minutes)
3. Watch the build logs in real-time
4. Look for:
   - ✅ "MongoDB Connected"
   - ✅ "Application startup complete"
   - ✅ "Running" status

If you see any errors, check:
- All secrets are correctly set
- MongoDB Atlas IP whitelist includes 0.0.0.0/0
- MongoDB connection string is correct

---

## Step 9: Test Your Deployed API

Your API will be available at: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`

### 9.1 Access API Documentation

Visit: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/docs`

This provides interactive Swagger UI to test all endpoints.

### 9.2 Test Authentication Endpoints

#### A. Sign Up (Register New User)

```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/signup" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

Expected Response:
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

**SAVE THE TOKEN** - you'll need it for protected routes!

#### B. Log In (Existing User)

```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

#### C. Get Current User (Protected Route)

```powershell
# Replace YOUR_TOKEN with the token from signup/login response
curl -X GET "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/me" `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 9.3 Test Medical Analysis Endpoints

#### A. OCR Extract (Medical Report)

```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/ocr/extract" `
  -F "image=@path\to\your\medical_report.jpg"
```

#### B. Disease Prediction

```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/predict" `
  -H "Content-Type: application/json" `
  -d '{
    "Glucose": 120,
    "Troponin": 0.05,
    "BMI": 27,
    "BloodPressure": 140,
    "Hemoglobin": 13.5,
    "predicted_disease": "Type 2 Diabetes"
  }'
```

### 9.4 Health Checks

```powershell
# Auth service health
curl "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/health"

# OCR service health
curl "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/ocr/health"

# Prediction service health
curl "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/predict/health"
```

---

## Step 10: Frontend Integration

Update your frontend to use the deployed API:

```javascript
// Configuration
const API_BASE_URL = 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space';

// 1. User Signup
async function signup(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token to localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
  }
  
  return data;
}

// 2. User Login
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token to localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
  }
  
  return data;
}

// 3. Get Current User (Protected)
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 4. OCR Extract
async function extractMedicalData(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/api/ocr/extract`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// 5. Disease Prediction
async function predictDisease(medicalData) {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(medicalData)
  });
  
  return await response.json();
}

// 6. Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
```

---

## Step 11: Updating Your Deployment

When you need to update the API:

```powershell
# Navigate to your space directory
cd D:\temp\YOUR_SPACE_NAME

# Make changes to app.py or other files

# Commit and push
git add .
git commit -m "Update: description of changes"
git push
```

The Space will automatically rebuild and redeploy (takes 3-7 minutes).

---

## API Endpoints Summary

### Authentication Endpoints
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/signup` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/auth/me` | GET | Yes (Bearer Token) | Get current user info |
| `/api/auth/health` | GET | No | Auth service health check |

### Medical Analysis Endpoints
| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/ocr/extract` | POST | No | Extract data from medical report |
| `/api/ocr/health` | GET | No | OCR service health check |
| `/api/predict` | POST | No | Get disease prediction with explanation |
| `/api/predict/health` | GET | No | Prediction service health check |

### Documentation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/docs` | GET | Interactive Swagger UI |
| `/redoc` | GET | Alternative documentation |

---

## Security Best Practices

1. ✅ **Never commit API keys to Git** - Use Hugging Face Secrets
2. ✅ **Use strong JWT secrets** - At least 32 characters
3. ✅ **Password requirements** - Uppercase, lowercase, number, min 6 chars
4. ✅ **HTTPS only** - Automatically provided by Hugging Face
5. ✅ **MongoDB IP whitelist** - Required for Hugging Face connection
6. ✅ **Token expiration** - Tokens expire after 30 days by default
7. ✅ **Bcrypt password hashing** - Industry-standard password security

### For Production Use, Consider:
- [ ] Rate limiting on endpoints
- [ ] Email verification for new users
- [ ] Password reset functionality
- [ ] Admin role management
- [ ] Audit logging
- [ ] CORS restrictions (currently allows all origins)
- [ ] Input validation and sanitization
- [ ] DDoS protection

---

## Troubleshooting

### Build Fails
- **Check build logs** on the Space page
- **Verify dependencies** in `requirements.txt`
- **Check Dockerfile** syntax

### MongoDB Connection Fails
- **Verify MONGODB_URI** is correctly set in secrets
- **Check IP whitelist** includes 0.0.0.0/0
- **Test connection string** locally first
- **Ensure password** in connection string is URL-encoded

### Authentication Not Working
- **Check JWT_SECRET** is set in secrets
- **Verify token format** in Authorization header: `Bearer <token>`
- **Check token expiration** - tokens expire after 30 days
- **Ensure MongoDB** connection is successful

### API Returns 500 Errors
- **Check secrets** (GEMINI_API_KEY, GROQ_API_KEY, etc.)
- **View application logs** on Space page
- **Test endpoints individually** using `/docs`

### CORS Issues
- API configured with `allow_origins=["*"]`
- For production, restrict to your domain:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://yourdomain.com"],
      ...
  )
  ```

---

## Cost Considerations

### Free Tier Services:
- ✅ **Hugging Face Spaces** - CPU basic (sufficient for moderate usage)
- ✅ **MongoDB Atlas** - 512 MB storage (M0 Sandbox)
- ✅ **Google Gemini API** - Free tier with usage limits
- ✅ **Groq API** - Free tier available

### For Production with High Traffic:
- Hugging Face: Upgrade to paid hardware (GPU/better CPU)
- MongoDB Atlas: Upgrade to M10+ cluster
- Monitor API usage and costs
- Implement caching strategies
- Consider CDN for static assets

---

## Monitoring and Maintenance

### Check API Health:
```powershell
# Quick health check all services
curl "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/health"
curl "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/ocr/health"
curl "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/predict/health"
```

### View Logs:
1. Go to your Space page
2. Click on "Logs" tab
3. Monitor for errors or warnings

### Database Monitoring:
1. Go to MongoDB Atlas dashboard
2. Check "Metrics" tab
3. Monitor connections, operations, storage

---

## Support and Resources

- **Hugging Face Docs**: https://huggingface.co/docs/hub/spaces
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **MongoDB Docs**: https://www.mongodb.com/docs/
- **JWT.io**: https://jwt.io/ (for debugging tokens)
- **Issues**: Report on GitHub repository

---

## Next Steps Checklist

- [x] Deploy to Hugging Face Spaces
- [x] Set up MongoDB Atlas
- [x] Configure all secrets
- [x] Test all endpoints
- [ ] Update frontend with deployed API URL
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Set up monitoring alerts
- [ ] Add rate limiting
- [ ] Consider scaling options for production

---

## Quick Reference

**Your Space URL**: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`

**Replace in Frontend**:
```javascript
const API_BASE_URL = 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space';
```

**Token Storage**:
```javascript
// Save token after login/signup
localStorage.setItem('token', token);

// Use token in requests
headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
```

---

## Example Complete User Flow

1. **User signs up** → Receives token
2. **Store token** in localStorage
3. **Upload medical report** → Get extracted data
4. **Submit prediction request** → Get AI analysis
5. **Use token for protected routes** → Access user-specific data

---

## Congratulations! 🎉

Your complete MediGuardAI API with authentication is now deployed on Hugging Face Spaces!

For questions or issues, refer to the troubleshooting section or consult the documentation links provided.
