from fastapi import APIRouter

# Create main API router
api_router = APIRouter()

@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Entropy API is running",
        "version": "1.0.0"
    }

@api_router.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Entropy API",
        "docs": "/docs",
        "health": "/api/v1/health"
    } 