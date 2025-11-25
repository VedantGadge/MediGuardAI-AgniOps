# 🚀 START HERE - Deployment Quick Start

## What You Have Now

✅ **Complete API** with Authentication + ML Services  
✅ **All files ready** in `huggingface-deployment` folder  
✅ **Documentation** for every step  

## Your 30-Minute Deployment Path

### Phase 1: Prerequisites (10 min)

#### 1️⃣ MongoDB Setup
👉 Go to: https://www.mongodb.com/cloud/atlas
- Sign up/Login
- Create FREE M0 cluster
- Create database user
- Whitelist IP: `0.0.0.0/0`
- Copy connection string
- **SAVE IT!** (You need: `MONGODB_URI`)

#### 2️⃣ Generate JWT Secret
👉 Run in PowerShell:
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```
- **SAVE IT!** (You need: `JWT_SECRET`)

---

### Phase 2: Deployment (15 min)

#### 3️⃣ Create Hugging Face Space
👉 Go to: https://huggingface.co/spaces
- Click "Create new Space"
- Name: `mediguardai-complete-api`
- SDK: **Docker**
- Hardware: **CPU basic** (free)
- Click "Create Space"

#### 4️⃣ Add Secrets
👉 In your Space: Settings → Variables and secrets

Click "New secret" for each:

```
Name: GEMINI_API_KEY
Value: [Your Gemini key]

Name: GROQ_API_KEY
Value: [Your Groq key]

Name: MONGODB_URI
Value: [Your MongoDB connection string from step 1]

Name: JWT_SECRET
Value: [Your generated secret from step 2]

Name: JWT_EXPIRE
Value: 30d

Name: DB_NAME
Value: mediguard
```

#### 5️⃣ Deploy Code
👉 Run in PowerShell:

```powershell
# Replace YOUR_USERNAME and YOUR_SPACE_NAME
cd D:\temp
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cd YOUR_SPACE_NAME

# Copy files
Copy-Item "D:\MediGuardAI\MediGuardAI-AgniOps\backend\ML\huggingface-deployment\*" -Destination . -Recurse -Force

# Push
git add .
git commit -m "Deploy MediGuardAI Complete API"
git push
```

---

### Phase 3: Testing (5 min)

#### 6️⃣ Wait for Build
- Go to your Space page
- Watch logs (3-7 minutes)
- Wait for "Running" status

#### 7️⃣ Test It!
👉 Open: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/docs`

Try these in order:

1. **Test Signup**: `/api/auth/signup`
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```
   ✅ Save the token you get!

2. **Test Login**: `/api/auth/login`
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```

3. **Test Protected Route**: `/api/auth/me`
   - Click "Authorize" 🔓
   - Enter: `Bearer YOUR_TOKEN`
   - Click "Authorize"
   - Try the endpoint

4. **Test ML**: `/api/predict`
   ```json
   {
     "Glucose": 120,
     "Troponin": 0.05,
     "BMI": 27,
     "BloodPressure": 140,
     "Hemoglobin": 13.5,
     "predicted_disease": "Type 2 Diabetes"
   }
   ```

---

## ✅ Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] JWT secret generated
- [ ] Hugging Face Space created
- [ ] All 6 secrets added
- [ ] Code pushed to Space
- [ ] Build completed successfully
- [ ] Signup works
- [ ] Login works
- [ ] Protected route works
- [ ] ML endpoints work

---

## 📚 Need More Details?

| Document | When to Use |
|----------|-------------|
| `DEPLOYMENT_SUMMARY.md` | Overview of what was done |
| `AUTH_DEPLOYMENT_GUIDE.md` | Complete step-by-step guide |
| `QUICK_SETUP.md` | Detailed checklists |
| `.env.example` | Local development setup |

---

## 🆘 Having Issues?

### Build Fails?
→ Check all 6 secrets are added in Space Settings

### MongoDB Connection Error?
→ Verify IP whitelist has `0.0.0.0/0`  
→ Check password in connection string

### Auth Not Working?
→ Verify JWT_SECRET is set  
→ Check token format: `Bearer <token>`

### Need Help?
→ Open `AUTH_DEPLOYMENT_GUIDE.md` (Line-by-line instructions)

---

## 🎯 Your API URL

After deployment, your API will be at:
```
https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space
```

## 📱 Frontend Integration

Update your frontend:
```javascript
const API_BASE_URL = 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space';
```

---

## 🎉 That's It!

Follow the 7 steps above, and you'll have a fully functional API with:
- ✅ User authentication
- ✅ Medical report OCR
- ✅ AI-powered predictions
- ✅ Hosted on Hugging Face

**Total Time**: ~30 minutes  
**Cost**: $0 (all free tiers)

**Start with Step 1** ☝️
