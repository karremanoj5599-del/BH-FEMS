"""
Vercel Serverless Function Entry Point
This wrapper adds the backend directory to the Python path
so that all imports in backend/app/ resolve correctly.
"""
import sys
import os

# Add the backend directory to Python's module search path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
sys.path.insert(0, backend_dir)

try:
    # Import the FastAPI app - Vercel looks for the `app` variable
    from app.main import app
except Exception as e:
    # If the import fails, create a minimal FastAPI app that shows the error
    import traceback
    from http.server import BaseHTTPRequestHandler
    
    error_detail = f"Import failed: {str(e)}\n\nTraceback:\n{traceback.format_exc()}\n\nPython path: {sys.path}\n\nBackend dir: {backend_dir}\n\nBackend dir exists: {os.path.exists(backend_dir)}\n\nBackend dir contents: {os.listdir(backend_dir) if os.path.exists(backend_dir) else 'N/A'}"
    
    class handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(error_detail.encode())
        
        def do_POST(self):
            self.do_GET()
