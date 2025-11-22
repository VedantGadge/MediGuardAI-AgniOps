import hashlib
import json
import time
from typing import Dict, Any
from pymongo import DESCENDING

# Assuming you added 'get_collection' to your imports or utils
from utils.Mongo_utils import insert_document, get_latest_block, get_collection

COLLECTION_NAME = "user_chain"

# --- EXISTING FUNCTIONS (Keep these as is) ---

def calculate_hash(block_data: Dict[str, Any]) -> str:
    clean_data = block_data.copy()
    # Remove metadata that shouldn't be part of the content hash
    for key in ["_id", "current_hash"]: 
        if key in clean_data:
            del clean_data[key]
            
    block_string = json.dumps(clean_data, sort_keys=True).encode()
    return hashlib.sha256(block_string).hexdigest()

def add_user_to_chain(user_data: Dict[str, Any]) -> Dict[str, Any]:
    # 1. Get Global Last Block (for Chain Linking)
    last_block = get_latest_block(COLLECTION_NAME, sort_field="index")
    
    if last_block:
        previous_hash = last_block["current_hash"]
        new_index = last_block["index"] + 1
    else:
        previous_hash = "0" * 64
        new_index = 0

    # 2. Prepare the Block
    new_block = {
        "index": new_index,
        "timestamp": time.time(),
        "previous_hash": previous_hash,
        **user_data
    }

    # 3. Seal it
    new_block["current_hash"] = calculate_hash(new_block)

    # 4. Save
    result = insert_document(COLLECTION_NAME, new_block)
    
    if result["status"]:
        return {
            "status": True, 
            "message": f"Block added at Index {new_index}", 
            "hash": new_block["current_hash"]
        }
    else:
        return {"status": False, "message": "Database Error"}

# --- NEW: UPDATE FUNCTION ---

def update_user_state(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    1. Fetches the MOST RECENT state of a specific user.
    2. 'Decodes' it (removes blockchain metadata).
    3. Merges new updates.
    4. 'Encodes' it into a BRAND NEW block at the end of the chain.
    """
    
    # STEP 1: Get the previous data for this specific user
    # We query for 'user_id' and sort by 'index' descending to get their latest version
    col = get_collection(COLLECTION_NAME)
    
    # Find the latest block that contains this user_id
    current_user_block = col.find_one(
        {"user_id": user_id}, 
        sort=[("index", DESCENDING)]
    )

    if not current_user_block:
        return {"status": False, "message": "User not found in chain"}

    # STEP 2: Decode & Clean
    # We strip away the 'Block' metadata (Index, Hash, Timestamp) 
    # to get just the raw 'User Data'.
    user_data = current_user_block.copy()
    
    # Remove blockchain fields so we don't duplicate them
    keys_to_remove = ["_id", "index", "previous_hash", "current_hash", "timestamp"]
    for key in keys_to_remove:
        if key in user_data:
            del user_data[key]

    # STEP 3: Add/Merge More Data
    # This updates the dictionary with new values
    user_data.update(updates)
    
    # Mark this as an update event (optional, but good for history)
    user_data["update_note"] = "Updated via function"

    # STEP 4: Store in the NEXT Node (Append to Chain)
    # We reuse our existing add function because it handles the Hashing & Linking
    return add_user_to_chain(user_data)