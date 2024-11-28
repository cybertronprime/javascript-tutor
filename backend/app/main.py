from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import CORS_ORIGINS, PROJECT_NAME, API_V1_PREFIX

def create_application() -> FastAPI:
    """
    Create and configure FastAPI application
    """
    application = FastAPI(title=PROJECT_NAME)

    # Add CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add routes
    application.include_router(router, prefix=API_V1_PREFIX)

    return application

app = create_application()