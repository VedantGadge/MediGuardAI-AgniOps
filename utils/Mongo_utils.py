import os
import logging
from dotenv import load_dotenv
from pymongo import MongoClient, DESCENDING
from typing import Any, Dict, List, Optional
from bson import ObjectId

# --- CONFIGURATION & SETUP ---
load_dotenv()

# Handle missing env vars gracefully-ish
MONGODB_URI = str(os.getenv("MONGODB_URI"))
DB_NAME = str(os.getenv("DB_NAME", "my_blockchain_db"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    db_client: MongoClient[Any] = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Trigger a ping to check connection immediately
    db_client.admin.command('ping')
    database = db_client[DB_NAME]
    logger.info(f"✅ Connected to MongoDB: {DB_NAME}")
except Exception as e:
    logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
    raise e

# --- CORE FUNCTIONS ---

def get_collection(collection_name: str):
    """Helper to get collection object safely."""
    return database[collection_name]

def insert_document(collection_name: str, data: Dict) -> Dict:
    """
    Inserts a new document (Block) into the chain.
    Returns: {"status": True, "inserted_id": str}
    """
    try:
        collection = get_collection(collection_name)
        result = collection.insert_one(data)
        return {
            "status": True, 
            "message": "Document inserted", 
            "inserted_id": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Insert failed: {e}")
        return {"status": False, "message": str(e)}

def upsert_document(collection_name: str, query: Dict, data: Dict) -> Dict:
    """
    Updates if exists, Inserts if not.
    Handles the {"$set": ...} wrapper automatically.
    """
    try:
        collection = get_collection(collection_name)
        
        # The 'upsert=True' magic
        result = collection.update_one(query, {"$set": data}, upsert=True)
        
        if result.upserted_id:
            msg = f"Created new document with ID {result.upserted_id}"
        else:
            msg = f"Updated existing document (Modified: {result.modified_count})"
            
        return {
            "status": True, 
            "message": msg,
            "upserted_id": str(result.upserted_id) if result.upserted_id else None
        }
    except Exception as e:
        logger.error(f"Upsert failed: {e}")
        return {"status": False, "message": str(e)}

def get_data(collection_name: str, query: Dict = {}, limit: int = 0) -> List[Dict]:
    """
    Fetches data as a simple list.
    """
    try:
        collection = get_collection(collection_name)
        cursor = collection.find(query).limit(limit)
        # Convert cursor to list immediately
        return list(cursor)
    except Exception as e:
        logger.error(f"Get Data failed: {e}")
        return []

def get_one(collection_name: str, query: Dict) -> Optional[Dict]:
    """
    Fetches a single document.
    """
    try:
        collection = get_collection(collection_name)
        return collection.find_one(query)
    except Exception as e:
        logger.error(f"Get One failed: {e}")
        return None

def delete_document(collection_name: str, query: Dict) -> Dict:
    """
    Deletes documents matching the query.
    """
    try:
        collection = get_collection(collection_name)
        result = collection.delete_many(query)
        return {
            "status": True, 
            "message": f"Deleted {result.deleted_count} documents"
        }
    except Exception as e:
        return {"status": False, "message": str(e)}

# --- BLOCKCHAIN SPECIFIC ---

def get_latest_block(collection_name: str, sort_field: str = "index") -> Optional[Dict]:
    """
    Gets the last block added to the chain.
    Crucial for calculating the 'previous_hash'.
    """
    try:
        collection = get_collection(collection_name)
        # Sort by index DESCENDING (-1) and take the first one
        result = collection.find().sort(sort_field, DESCENDING).limit(1)
        items = list(result)
        return items[0] if items else None
    except Exception as e:
        logger.error(f"Failed to get latest block: {e}")
        return None