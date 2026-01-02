import sys
import os

# Add the project root to sys.path so we can import from api
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the FastAPI app
try:
    from api.main import app
    print("✅ Successfully imported FastAPI app")
except Exception as e:
    print(f"❌ Error importing backend: {e}")
    import traceback
    traceback.print_exc()
    # Create a dummy app to show the error in the browser/logs
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/{catchall:path}")
    def error_handler(catchall: str):
        return {"error": f"Backend failed to start: {str(e)}", "traceback": str(e)}

# Export the app for Vercel
# Vercel automatically detects the 'app' variable