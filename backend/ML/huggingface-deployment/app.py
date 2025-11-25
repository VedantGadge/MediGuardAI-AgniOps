import os
import json
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel, Field
import requests
import tempfile
from typing import Dict, Any
from dotenv import load_dotenv

# ------------------------------
# CONFIG
# ------------------------------
# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

# ------------------------------
# FASTAPI APP CONFIGURATION
# ------------------------------
app = FastAPI(
    title="MediGuardAI - Medical Analysis API",
    description="OCR extraction and LLM-based medical prediction using Gemini AI and Groq",
    version="2.0.0"
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
# PYDANTIC MODELS
# ------------------------------
class InputData(BaseModel):
    # All features are optional with default value of 0
    # Using Field aliases to accept both underscore and space-separated names
    Glucose: float = Field(default=0, alias="Glucose")
    Troponin: float = Field(default=0, alias="Troponin")
    BMI: float = Field(default=0, alias="BMI")
    BloodPressure: float = Field(default=0, alias="BloodPressure")
    Hemoglobin: float = Field(default=0, alias="Hemoglobin")
    Cholesterol: float = Field(default=0, alias="Cholesterol")
    Platelets: float = Field(default=0, alias="Platelets")
    White_Blood_Cells: float = Field(default=0, alias="White Blood Cells")
    Red_Blood_Cells: float = Field(default=0, alias="Red Blood Cells")
    Hematocrit: float = Field(default=0, alias="Hematocrit")
    Mean_Corpuscular_Volume: float = Field(default=0, alias="Mean Corpuscular Volume")
    Mean_Corpuscular_Hemoglobin: float = Field(default=0, alias="Mean Corpuscular Hemoglobin")
    Mean_Corpuscular_Hemoglobin_Concentration: float = Field(default=0, alias="Mean Corpuscular Hemoglobin Concentration")
    Insulin: float = Field(default=0, alias="Insulin")
    Systolic_Blood_Pressure: float = Field(default=0, alias="Systolic Blood Pressure")
    Diastolic_Blood_Pressure: float = Field(default=0, alias="Diastolic Blood Pressure")
    Triglycerides: float = Field(default=0, alias="Triglycerides")
    HbA1c: float = Field(default=0, alias="HbA1c")
    LDL_Cholesterol: float = Field(default=0, alias="LDL Cholesterol")
    HDL_Cholesterol: float = Field(default=0, alias="HDL Cholesterol")
    ALT: float = Field(default=0, alias="ALT")
    AST: float = Field(default=0, alias="AST")
    Heart_Rate: float = Field(default=0, alias="Heart Rate")
    Creatinine: float = Field(default=0, alias="Creatinine")
    C_reactive_Protein: float = Field(default=0, alias="C-reactive Protein")
    predicted_disease: str
    
    class Config:
        populate_by_name = True  # Allow both field name and alias

FEATURES = [
    "Glucose",
    "Troponin",
    "BMI",
    "BloodPressure",   # keeping your original field
    "Hemoglobin",
    "Cholesterol",
    "Platelets",
    "White Blood Cells",
    "Red Blood Cells",
    "Hematocrit",
    "Mean Corpuscular Volume",
    "Mean Corpuscular Hemoglobin",
    "Mean Corpuscular Hemoglobin Concentration",
    "Insulin",
    "Systolic Blood Pressure",
    "Diastolic Blood Pressure",
    "Triglycerides",
    "HbA1c",
    "LDL Cholesterol",
    "HDL Cholesterol",
    "ALT",
    "AST",
    "Heart Rate",
    "Creatinine",
    "C-reactive Protein"
]

class ReportRequest(BaseModel):
    predicted_disease: str
    top_contributing_factors: list[Dict[str, Any]]


# ------------------------------
# OCR HELPER FUNCTIONS
# ------------------------------
def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

async def extract_medical_data(image_path: str) -> tuple[Dict[str, Any] | None, str | None]:
    """Extract medical data from image using Gemini AI"""
    try:
        img = Image.open(image_path)

        prompt = f"""
        Analyze this medical report image and extract biomedical parameters.
        
        Map the extracted parameters to ONLY these standardized feature names:
        {json.dumps(FEATURES, indent=2)}
        
        Instructions:
        1. Extract values from the medical report image
        2. Map each extracted parameter to the closest matching feature name from the list above
        3. Use your medical knowledge to match parameters (e.g., "Blood Sugar" → "Glucose", "WBC" → "White Blood Cells")
        4. If a parameter from the image doesn't clearly map to any feature in the list, skip it
        5. For features not found in the image, set value to "0", unit to "", and reference_range to ""
        6. Return ALL features from the list, whether found in the image or not
        
        Return the data matching this EXACT JSON schema:
        {{
          "parameters": [
            {{
              "parameter_name": "Glucose",
              "value": "extracted_value_or_0",
              "unit": "unit_or_empty_string",
              "reference_range": "range_or_empty_string"
            }},
            ... (include all {len(FEATURES)} features)
          ],
          "patient_info": {{
            "name": "str_or_empty",
            "age": "str_or_empty",
            "gender": "str_or_empty",
            "date": "str_or_empty"
          }}
        }}
        
        IMPORTANT: 
        - parameter_name must EXACTLY match one of the feature names from the list
        - Include ALL {len(FEATURES)} features in the parameters array
        - Set missing values to "0" (as string), not null or undefined
        """

        response = model.generate_content([prompt, img])
        response_text = response.text
        
        # Parse JSON
        data = json.loads(response_text)
        return data, None
    
    except Exception as e:
        return None, str(e)

# ------------------------------
# LLM HELPER FUNCTIONS
# ------------------------------
def get_top_shap_features(data: InputData):
    """
    Calculate SHAP-like feature importance based on feature values
    Returns top 3 contributing features
    Handles both normalized (0-1) and raw medical values
    """
    # Convert input data to dictionary
    feature_values = {
        "Glucose": data.Glucose,
        "Troponin": data.Troponin,
        "BMI": data.BMI,
        "BloodPressure": data.BloodPressure,
        "Hemoglobin": data.Hemoglobin,
        "Cholesterol": data.Cholesterol,
        "Platelets": data.Platelets,
        "White Blood Cells": data.White_Blood_Cells,
        "Red Blood Cells": data.Red_Blood_Cells,
        "Hematocrit": data.Hematocrit,
        "Mean Corpuscular Volume": data.Mean_Corpuscular_Volume,
        "Mean Corpuscular Hemoglobin": data.Mean_Corpuscular_Hemoglobin,
        "Mean Corpuscular Hemoglobin Concentration": data.Mean_Corpuscular_Hemoglobin_Concentration,
        "Insulin": data.Insulin,
        "Systolic Blood Pressure": data.Systolic_Blood_Pressure,
        "Diastolic Blood Pressure": data.Diastolic_Blood_Pressure,
        "Triglycerides": data.Triglycerides,
        "HbA1c": data.HbA1c,
        "LDL Cholesterol": data.LDL_Cholesterol,
        "HDL Cholesterol": data.HDL_Cholesterol,
        "ALT": data.ALT,
        "AST": data.AST,
        "Heart Rate": data.Heart_Rate,
        "Creatinine": data.Creatinine,
        "C-reactive Protein": data.C_reactive_Protein
    }
    
    # Check if values are normalized (0-1 range) or raw
    # If most non-zero values are between 0 and 1, treat as normalized
    non_zero_values = [v for v in feature_values.values() if v != 0]
    is_normalized = False
    if non_zero_values:
        is_normalized = all(0 <= v <= 1 for v in non_zero_values)
    
    # Calculate mock SHAP contributions based on deviation from normal ranges
    mock_shap = {}
    
    # Normal ranges (simplified)
    normal_ranges = {
        "Glucose": (70, 100),
        "Troponin": (0, 0.04),
        "BMI": (18.5, 24.9),
        "BloodPressure": (90, 120),
        "Hemoglobin": (12, 16),
        "Cholesterol": (125, 200),
        "Platelets": (150, 400),
        "White Blood Cells": (4, 11),
        "Red Blood Cells": (4.5, 5.5),
        "Hematocrit": (36, 48),
        "Mean Corpuscular Volume": (80, 100),
        "Mean Corpuscular Hemoglobin": (27, 33),
        "Mean Corpuscular Hemoglobin Concentration": (32, 36),
        "Insulin": (2.6, 24.9),
        "Systolic Blood Pressure": (90, 120),
        "Diastolic Blood Pressure": (60, 80),
        "Triglycerides": (0, 150),
        "HbA1c": (4, 5.6),
        "LDL Cholesterol": (0, 100),
        "HDL Cholesterol": (40, 60),
        "ALT": (7, 56),
        "AST": (10, 40),
        "Heart Rate": (60, 100),
        "Creatinine": (0.6, 1.2),
        "C-reactive Protein": (0, 3)
    }
    
    # Calculate contributions
    if is_normalized:
        # If normalized (0-1), treat values as direct importance scores
        for feature, value in feature_values.items():
            mock_shap[feature] = value
    else:
        # Calculate contribution based on deviation from normal ranges
        for feature, value in feature_values.items():
            if value == 0:
                mock_shap[feature] = 0
                continue
                
            if feature in normal_ranges:
                low, high = normal_ranges[feature]
                mid = (low + high) / 2
                
                if value < low:
                    # Below normal range
                    contribution = (low - value) / low
                elif value > high:
                    # Above normal range
                    contribution = (value - high) / high
                else:
                    # Within normal range
                    contribution = abs(value - mid) / mid * 0.1
                
                mock_shap[feature] = contribution
            else:
                mock_shap[feature] = 0
    
    # Sort by absolute contribution and get top 3 (excluding zeros)
    non_zero_features = {k: v for k, v in mock_shap.items() if v != 0}
    sorted_features = sorted(non_zero_features.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
    
    top3 = []
    for feature, contribution in sorted_features:
        top3.append({
            "feature": feature,
            "contribution": float(contribution)
        })

    return top3

def get_llm_explanation(prediction: str, top3: list):
    """Get LLM explanation using Groq API"""
    url = "https://api.groq.com/openai/v1/chat/completions"

    # Format feature text
    features_text = "\n".join([
        f"- {f['feature']} (SHAP contribution: {f['contribution']:.3f})"
        for f in top3
    ])

    # STRICT prompt — LLM **cannot guess diseases**
    prompt = f"""
You are an assistant generating an explanation for a prediction made by a medical ML model.
Do NOT predict or assume any disease beyond what is given.
Do NOT suggest diagnoses. 
Only explain why the model may have produced this output based on the top features.
Predicted Disease: {prediction}
Top contributing features influencing this prediction:
{features_text}
Write a clear 3–4 line explanation describing how these features led the model to this prediction. 
Use simple, clinician-friendly language. Do NOT add any new conditions or speculate beyond the given data.
"""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5
    }

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response_json = response.json()
        
        # Check for API errors
        if "error" in response_json:
            return f"API Error: {response_json['error'].get('message', 'Unknown error')}"
        
        # Check if response has expected structure
        if "choices" not in response_json:
            return f"Unexpected API response: {response_json}"
        
        explanation = response_json["choices"][0]["message"]["content"]
        return explanation.strip()
    
    except Exception as e:
        return f"Error calling Groq API: {str(e)}"

def generate_medical_report(prediction: str, top3: list):
    """Generate comprehensive 3-paragraph medical report using Groq API"""
    url = "https://api.groq.com/openai/v1/chat/completions"

    # Format feature text
    features_text = "\n".join([
        f"- {f['feature']}: {f['contribution']:.3f}"
        for f in top3
    ])

    prompt = f"""
You are a medical report writer. Generate a comprehensive 3-paragraph medical report based on the following information:

Predicted Disease: {prediction}

Top Contributing Factors:
{features_text}

Write exactly 3 paragraphs following this structure:

Paragraph 1 (Clinical Analysis): 
Write a clinical analysis explaining why the patient has been diagnosed with {prediction} based on the top contributing factors listed above. Use professional medical terminology and explain how these specific biomarkers correlate with this condition.

Paragraph 2 (Etiology and Pathophysiology): 
Explain the underlying causes, risk factors, and pathophysiological mechanisms that lead to {prediction}. Discuss how the contributing factors identified above play a role in the disease progression.

Paragraph 3 (Recommendations and Management): 
Provide evidence-based clinical recommendations, lifestyle modifications, treatment approaches, and preventive measures specific to {prediction}. Include both pharmacological and non-pharmacological interventions appropriate for the contributing factors identified.

Requirements:
- Use professional, clinical language suitable for medical documentation
- Be specific to the disease and contributing factors mentioned
- Each paragraph should be 4-6 sentences long
- Do NOT add disclaimers or suggest consulting doctors (assume this is for clinical use)
- Focus on factual medical information
"""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.6,
        "max_tokens": 1500
    }

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=45)
        response_json = response.json()
        
        # Check for API errors
        if "error" in response_json:
            return None, f"API Error: {response_json['error'].get('message', 'Unknown error')}"
        
        # Check if response has expected structure
        if "choices" not in response_json:
            return None, f"Unexpected API response: {response_json}"
        
        report_content = response_json["choices"][0]["message"]["content"]
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in report_content.split('\n\n') if p.strip()]
        
        # Ensure we have exactly 3 paragraphs
        if len(paragraphs) < 3:
            # If we get fewer paragraphs, try splitting by single newlines
            paragraphs = [p.strip() for p in report_content.split('\n') if p.strip() and len(p.strip()) > 50]
        
        # Take first 3 substantial paragraphs
        final_paragraphs = paragraphs[:3] if len(paragraphs) >= 3 else paragraphs
        
        report_data = {
            "clinical_analysis": final_paragraphs[0] if len(final_paragraphs) > 0 else "",
            "etiology_pathophysiology": final_paragraphs[1] if len(final_paragraphs) > 1 else "",
            "recommendations": final_paragraphs[2] if len(final_paragraphs) > 2 else "",
            "full_report": "\n\n".join(final_paragraphs)
        }
        
        return report_data, None
    
    except Exception as e:
        return None, f"Error calling Groq API: {str(e)}"

