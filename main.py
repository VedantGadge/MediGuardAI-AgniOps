import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import the router from the routes folder
from routes.chain_service_routes import router as ledger_router

# 1. Load Environment Variables
load_dotenv()

# 2. Initialize FastAPI App
app = FastAPI(
    title="MongoDB Blockchain Service",
    description="An immutable ledger API built with Python and MongoDB.",
    version="1.0.0"
)

# 3. CORS Middleware (ALLOW ALL)
# Warning: This allows ANY website to access your API. 
# Good for development, but be careful in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <--- This allows all domains
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers (Auth, Content-Type, etc.)
)

# 4. Register the Blockchain Routes
app.include_router(ledger_router)

# 5. Root / Health Check Endpoint
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Immutable Ledger API",
        "cors": "Allow All",
        "documentation": "/docs" 
    }

# 6. Entry Point
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)