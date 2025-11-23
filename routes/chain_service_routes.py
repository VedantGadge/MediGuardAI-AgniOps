import logging
from fastapi import APIRouter, HTTPException
from typing import List

# 1. Import Models
from models.chain_models import UserCreatePayload, UserUpdatePayload, UserLatestStateResponse

# 2. Import Logic (Added get_chain_data to read from Ganache)
from src.chain_service import add_user_to_chain, update_user_state, get_chain_data

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
    """
    Updates a user by appending a NEW block to the Ganache blockchain.
    """
    try:
        # --- THE FIX ---
        # We convert the flat Pydantic model (glucose, bmi, etc.) into a Dictionary.
        # exclude_unset=True ensures we don't send 'None' for fields you didn't update.
        update_data = payload.dict(
            exclude={"user_id", "timestamp"}, 
            exclude_unset=True
        )

        # Call the logic layer with the user_id and the dictionary of data
        result = update_user_state(payload.user_id, update_data)
        
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
    """
    Reads history from the Blockchain (Ganache).
    """
    try:
        # 1. Fetch ALL blocks from Ganache
        all_blocks = get_chain_data()
        
        # 2. Filter in Python for the specific user
        # (Smart Contracts are hard to search, so we search in Python)
        user_history = [block for block in all_blocks if block['username'] == user_id]
        
        # 3. Sort by index (Blockchain Height)
        sorted_history = sorted(user_history, key=lambda x: x.get('index', 0))
        
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
        # Fetch directly from blockchain
        all_blocks = get_chain_data()
        
        if all_blocks:
            last_block = all_blocks[-1] # Get the last one
            return {
                "status": True,
                "current_height": last_block["index"],
                "last_updated": last_block.get("timestamp"),
                "total_blocks": len(all_blocks)
            }
        else:
            return {"status": True, "message": "Chain is empty (Genesis state)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest/{user_id}", response_model=UserLatestStateResponse)
async def get_user_latest_state(user_id: str):
    """
    Fetches ONLY the most recent state of the user from Ganache.
    """
    try:
        # 1. Get all blocks from Ganache
        all_blocks = get_chain_data()
        
        # 2. Filter for this user
        user_history = [block for block in all_blocks if block['username'] == user_id]
        
        if not user_history:
            raise HTTPException(status_code=404, detail="User not found in blockchain")

        # 3. Find the block with the highest 'index'
        latest_block = max(user_history, key=lambda x: x.get('index', 0))
        
        return {
            "status": True,
            "latest_block": latest_block
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Latest State Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))