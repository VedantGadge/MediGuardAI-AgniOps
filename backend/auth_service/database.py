from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Global variable to hold the MongoDB client
mongodb_client: AsyncIOMotorClient = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global mongodb_client
    try:
        mongodb_uri = os.getenv("MONGODB_URI")
        if not mongodb_uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        
        mongodb_client = AsyncIOMotorClient(mongodb_uri)
        
        # Test the connection
        await mongodb_client.admin.command('ping')
        print(f"MongoDB Connected: {mongodb_client.address}")
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance"""
    if mongodb_client is None:
        raise Exception("Database not connected")
    
    # Extract database name from connection string or use default
    db_name = os.getenv("DB_NAME", "mediguard")
    return mongodb_client[db_name]
