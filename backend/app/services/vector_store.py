import weaviate
from weaviate.classes.config import Configure, Property, DataType
from weaviate.classes.query import Filter
from typing import List, Dict, Any, Optional, Tuple
from loguru import logger
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.config import settings
from app.services.embedding import EmbeddingService

class VectorStoreService:
    """Service for managing vector storage and semantic search using Weaviate."""
    
    def __init__(self):
        self.client: Optional[weaviate.WeaviateClient] = None
        self.embedding_service = EmbeddingService()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Collection name for stickies
        self.collection_name = "StickyNote"
    
    async def initialize(self):
        """Initialize the Weaviate client and create collections."""
        try:
            # Parse Weaviate URL properly
            from urllib.parse import urlparse
            parsed_url = urlparse(settings.WEAVIATE_URL)
            host = parsed_url.hostname or "localhost"
            port = parsed_url.port or 8080
            
            logger.info(f"Connecting to Weaviate at {host}:{port}")
            
            # Create Weaviate client
            if settings.WEAVIATE_API_KEY:
                self.client = weaviate.connect_to_local(
                    host=host,
                    port=port,
                    headers={"X-OpenAI-Api-Key": settings.OPENAI_API_KEY} if settings.OPENAI_API_KEY else None
                )
            else:
                self.client = weaviate.connect_to_local(
                    host=host,
                    port=port,
                    headers={"X-OpenAI-Api-Key": settings.OPENAI_API_KEY} if settings.OPENAI_API_KEY else None
                )
            
            # Check if client is ready
            if not self.client.is_ready():
                raise ConnectionError("Weaviate client is not ready")
            
            # Create collection if it doesn't exist
            await self._create_collection()
            
            logger.info("Vector store initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
    
    async def _create_collection(self):
        """Create the StickyNote collection with proper schema."""
        try:
            # Check if collection exists
            if self.client.collections.exists(self.collection_name):
                logger.info(f"Collection {self.collection_name} already exists")
                return
            
            # Create collection with schema
            collection = self.client.collections.create(
                name=self.collection_name,
                properties=[
                    Property(name="sticky_id", data_type=DataType.TEXT),
                    Property(name="title", data_type=DataType.TEXT),
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="query", data_type=DataType.TEXT),
                    Property(name="response", data_type=DataType.TEXT),
                    Property(name="branch_id", data_type=DataType.TEXT),
                    Property(name="parent_id", data_type=DataType.TEXT),
                    Property(name="created_at", data_type=DataType.DATE),
                    Property(name="updated_at", data_type=DataType.DATE),
                    Property(name="metadata_json", data_type=DataType.TEXT),  # Store as JSON string for now
                ],
                # Configure vectorizer based on embedding provider
                vectorizer_config=Configure.Vectorizer.none() if settings.EMBEDDING_PROVIDER == "custom" 
                else Configure.Vectorizer.text2vec_openai(model=settings.EMBEDDING_MODEL) if settings.EMBEDDING_PROVIDER == "openai"
                else Configure.Vectorizer.text2vec_huggingface(model=settings.EMBEDDING_MODEL)
            )
            
            logger.info(f"Created collection {self.collection_name}")
            
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
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
            
            # Prepare data object
            import json
            data_object = {
                "sticky_id": sticky_id,
                "title": title,
                "content": content,
                "query": query,
                "response": response,
                "branch_id": branch_id,
                "parent_id": parent_id,
                "metadata_json": json.dumps(metadata or {}),
            }
            
            # Insert into Weaviate
            collection = self.client.collections.get(self.collection_name)
            
            if settings.EMBEDDING_PROVIDER == "custom":
                uuid = collection.data.insert(
                    properties=data_object,
                    vector=embedding
                )
            else:
                uuid = collection.data.insert(properties=data_object)
            
            logger.debug(f"Added sticky {sticky_id} to vector store with UUID {uuid}")
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
            
            collection = self.client.collections.get(self.collection_name)
            
            # Build filters if provided
            where_filter = None
            if filters:
                filter_conditions = []
                for key, value in filters.items():
                    if isinstance(value, list):
                        filter_conditions.append(Filter.by_property(key).contains_any(value))
                    else:
                        filter_conditions.append(Filter.by_property(key).equal(value))
                
                if filter_conditions:
                    where_filter = Filter.all_of(filter_conditions) if len(filter_conditions) > 1 else filter_conditions[0]
            
            # Perform vector search
            if settings.EMBEDDING_PROVIDER == "custom":
                response = collection.query.near_vector(
                    near_vector=query_embedding,
                    limit=limit,
                    distance=1 - similarity_threshold,  # Weaviate uses distance, not similarity
                    where=where_filter,
                    return_metadata=["distance"]
                )
            else:
                response = collection.query.near_text(
                    query=query_text,
                    limit=limit,
                    distance=1 - similarity_threshold,
                    where=where_filter,
                    return_metadata=["distance"]
                )
            
            # Process results
            results = []
            for item in response.objects:
                similarity = 1 - item.metadata.distance
                if similarity >= similarity_threshold:
                    import json
                    metadata_json = item.properties.get("metadata_json", "{}")
                    try:
                        metadata = json.loads(metadata_json)
                    except:
                        metadata = {}
                    
                    result = {
                        "sticky_id": item.properties.get("sticky_id"),
                        "title": item.properties.get("title"),
                        "content": item.properties.get("content"),
                        "query": item.properties.get("query"),
                        "response": item.properties.get("response"),
                        "branch_id": item.properties.get("branch_id"),
                        "parent_id": item.properties.get("parent_id"),
                        "similarity": similarity,
                        "metadata": metadata,
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
            collection = self.client.collections.get(self.collection_name)
            
            # Find the object by sticky_id
            search_result = collection.query.fetch_objects(
                where=Filter.by_property("sticky_id").equal(sticky_id),
                limit=1
            )
            
            if not search_result.objects:
                logger.warning(f"Sticky {sticky_id} not found for update")
                return False
            
            obj = search_result.objects[0]
            
            # Prepare update data
            update_data = {}
            if title is not None:
                update_data["title"] = title
            if content is not None:
                update_data["content"] = content
            if query is not None:
                update_data["query"] = query
            if response is not None:
                update_data["response"] = response
            if metadata is not None:
                import json
                update_data["metadata_json"] = json.dumps(metadata)
            
            # If content fields changed, regenerate embedding
            if any(field in update_data for field in ["title", "content", "query", "response"]):
                # Get current properties
                props = obj.properties
                new_title = update_data.get("title", props.get("title", ""))
                new_content = update_data.get("content", props.get("content", ""))
                new_query = update_data.get("query", props.get("query", ""))
                new_response = update_data.get("response", props.get("response", ""))
                
                embedding_text = f"{new_title} {new_content} {new_query} {new_response}".strip()
                embedding = await self.embedding_service.generate_embedding(embedding_text)
                
                if settings.EMBEDDING_PROVIDER == "custom":
                    # Update with new vector
                    collection.data.update(
                        uuid=obj.uuid,
                        properties=update_data,
                        vector=embedding
                    )
                else:
                    collection.data.update(
                        uuid=obj.uuid,
                        properties=update_data
                    )
            else:
                # Update without changing vector
                collection.data.update(
                    uuid=obj.uuid,
                    properties=update_data
                )
            
            logger.debug(f"Updated sticky {sticky_id} in vector store")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update sticky in vector store: {e}")
            return False
    
    async def delete_sticky(self, sticky_id: str) -> bool:
        """Delete a sticky note from the vector store."""
        try:
            collection = self.client.collections.get(self.collection_name)
            
            # Find and delete the object
            search_result = collection.query.fetch_objects(
                where=Filter.by_property("sticky_id").equal(sticky_id),
                limit=1
            )
            
            if not search_result.objects:
                logger.warning(f"Sticky {sticky_id} not found for deletion")
                return False
            
            obj = search_result.objects[0]
            collection.data.delete_by_id(obj.uuid)
            
            logger.debug(f"Deleted sticky {sticky_id} from vector store")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete sticky from vector store: {e}")
            return False
    
    async def get_sticky_by_id(self, sticky_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a sticky note by its ID."""
        try:
            collection = self.client.collections.get(self.collection_name)
            
            search_result = collection.query.fetch_objects(
                where=Filter.by_property("sticky_id").equal(sticky_id),
                limit=1
            )
            
            if not search_result.objects:
                return None
            
            obj = search_result.objects[0]
            
            # Parse metadata JSON
            import json
            metadata_json = obj.properties.get("metadata_json", "{}")
            try:
                metadata = json.loads(metadata_json)
            except:
                metadata = {}
            
            return {
                "sticky_id": obj.properties.get("sticky_id"),
                "title": obj.properties.get("title"),
                "content": obj.properties.get("content"),
                "query": obj.properties.get("query"),
                "response": obj.properties.get("response"),
                "branch_id": obj.properties.get("branch_id"),
                "parent_id": obj.properties.get("parent_id"),
                "metadata": metadata,
            }
            
        except Exception as e:
            logger.error(f"Failed to get sticky by ID: {e}")
            return None
    
    async def close(self):
        """Close the vector store connection."""
        if self.client:
            self.client.close()
            logger.info("Vector store connection closed") 