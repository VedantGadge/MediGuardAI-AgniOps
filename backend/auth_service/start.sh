#!/bin/bash

echo "Starting FastAPI Authentication Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "Virtual environment created!"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if [ ! -f "venv/lib/python*/site-packages/fastapi/__init__.py" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo "Dependencies installed!"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "Please update .env with your configuration before running the service!"
    read -p "Press any key to continue..."
fi

# Start the server
echo "Starting server on port 8001..."
echo "API Documentation available at: http://localhost:8001/docs"
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
