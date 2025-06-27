"""
Embedding service for converting text to vector representations.
"""

from typing import List, Dict, Any
from app.config import settings
import numpy as np
import openai
from loguru import logger

class EmbeddingService:
    """Service for generating text embeddings."""
    
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER
        self.model = settings.EMBEDDING_MODEL
        
        # Initialize OpenAI client if API key is available
        if settings.OPENAI_API_KEY and self.provider == "openai":
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            self.use_dummy = False
            logger.info(f"✅ Using OpenAI embeddings with model: {self.model}")
        else:
            logger.warning("🚫 Using dummy embeddings - OpenAI API key not available")
            self.openai_client = None
            self.use_dummy = True
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        if self.use_dummy:
            # Return a dummy embedding (random but consistent for same text)
            np.random.seed(hash(text) % 2**32)  # Consistent seed for same text
            return np.random.normal(0, 1, 1536).tolist()  # OpenAI embedding size
        
        try:
            # Generate real OpenAI embedding
            response = self.openai_client.embeddings.create(
                input=text,
                model=self.model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            # Fallback to dummy embedding
            np.random.seed(hash(text) % 2**32)
            return np.random.normal(0, 1, 1536).tolist()
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        if self.use_dummy:
            embeddings = []
            for text in texts:
                embedding = await self.generate_embedding(text)
                embeddings.append(embedding)
            return embeddings
        
        try:
            # Batch generate real OpenAI embeddings
            response = self.openai_client.embeddings.create(
                input=texts,
                model=self.model
            )
            return [data.embedding for data in response.data]
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            # Fallback to individual generation
            embeddings = []
            for text in texts:
                embedding = await self.generate_embedding(text)
                embeddings.append(embedding)
            return embeddings
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings."""
        if self.model == "text-embedding-3-small":
            return 1536
        elif self.model == "text-embedding-3-large":
            return 3072
        elif self.model == "text-embedding-ada-002":
            return 1536
        else:
            return 1536  # Default 