import os
import json
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from dotenv import load_dotenv
import tempfile
from typing import Dict, Any

# Load environment variables
load_dotenv()

# ------------------------------
# CONFIG
# ------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file.")

# FastAPI app configuration
app = FastAPI(
    title="Medical Report OCR API",
    description="Extract medical parameters from medical report images using Gemini AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# ------------------------------
# INITIALIZE GEMINI
# ------------------------------
genai.configure(api_key=GEMINI_API_KEY)

# Configuration to FORCE JSON output
generation_config = {
    "temperature": 0.1,
    "response_mime_type": "application/json"
}

model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    generation_config=generation_config
)

# ------------------------------
# HELPER FUNCTIONS
# ------------------------------
def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

async def extract_medical_data(image_path: str) -> tuple[Dict[str, Any] | None, str | None]:
    """Extract medical data from image using Gemini AI"""
    try:
        img = Image.open(image_path)

        prompt = """
        Analyze this medical report image and extract all biomedical parameters.
        
        Return the data matching this JSON schema:
        {
          "parameters": [
            {
              "parameter_name": "str",
              "value": "str",
              "unit": "str",
              "reference_range": "str"
            }
          ],
          "patient_info": {
            "name": "str",
            "age": "str",
            "gender": "str",
            "date": "str"
          }
        }
        """

        response = model.generate_content([prompt, img])
        response_text = response.text
        
        # Parse JSON
        data = json.loads(response_text)
        return data, None
    
    except Exception as e:
        return None, str(e)

# ------------------------------
# API ENDPOINTS
# ------------------------------
@app.post('/api/ocr/extract')
async def extract_medical_report(image: UploadFile = File(...)):
    """
    Extract medical parameters from uploaded image
    
    - **image**: Medical report image file (png, jpg, jpeg, webp)
    
    Returns: JSON with extracted parameters and patient info
    """
    # Check if file is selected
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    # Check if file type is allowed
    if not allowed_file(image.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed types: png, jpg, jpeg, webp"
        )
    
    # Check file size
    contents = await image.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds 16MB limit")
    
    try:
        # Create temporary file
        suffix = os.path.splitext(image.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(contents)
        
        # Extract medical data
        data, error = await extract_medical_data(temp_path)
        
        # Clean up temporary file
        os.unlink(temp_path)
        
        if error:
            raise HTTPException(
                status_code=500,
                detail=f'Failed to process image: {error}'
            )
        
        return JSONResponse(
            status_code=200,
            content={
                'success': True,
                'data': data
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/ocr/health')
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            'success': True,
            'message': 'OCR API is running',
            'model': 'gemini-2.5-flash'
        }
    )

@app.get('/')
async def root():
    """Root endpoint with API information"""
    return JSONResponse(
        status_code=200,
        content={
            'success': True,
            'message': 'Medical Report OCR API',
            'version': '1.0.0',
            'endpoints': {
                'extract': '/api/ocr/extract (POST)',
                'health': '/api/ocr/health (GET)',
                'docs': '/docs (Interactive API documentation)'
            }
        }
    )

# ------------------------------
# RUN SERVER
# ------------------------------
if __name__ == '__main__':
    import uvicorn
    
    print("=" * 50)
    print("Medical Report OCR API with Gemini AI (FastAPI)")
    print("=" * 50)
    print("\nEndpoints:")
    print("  POST /api/ocr/extract - Extract medical data from image")
    print("  GET  /api/ocr/health  - Health check")
    print("  GET  /docs           - Interactive API documentation")
    print("  GET  /redoc          - Alternative API documentation")
    print("=" * 50)
    
    uvicorn.run(app, host='0.0.0.0', port=5001, reload=True)
