from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class UserCreatePayload(BaseModel):
    username: str
    role: str
    metadata: Optional[Dict[str, Any]] = {}

class UserUpdatePayload(BaseModel):
    user_id: str
    updates: Dict[str, Any]
    reason: str = Field(..., description="Audit reason for this update")

# --- NEW MODEL ---
class UserLatestStateResponse(BaseModel):
    status: bool
    latest_block: Dict[str, Any]