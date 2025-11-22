from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import shap
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# -------------------- Load Model & SHAP --------------------
# Commented out for testing without model
# model = joblib.load("model.pkl")
# explainer = shap.TreeExplainer(model)

FEATURES = ["Glucose", "Troponin", "BMI", "BloodPressure", "Hemoglobin"]  # add all 24


# -------------------- FastAPI --------------------
app = FastAPI()


class InputData(BaseModel):
    Glucose: float
    Troponin: float
    BMI: float
    BloodPressure: float
    Hemoglobin: float
    predicted_disease: str  # Pass disease directly for testing
    # add rest


# -------------------- Extract Top 3 SHAP Features --------------------
def get_top_shap_features(input_data):
    # Mock SHAP values for testing without model
    # Using absolute values to simulate feature importance
    mock_shap = {
        "Glucose": abs(input_data.Glucose - 100) * 0.01,
        "Troponin": abs(input_data.Troponin) * 10,
        "BMI": abs(input_data.BMI - 25) * 0.05,
        "BloodPressure": abs(input_data.BloodPressure - 120) * 0.02,
        "Hemoglobin": abs(input_data.Hemoglobin - 14) * 0.03
    }
    
    # Sort by absolute contribution and get top 3
    sorted_features = sorted(mock_shap.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
    
    top3 = []
    for feature, contribution in sorted_features:
        top3.append({
            "feature": feature,
            "contribution": float(contribution)
        })

    return top3


# -------------------- Groq LLM Explanation --------------------
def get_llm_explanation(prediction, top3):
    url = "https://api.groq.com/openai/v1/chat/completions"
    api_key = os.getenv("GROQ_API_KEY")

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
        "model": "openai/gpt-oss-120b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    headers = {"Authorization": f"Bearer {api_key}"}

    response = requests.post(url, json=payload, headers=headers)
    response_json = response.json()
    
    # Check if API key is missing
    if not api_key:
        return "Error: GROQ_API_KEY not found in .env file"
    
    # Check for API errors
    if "error" in response_json:
        return f"API Error: {response_json['error'].get('message', 'Unknown error')}"
    
    # Check if response has expected structure
    if "choices" not in response_json:
        return f"Unexpected API response: {response_json}"
    
    explanation = response_json["choices"][0]["message"]["content"]

    return explanation.strip()


# -------------------- Main Prediction API --------------------
@app.post("/predict")
def predict(data: InputData):

    # Use the disease passed directly for testing
    prediction = data.predicted_disease
    
    # Mock confidence for testing
    confidence = 0.85

    # Get top 3 features (mocked for testing)
    top3 = get_top_shap_features(data)

    # LLM explanation
    explanation = get_llm_explanation(prediction, top3)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "top_features": top3,
        "explanation": explanation
    }
