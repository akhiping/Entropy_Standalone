from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application Settings
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Entropy API"
    
    # CORS Settings
    FRONTEND_URL: str = Field(default="http://localhost:5173", env="FRONTEND_URL")
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        env="ALLOWED_ORIGINS"
    )
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated origins to list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    # Database Settings
    DATABASE_URL: str = Field(default="sqlite:///./entropy.db", env="DATABASE_URL")
    
    # Vector Database Settings (Pinecone)
    PINECONE_API_KEY: str = Field(env="PINECONE_API_KEY")
    PINECONE_ENVIRONMENT: str = Field(default="us-east-1", env="PINECONE_ENVIRONMENT")
    PINECONE_CLOUD: str = Field(default="aws", env="PINECONE_CLOUD")
    PINECONE_REGION: str = Field(default="us-east-1", env="PINECONE_REGION")
    
    # LLM Provider Settings
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    HUGGINGFACE_API_KEY: Optional[str] = Field(default=None, env="HUGGINGFACE_API_KEY")
    
    # Default LLM Configuration
    DEFAULT_LLM_PROVIDER: str = Field(default="openai", env="DEFAULT_LLM_PROVIDER")
    DEFAULT_MODEL: str = Field(default="gpt-4-turbo-preview", env="DEFAULT_MODEL")
    
    # Embedding Configuration
    EMBEDDING_PROVIDER: str = Field(default="openai", env="EMBEDDING_PROVIDER")
    EMBEDDING_MODEL: str = Field(default="text-embedding-3-small", env="EMBEDDING_MODEL")
    RERANKER_MODEL: str = Field(default="BAAI/bge-reranker-base", env="RERANKER_MODEL")
    
    # RAG Configuration
    SIMILARITY_THRESHOLD: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")
    MAX_CONTEXT_TOKENS: int = Field(default=8000, env="MAX_CONTEXT_TOKENS")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    # Cache Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    CACHE_TTL: int = Field(default=3600, env="CACHE_TTL")
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    class Config:
        env_file = "../.env"
        case_sensitive = True
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # In development mode, make API keys optional with warnings
        if self.ENVIRONMENT == "production":
            # Validate that required API keys are provided based on configuration
            if self.DEFAULT_LLM_PROVIDER == "openai" and not self.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required when using OpenAI as LLM provider")
            
            if self.DEFAULT_LLM_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY is required when using Anthropic as LLM provider")
            
            if self.EMBEDDING_PROVIDER == "openai" and not self.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required when using OpenAI for embeddings")
            
            if self.EMBEDDING_PROVIDER == "huggingface" and not self.HUGGINGFACE_API_KEY:
                raise ValueError("HUGGINGFACE_API_KEY is required when using HuggingFace for embeddings")
        else:
            # Development mode - warn but don't fail
            if self.DEFAULT_LLM_PROVIDER == "openai" and not self.OPENAI_API_KEY:
                print("⚠️  Warning: OPENAI_API_KEY not set. LLM features will be disabled.")
            
            if self.DEFAULT_LLM_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
                print("⚠️  Warning: ANTHROPIC_API_KEY not set. LLM features will be disabled.")
            
            if self.EMBEDDING_PROVIDER == "openai" and not self.OPENAI_API_KEY:
                print("⚠️  Warning: OPENAI_API_KEY not set. Embedding features will be disabled.")
            
            if self.EMBEDDING_PROVIDER == "huggingface" and not self.HUGGINGFACE_API_KEY:
                print("⚠️  Warning: HUGGINGFACE_API_KEY not set. HuggingFace embeddings will be disabled.")

# Create global settings instance
settings = Settings() 