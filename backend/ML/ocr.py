import os
import json
import pandas as pd
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv
from tkinter import Tk, filedialog
import time

# Load environment variables
load_dotenv()

# ------------------------------
# CONFIG
# ------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file.")

# ------------------------------
# FILE SELECTION
# ------------------------------
print("=" * 50)
print("Medical Report OCR with Gemini AI")
print("=" * 50)

# Create Tk root window (hidden)
root = Tk()
root.withdraw()
root.attributes('-topmost', True)

print("\nOpening file dialog...")
IMAGE_PATH = filedialog.askopenfilename(
    title="Select Medical Report Image",
    filetypes=[("Image files", "*.png *.jpg *.jpeg *.webp"), ("All files", "*.*")]
)
root.destroy()

if not IMAGE_PATH:
    print("No file selected. Exiting.")
    exit()

print(f"Selected image: {IMAGE_PATH}")

OUTPUT_DIR = os.path.join(os.path.dirname(IMAGE_PATH), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------------------
# INITIALIZE GEMINI
# ------------------------------
print("Initializing Gemini API...")
genai.configure(api_key=GEMINI_API_KEY)

# Configuration to FORCE JSON output
generation_config = {
    "temperature": 0.1,
    "response_mime_type": "application/json"
}

try:
    # Initialize model with the config
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        generation_config=generation_config
    )
    
    # ------------------------------
    # PROCESS IMAGE
    # ------------------------------
    print("Processing medical report with Gemini...")
    img = Image.open(IMAGE_PATH)

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

    # Generate content
    response = model.generate_content([prompt, img])
    
    print("✔ Analysis completed!")

    # ------------------------------
    # SAVE RESULTS
    # ------------------------------
    # With JSON mode, extracting text is much safer
    response_text = response.text
    
    # Parse JSON
    data = json.loads(response_text)

    # Save JSON
    json_path = os.path.join(OUTPUT_DIR, "medical_report_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✔ JSON saved to: {json_path}")

    # Save CSV
    if "parameters" in data and data["parameters"]:
        df = pd.DataFrame(data["parameters"])
        csv_path = os.path.join(OUTPUT_DIR, "medical_parameters.csv")
        df.to_csv(csv_path, index=False)
        
        print(f"✔ CSV saved to: {csv_path}")
        print("\n=== Extracted Parameters ===")
        print(df.to_string(index=False))
    else:
        print("❌ No parameters found in the response.")

except Exception as e:
    print(f"\n❌ ERROR OCCURRED: {e}")
    # Troubleshooting hint for the specific error you saw
    if "404" in str(e) and "models/" in str(e):
        print("\nHint: Run 'pip install -U google-generativeai' to update your library.")