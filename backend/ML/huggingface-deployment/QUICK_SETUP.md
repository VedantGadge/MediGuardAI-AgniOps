# Quick Setup Checklist for Hugging Face Deployment

## Pre-Deployment Checklist

### ☐ 1. Get API Keys

- [ ] **GEMINI_API_KEY** from https://makersuite.google.com/app/apikey
- [ ] **GROQ_API_KEY** from https://console.groq.com/

### ☐ 2. Set Up MongoDB Atlas

- [ ] Create account at https://www.mongodb.com/cloud/atlas
- [ ] Create free M0 cluster
- [ ] Create database user (save username and password)
- [ ] Whitelist IP: 0.0.0.0/0 (allow all)
- [ ] Copy connection string (replace `<password>`)
- [ ] **Save MONGODB_URI**

### ☐ 3. Generate JWT Secret

Run in PowerShell:
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```
- [ ] **Save JWT_SECRET**

---

## Deployment Steps

### ☐ 4. Create Hugging Face Space

1. [ ] Go to https://huggingface.co/spaces
2. [ ] Click "Create new Space"
3. [ ] Name: `mediguardai-complete-api`
4. [ ] SDK: **Docker**
5. [ ] Hardware: **CPU basic**
6. [ ] Click "Create Space"

### ☐ 5. Configure Secrets in Hugging Face

Go to Space → Settings → Variables and secrets

Add these secrets (click "New secret" for each):

- [ ] `GEMINI_API_KEY` = your_gemini_key
- [ ] `GROQ_API_KEY` = your_groq_key
- [ ] `MONGODB_URI` = your_mongodb_connection_string
- [ ] `JWT_SECRET` = your_generated_jwt_secret
- [ ] `JWT_EXPIRE` = `30d`
- [ ] `DB_NAME` = `mediguard`

### ☐ 6. Deploy Code

```powershell
# Clone your space
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cd YOUR_SPACE_NAME

# Copy files
Copy-Item "D:\MediGuardAI\MediGuardAI-AgniOps\backend\ML\huggingface-deployment\*" -Destination . -Recurse -Force

# Push to Hugging Face
git add .
git commit -m "Deploy MediGuardAI Complete API"
git push
```

### ☐ 7. Wait for Build

- [ ] Monitor build logs (3-7 minutes)
- [ ] Wait for "Running" status
- [ ] Check for "MongoDB Connected" in logs

---

## Testing Checklist

### ☐ 8. Test Authentication Endpoints

Your API URL: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`

#### Test Signup:
```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/signup" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```
- [ ] Signup works
- [ ] Received token
- [ ] **Save the token**

#### Test Login:
```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```
- [ ] Login works
- [ ] Received token

#### Test Protected Route:
```powershell
curl -X GET "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/auth/me" `
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns user info

### ☐ 9. Test ML Endpoints

#### Test Health Checks:
- [ ] `/api/auth/health` - Auth service
- [ ] `/api/ocr/health` - OCR service
- [ ] `/api/predict/health` - Prediction service

#### Test OCR (if you have a medical report image):
```powershell
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/ocr/extract" `
  -F "image=@path\to\medical_report.jpg"
```
- [ ] OCR extraction works

#### Test Prediction:
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
- [ ] Prediction works

### ☐ 10. Access Documentation

- [ ] Open `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/docs`
- [ ] Try interactive API testing

---

## Frontend Integration Checklist

### ☐ 11. Update Frontend Configuration

```javascript
// Update this in your frontend code
const API_BASE_URL = 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space';
```

- [ ] Update API_BASE_URL
- [ ] Test signup from frontend
- [ ] Test login from frontend
- [ ] Test token storage (localStorage)
- [ ] Test protected routes with token
- [ ] Test OCR upload
- [ ] Test prediction

---

## Post-Deployment Checklist

### ☐ 12. Verify Everything Works

- [ ] All authentication endpoints working
- [ ] All ML endpoints working
- [ ] Frontend integrated successfully
- [ ] Tokens being saved and used correctly
- [ ] Error handling works

### ☐ 13. Documentation

- [ ] Share API URL with team
- [ ] Document token usage for frontend
- [ ] Update README with deployment info

### ☐ 14. Monitoring

- [ ] Check Hugging Face logs regularly
- [ ] Monitor MongoDB Atlas metrics
- [ ] Track API usage (Gemini, Groq)

---

## Troubleshooting Quick Fixes

### If Build Fails:
1. Check all secrets are set correctly
2. Verify requirements.txt has all dependencies
3. Check Dockerfile syntax

### If MongoDB Connection Fails:
1. Verify MONGODB_URI in secrets
2. Check IP whitelist includes 0.0.0.0/0
3. Test connection string locally

### If Auth Not Working:
1. Check JWT_SECRET is set
2. Verify token format: `Bearer <token>`
3. Check token hasn't expired

### If ML APIs Not Working:
1. Check GEMINI_API_KEY and GROQ_API_KEY
2. Verify API key limits not exceeded
3. Check logs for specific errors

---

## Your Deployment Info

**Fill this out for quick reference:**

- **Space URL**: `https://_______________-_______________.hf.space`
- **MongoDB Cluster**: `_____________________________`
- **Deployment Date**: `_____________________________`
- **Team Members**: `_____________________________`

---

## Support

- Full Guide: See `AUTH_DEPLOYMENT_GUIDE.md`
- Hugging Face Docs: https://huggingface.co/docs/hub/spaces
- FastAPI Docs: https://fastapi.tiangolo.com/
- MongoDB Docs: https://www.mongodb.com/docs/

---

## Success Criteria

✅ All authentication endpoints working  
✅ All ML endpoints working  
✅ Frontend successfully integrated  
✅ No errors in logs  
✅ Users can signup, login, and use app  

## Congratulations! 🎉

Your MediGuardAI Complete API is now live!
