import json
from typing import List, Dict, Any, Optional
from loguru import logger
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pinecone import Pinecone, ServerlessSpec
import time

from app.config import settings
from app.services.embedding import EmbeddingService

class VectorStoreService:
    """Service for managing vector storage and semantic search using Pinecone."""
    
    def __init__(self):
        self.pc: Optional[Pinecone] = None
        self.index = None
        self.embedding_service = EmbeddingService()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Index name for stickies
        self.index_name = "entropy-stickies"
        
    async def initialize(self):
        """Initialize the Pinecone client and create index."""
        try:
            logger.info("Initializing Pinecone vector store...")
            
            # Initialize Pinecone client
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            
            # Create index if it doesn't exist
            await self._create_index()
            
            # Connect to the index
            self.index = self.pc.Index(self.index_name)
            
            logger.info("Vector store initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
    
    async def _create_index(self):
        """Create the Pinecone index if it doesn't exist."""
        try:
            # Check if index exists
            existing_indexes = [idx.name for idx in self.pc.list_indexes()]
            
            if self.index_name in existing_indexes:
                logger.info(f"Index {self.index_name} already exists")
                return
            
            # Get embedding dimension
            dimension = self.embedding_service.get_embedding_dimension()
            
            # Create index with serverless spec
            logger.info(f"Creating index {self.index_name} with dimension {dimension}")
            
            self.pc.create_index(
                name=self.index_name,
                dimension=dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=settings.PINECONE_CLOUD,
                    region=settings.PINECONE_REGION
                )
            )
            
            # Wait for index to be ready
            while not self.pc.describe_index(self.index_name).status['ready']:
                logger.info("Waiting for index to be ready...")
                time.sleep(1)
            
            logger.info(f"Created index {self.index_name}")
            
        except Exception as e:
            logger.error(f"Failed to create index: {e}")
            raise
    
    async def add_sticky(
        self,
        sticky_id: str,
        title: str,
        content: str,
        query: str,
        response: str = "",
        branch_id: str = "",
        parent_id: str = "",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add a sticky note to the vector store."""
        try:
            # Generate embedding for the content
            embedding_text = f"{title} {content} {query} {response}".strip()
            embedding = await self.embedding_service.generate_embedding(embedding_text)
            
            # Prepare metadata
            vector_metadata = {
                "sticky_id": sticky_id,
                "title": title,
                "content": content,
                "query": query,
                "response": response,
                "branch_id": branch_id,
                "parent_id": parent_id,
                "created_at": time.time(),
                "updated_at": time.time(),
            }
            
            # Add custom metadata if provided
            if metadata:
                # Flatten metadata and add prefix to avoid conflicts
                for key, value in metadata.items():
                    # Convert complex types to strings for Pinecone
                    if isinstance(value, (dict, list)):
                        vector_metadata[f"meta_{key}"] = json.dumps(value)
                    else:
                        vector_metadata[f"meta_{key}"] = str(value)
            
            # Upsert vector to Pinecone
            await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.index.upsert(vectors=[{
                    "id": sticky_id,
                    "values": embedding,
                    "metadata": vector_metadata
                }])
            )
            
            logger.debug(f"Added sticky {sticky_id} to vector store")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add sticky to vector store: {e}")
            return False
    
    async def search_similar(
        self,
        query_text: str,
        limit: int = 5,
        similarity_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar sticky notes using semantic similarity."""
        try:
            # Generate embedding for query
            query_embedding = await self.embedding_service.generate_embedding(query_text)
            
            # Build filter for Pinecone
            pinecone_filter = {}
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        pinecone_filter[key] = {"$in": value}
                    else:
                        pinecone_filter[key] = {"$eq": value}
            
            # Perform vector search
            search_response = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.index.query(
                    vector=query_embedding,
                    top_k=limit,
                    include_metadata=True,
                    filter=pinecone_filter if pinecone_filter else None
                )
            )
            
            # Process results
            results = []
            for match in search_response.matches:
                # Pinecone returns similarity scores (0-1), filter by threshold
                if match.score >= similarity_threshold:
                    metadata = match.metadata
                    
                    # Extract custom metadata
                    custom_metadata = {}
                    for key, value in metadata.items():
                        if key.startswith("meta_"):
                            original_key = key[5:]  # Remove "meta_" prefix
                            try:
                                # Try to parse JSON if it's a string
                                custom_metadata[original_key] = json.loads(value)
                            except (json.JSONDecodeError, TypeError):
                                custom_metadata[original_key] = value
                    
                    result = {
                        "sticky_id": metadata.get("sticky_id"),
                        "title": metadata.get("title"),
                        "content": metadata.get("content"),
                        "query": metadata.get("query"),
                        "response": metadata.get("response"),
                        "branch_id": metadata.get("branch_id"),
                        "parent_id": metadata.get("parent_id"),
                        "similarity": match.score,
                        "metadata": custom_metadata,
                    }
                    results.append(result)
            
            logger.debug(f"Found {len(results)} similar stickies for query: {query_text[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search similar stickies: {e}")
            return []
    
    async def update_sticky(
        self,
        sticky_id: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        query: Optional[str] = None,
        response: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update an existing sticky note in the vector store."""
        try:
            # First, fetch the existing vector to get current metadata
            fetch_response = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.index.fetch(ids=[sticky_id])
            )
            
            if sticky_id not in fetch_response.vectors:
                logger.warning(f"Sticky {sticky_id} not found for update")
                return False
            
            existing_vector = fetch_response.vectors[sticky_id]
            current_metadata = existing_vector.metadata
            
            # Update metadata with new values
            updated_metadata = current_metadata.copy()
            if title is not None:
                updated_metadata["title"] = title
            if content is not None:
                updated_metadata["content"] = content
            if query is not None:
                updated_metadata["query"] = query
            if response is not None:
                updated_metadata["response"] = response
            
            updated_metadata["updated_at"] = time.time()
            
            # Add custom metadata if provided
            if metadata:
                for key, value in metadata.items():
                    if isinstance(value, (dict, list)):
                        updated_metadata[f"meta_{key}"] = json.dumps(value)
                    else:
                        updated_metadata[f"meta_{key}"] = str(value)
            
            # Check if we need to regenerate embedding
            regenerate_embedding = any(field is not None for field in [title, content, query, response])
            
            if regenerate_embedding:
                # Generate new embedding
                new_title = updated_metadata.get("title", "")
                new_content = updated_metadata.get("content", "")
                new_query = updated_metadata.get("query", "")
                new_response = updated_metadata.get("response", "")
                
                embedding_text = f"{new_title} {new_content} {new_query} {new_response}".strip()
                new_embedding = await self.embedding_service.generate_embedding(embedding_text)
                
                # Upsert with new embedding and metadata
                await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.index.upsert(vectors=[{
                        "id": sticky_id,
                        "values": new_embedding,
                        "metadata": updated_metadata
                    }])
                )
            else:
                # Update only metadata (keep existing embedding)
                await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.index.upsert(vectors=[{
                        "id": sticky_id,
                        "values": existing_vector.values,
                        "metadata": updated_metadata
                    }])
                )
            
            logger.debug(f"Updated sticky {sticky_id} in vector store")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update sticky in vector store: {e}")
            return False
    
    async def delete_sticky(self, sticky_id: str) -> bool:
        """Delete a sticky note from the vector store."""
        try:
            await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.index.delete(ids=[sticky_id])
            )
            
            logger.debug(f"Deleted sticky {sticky_id} from vector store")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete sticky from vector store: {e}")
            return False
    
    async def get_sticky_by_id(self, sticky_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a sticky note by its ID."""
        try:
            fetch_response = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: self.index.fetch(ids=[sticky_id])
            )
            
            if sticky_id not in fetch_response.vectors:
                return None
            
            vector = fetch_response.vectors[sticky_id]
            metadata = vector.metadata
            
            # Extract custom metadata
            custom_metadata = {}
            for key, value in metadata.items():
                if key.startswith("meta_"):
                    original_key = key[5:]  # Remove "meta_" prefix
                    try:
                        custom_metadata[original_key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        custom_metadata[original_key] = value
            
            return {
                "sticky_id": metadata.get("sticky_id"),
                "title": metadata.get("title"),
                "content": metadata.get("content"),
                "query": metadata.get("query"),
                "response": metadata.get("response"),
                "branch_id": metadata.get("branch_id"),
                "parent_id": metadata.get("parent_id"),
                "metadata": custom_metadata,
            }
            
        except Exception as e:
            logger.error(f"Failed to get sticky by ID: {e}")
            return None
    
    async def close(self):
        """Close the vector store connection."""
        # Pinecone doesn't require explicit connection closing
        logger.info("Vector store connection closed") 