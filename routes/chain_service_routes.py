import logging
from fastapi import APIRouter, HTTPException
from typing import List

# 1. Import Models (Added UserLatestStateResponse)
from models.chain_models import UserCreatePayload, UserUpdatePayload, UserLatestStateResponse

# 2. Import Logic
from src.chain_service import add_user_to_chain, update_user_state

# 3. Import Utils
from utils.Mongo_utils import get_data, get_latest_block

router = APIRouter(
    prefix="/ledger",
    tags=["Immutable Ledger"]
)

logger = logging.getLogger(__name__)

# --- API ROUTES ---

@router.post("/add-entry")
async def create_chain_entry(payload: UserCreatePayload):
    try:
        # Convert Pydantic model to dict
        data = payload.dict()
        
        # Call logic in src/chain_service.py
        result = add_user_to_chain(data)
        
        if result["status"]:
            return result
        else:
            raise HTTPException(status_code=500, detail=result["message"])
            
    except Exception as e:
        logger.error(f"Route Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update-state")
async def update_chain_state(payload: UserUpdatePayload):
    try:
        result = update_user_state(payload.user_id, payload.updates)
        
        if result["status"]:
            return result
        else:
            # Determine if it's a 404 or 500
            status_code = 404 if "not found" in str(result.get("message", "")).lower() else 500
            raise HTTPException(status_code=status_code, detail=result["message"])

    except Exception as e:
        logger.error(f"Route Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{user_id}")
async def get_user_history(user_id: str):
    try:
        # Read directly from DB using utils
        history = get_data("user_chain", {"user_id": user_id})
        
        # Sort by index (Blockchain Height)
        sorted_history = sorted(history, key=lambda x: x.get('index', 0))
        
        # Clean up MongoDB _id for JSON response
        for block in sorted_history:
            if "_id" in block:
                block["_id"] = str(block["_id"])
            
        return {
            "status": True,
            "count": len(sorted_history),
            "history": sorted_history
        }
        
    except Exception as e:
        logger.error(f"History Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_chain_status():
    try:
        last_block = get_latest_block("user_chain")
        if last_block:
            return {
                "status": True,
                "current_height": last_block["index"],
                "latest_hash": last_block["current_hash"],
                "last_updated": last_block.get("timestamp")
            }
        else:
            return {"status": True, "message": "Chain is empty (Genesis state)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/latest/{user_id}", response_model=UserLatestStateResponse)
async def get_user_latest_state(user_id: str):
    """
    Fetches ONLY the most recent state of the user (The highest block index).
    """
    try:
        # 1. Get all blocks for this user
        history = get_data("user_chain", {"user_id": user_id})
        
        if not history:
            raise HTTPException(status_code=404, detail="User not found in blockchain")

        # 2. Find the block with the highest 'index'
        # We use Python's max function with a lambda key
        latest_block = max(history, key=lambda x: x.get('index', 0))
        
        # 3. Clean up _id for JSON serialization
        if "_id" in latest_block:
            latest_block["_id"] = str(latest_block["_id"])

        return {
            "status": True,
            "latest_block": latest_block
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Latest State Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))