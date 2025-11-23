from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime, timezone

class UserCreatePayload(BaseModel):
    user_id: str
    username: str
    role: str

class UserUpdatePayload(BaseModel):
    user_id: str
    glucose: Optional[float] = None
    cholesterol: Optional[float] = None
    hemoglobin: Optional[float] = None
    platelets: Optional[float] = None
    white_blood_cells: Optional[float] = None
    red_blood_cells: Optional[float] = None
    hematocrit: Optional[float] = None
    mean_corpuscular_volume: Optional[float] = None
    mean_corpuscular_hemoglobin: Optional[float] = None
    mean_corpuscular_hemoglobin_concentration: Optional[float] = None
    insulin: Optional[float] = None
    bmi: Optional[float] = None
    systolic_blood_pressure: Optional[float] = None
    diastolic_blood_pressure: Optional[float] = None
    triglycerides: Optional[float] = None
    hba1c: Optional[float] = None
    ldl_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    alt: Optional[float] = None
    ast: Optional[float] = None
    heart_rate: Optional[float] = None
    creatinine: Optional[float] = None
    troponin: Optional[float] = None
    c_reactive_protein: Optional[float] = None
    disease: Optional[str] = None
    reason: str = Field(..., description="Audit reason for this update")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# --- NEW MODEL ---
class UserLatestStateResponse(BaseModel):
    status: bool
    latest_block: Dict[str, Any]