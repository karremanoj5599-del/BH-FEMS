"""
Vercel Serverless Function Entry Point
This wrapper adds the backend directory to the Python path
so that all imports in backend/app/ resolve correctly.
"""
import sys
import os

# Add the backend directory to Python's module search path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the FastAPI app - Vercel looks for the `app` variable
from app.main import app