# ------------------------------
# API ENDPOINTS - OCR
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

# ------------------------------
# API ENDPOINTS - LLM PREDICTION
# ------------------------------
@app.post("/api/predict")
def predict(data: InputData):
    """
    Get medical prediction with explanation
    
    - **data**: Patient parameters and predicted disease
    
    Returns: Prediction with confidence, top features, and LLM explanation
    """
    try:
        # Use the disease passed directly for testing
        prediction = data.predicted_disease
        
        # Mock confidence for testing
        confidence = 0.85

        # Get top 3 features
        top3 = get_top_shap_features(data)

        # LLM explanation
        explanation = get_llm_explanation(prediction, top3)

        return {
            "success": True,
            "prediction": prediction,
            "confidence": confidence,
            "top_features": top3,
            "explanation": explanation
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/report")
def generate_report(data: ReportRequest):
    """
    Generate comprehensive 3-paragraph medical report
    
    - **predicted_disease**: The predicted disease/condition
    - **top_contributing_factors**: List of top contributing factors with their contributions
    
    Returns: Three-paragraph medical report with clinical analysis, etiology, and recommendations
    """
    try:
        # Validate input
        if not data.predicted_disease:
            raise HTTPException(status_code=400, detail="predicted_disease is required")
        
        if not data.top_contributing_factors or len(data.top_contributing_factors) == 0:
            raise HTTPException(status_code=400, detail="top_contributing_factors must contain at least one factor")
        
        # Generate report using Groq API
        report_data, error = generate_medical_report(
            data.predicted_disease,
            data.top_contributing_factors
        )
        
        if error:
            raise HTTPException(status_code=500, detail=error)
        
        return {
            "success": True,
            "predicted_disease": data.predicted_disease,
            "top_contributing_factors": data.top_contributing_factors,
            "report": report_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------
# HEALTH CHECK ENDPOINTS
# ------------------------------
@app.get('/api/ocr/health')
async def ocr_health_check():
    """OCR Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            'success': True,
            'message': 'OCR API is running',
            'model': 'gemini-2.5-flash'
        }
    )

@app.get('/api/predict/health')
async def llm_health_check():
    """LLM Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            'success': True,
            'message': 'LLM Prediction API is running',
            'model': 'llama-3.3-70b-versatile'
        }
    )

