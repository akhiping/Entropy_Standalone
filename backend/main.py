from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from loguru import logger

from app.config import settings
from app.api.routes import api_router
from app.services.vector_store import VectorStoreService
from app.services.llm_adapter import LLMAdapterService

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown tasks."""
    logger.info("Starting Entropy backend...")
    
    # Initialize services
    try:
        # Initialize vector store
        vector_store = VectorStoreService()
        await vector_store.initialize()
        app.state.vector_store = vector_store
        
        # Initialize LLM adapter
        llm_adapter = LLMAdapterService()
        app.state.llm_adapter = llm_adapter
        
        logger.info("All services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    
    yield
    
    # Cleanup
    logger.info("Shutting down Entropy backend...")
    if hasattr(app.state, 'vector_store'):
        await app.state.vector_store.close()

# Create FastAPI app
app = FastAPI(
    title="Entropy API",
    description="Backend API for Entropy - Contextual Idea Exploration Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Entropy API",
        "version": "1.0.0",
        "description": "Backend API for contextual idea exploration",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "entropy-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    ) 