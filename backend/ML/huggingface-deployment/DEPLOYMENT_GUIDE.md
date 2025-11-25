# Hugging Face Spaces Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prerequisites
- Hugging Face account (sign up at https://huggingface.co/)
- GEMINI_API_KEY (from Google AI Studio: https://makersuite.google.com/app/apikey)
- GROQ_API_KEY (from Groq Console: https://console.groq.com/)
- Git installed on your machine

### 2. Create a New Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in the details:
   - **Space name**: `mediguardai-api` (or your preferred name)
   - **License**: MIT
   - **Select SDK**: Docker
   - **Hardware**: CPU basic (free tier) - should be sufficient for API serving
   - **Visibility**: Public (or Private if you prefer)
4. Click **"Create Space"**

### 3. Clone Your New Space Repository

```powershell
# Navigate to a directory where you want to clone
cd D:\temp  # or any directory you prefer

# Clone the space (replace YOUR_USERNAME and YOUR_SPACE_NAME)
git clone https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
cd YOUR_SPACE_NAME
```

### 4. Copy Deployment Files

```powershell
# Copy all files from the huggingface-deployment folder to your cloned space
Copy-Item "D:\MediGuardAI\MediGuardAI-AgniOps\backend\ML\huggingface-deployment\*" -Destination . -Recurse -Force
```

### 5. Configure Secrets (API Keys)

**IMPORTANT**: Do NOT commit API keys to the repository!

1. Go to your Space on Hugging Face website
2. Click on **"Settings"** tab
3. Scroll down to **"Repository secrets"**
4. Add the following secrets:
   - Name: `GEMINI_API_KEY`, Value: Your Google Gemini API key
   - Name: `GROQ_API_KEY`, Value: Your Groq API key
5. Click **"Add"** for each secret

### 6. Push Code to Hugging Face

```powershell
# Add all files
git add .

# Commit changes
git commit -m "Initial deployment of MediGuardAI API"

# Push to Hugging Face
git push
```

### 7. Wait for Deployment

1. Go to your Space page on Hugging Face
2. The Space will automatically build and deploy (takes 2-5 minutes)
3. You'll see build logs in real-time
4. Once deployed, you'll see "Running" status

### 8. Test Your Deployed API

Your API will be available at: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space`

#### Test OCR Endpoint:
```powershell
# Using curl (if installed) or use Postman
curl -X POST "https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/api/ocr/extract" `
  -F "image=@path\to\your\medical_report.jpg"
```

#### Test LLM Prediction Endpoint:
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

#### Access API Documentation:
- Swagger UI: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/docs`
- ReDoc: `https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space/redoc`

### 9. Frontend Integration

Update your frontend to use the deployed API URL:

```javascript
// Replace localhost with your Hugging Face Space URL
const API_BASE_URL = 'https://YOUR_USERNAME-YOUR_SPACE_NAME.hf.space';

// OCR Extract
const ocrResponse = await fetch(`${API_BASE_URL}/api/ocr/extract`, {
  method: 'POST',
  body: formData
});

// LLM Prediction
const predictionResponse = await fetch(`${API_BASE_URL}/api/predict`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 10. Updating Your Deployment

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

The Space will automatically rebuild and redeploy.

## Troubleshooting

### Build Fails
- Check build logs on the Space page
- Verify all dependencies in `requirements.txt` are correct
- Ensure Dockerfile syntax is correct

### API Returns 500 Errors
- Check if secrets (GEMINI_API_KEY, GROQ_API_KEY) are properly set
- View application logs on the Space page
- Test endpoints individually using `/docs` endpoint

### Slow Response Times
- Consider upgrading to a better hardware tier (paid)
- Optimize image processing (reduce image size before upload)
- Add caching for repeated requests

### CORS Issues
- The API is configured with `allow_origins=["*"]`
- If you need to restrict origins, modify the CORS middleware in `app.py`

## Cost Considerations

- **Hugging Face Spaces**: Free tier with CPU basic is sufficient for moderate usage
- **Google Gemini API**: Free tier with usage limits (check current rates)
- **Groq API**: Free tier available (check current rates and limits)

For production use with high traffic, consider:
- Upgrading to paid Hugging Face hardware
- Monitoring API usage and costs
- Implementing rate limiting

## Security Best Practices

1. ✅ Never commit API keys to Git
2. ✅ Use Hugging Face Secrets for sensitive data
3. ✅ Keep dependencies updated
4. ✅ Monitor API usage and set up alerts
5. ✅ Use HTTPS only (automatically provided by Hugging Face)
6. ✅ Implement rate limiting for production use
7. ✅ Add authentication if handling sensitive medical data

## Support

- Hugging Face Docs: https://huggingface.co/docs/hub/spaces
- FastAPI Docs: https://fastapi.tiangolo.com/
- Issues: Report on GitHub repository

## Next Steps

1. ✅ Deploy to Hugging Face Spaces
2. ✅ Test all endpoints
3. ✅ Update frontend with deployed API URL
4. ⬜ Set up monitoring and logging
5. ⬜ Implement authentication for production
6. ⬜ Add rate limiting
7. ⬜ Consider scaling options for high traffic
