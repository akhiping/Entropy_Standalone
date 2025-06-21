"""
Embedding service for converting text to vector representations.
"""

from typing import List, Dict, Any
from app.config import settings
import numpy as np

class EmbeddingService:
    """Service for generating text embeddings."""
    
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER
        self.model = settings.EMBEDDING_MODEL
        
        # In development mode without API keys, use dummy embeddings
        if not settings.OPENAI_API_KEY and self.provider == "openai":
            print("🚫 Using dummy embeddings - OpenAI API key not available")
            self.use_dummy = True
        else:
            self.use_dummy = False
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        if self.use_dummy:
            # Return a dummy embedding (random but consistent for same text)
            np.random.seed(hash(text) % 2**32)  # Consistent seed for same text
            return np.random.normal(0, 1, 1536).tolist()  # OpenAI embedding size
        
        # TODO: Implement actual OpenAI/HuggingFace embedding generation
        raise NotImplementedError("Real embedding generation not yet implemented")
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
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
        else:
            return 1536  # Default 