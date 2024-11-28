import os
from pathlib import Path
from dotenv import load_dotenv

# Get the root directory path (three levels up from this file)
ROOT_DIR = Path(__file__).parent.parent.parent.parent

# Load environment variables from root directory
load_dotenv(ROOT_DIR / '.env')

# Initialize API key with validation
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

# FastAPI configuration
PROJECT_NAME = "JavaScript Tutor API"
API_V1_PREFIX = "/api"

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",  # Frontend URL
]