@app.get('/')
async def root():
    """Root endpoint with API information"""
    return JSONResponse(
        status_code=200,
        content={
            'success': True,
            'message': 'MediGuardAI - Medical Analysis API',
            'version': '2.0.0',
            'endpoints': {
                'ocr_extract': '/api/ocr/extract (POST)',
                'ocr_health': '/api/ocr/health (GET)',
                'predict': '/api/predict (POST)',
                'predict_health': '/api/predict/health (GET)',
                'report': '/api/report (POST)',
                'docs': '/docs (Interactive API documentation)'
            }
        }
    )

# ------------------------------
# RUN SERVER
# ------------------------------
if __name__ == '__main__':
    import uvicorn
    
    print("=" * 60)
    print("MediGuardAI - Medical Analysis API")
    print("=" * 60)
    print("\nMedical Analysis Endpoints:")
    print("  POST /api/ocr/extract        - Extract medical data from image")
    print("  GET  /api/ocr/health         - OCR health check")
    print("  POST /api/predict            - Get medical prediction with explanation")
    print("  GET  /api/predict/health     - LLM health check")
    print("  POST /api/report             - Generate comprehensive medical report")
    print("\nDocumentation:")
    print("  GET  /docs                   - Interactive API documentation")
    print("  GET  /redoc                  - Alternative API documentation")
    print("=" * 60)
    
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host='0.0.0.0', port=port)
