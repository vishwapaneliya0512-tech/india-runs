import logging
import numpy as np

logger = logging.getLogger("embeddings")

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.dimension = 384 # all-MiniLM-L6-v2 uses 384 dimensions
        self.initialized = False
        
    def initialize(self):
        if self.initialized:
            return
        try:
            import socket
            # Enforce socket timeout to prevent indefinite hanging on slow huggingface downloads
            socket.setdefaulttimeout(15.0)
            logger.info("Initializing SentenceTransformers (all-MiniLM-L6-v2)...")
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.initialized = True
            logger.info("SentenceTransformers model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformers model: {e}. Using deterministic fallback generator.")
            self.model = None
            self.initialized = True

    def get_embedding(self, text: str) -> list:
        self.initialize()
        if not text:
            return [0.0] * self.dimension
            
        if self.model:
            try:
                embedding = self.model.encode(text)
                return embedding.tolist()
            except Exception as e:
                logger.error(f"Error encoding text with SentenceTransformers: {e}. Falling back...")
                
        # Deterministic fallback vector generation based on character frequencies
        return self._generate_fallback_vector(text)

    def _generate_fallback_vector(self, text: str) -> list:
        # Create a deterministic 384-dimension vector from the text using a simple hash-based seed
        vector = np.zeros(self.dimension)
        if not text:
            return vector.tolist()
            
        # Seed the random number generator using a hash of the text
        h = hash(text) % 2**32
        np.random.seed(h)
        
        # Generate normalized random vector
        vector = np.random.randn(self.dimension)
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
            
        return vector.tolist()

# Singleton instance
embedding_service = EmbeddingService()
