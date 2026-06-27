import os
import json
import logging
import numpy as np

logger = logging.getLogger("chromadb")

class ChromaClient:
    def __init__(self):
        self.client = None
        self.resume_collection = None
        self.job_collection = None
        self.use_fallback = False
        self.fallback_db_path = "./vector_store_fallback.json"
        self.fallback_data = {"resumes": {}, "jobs": {}} # Keyed by str(id)
        
    def initialize(self):
        if self.client is not None or self.use_fallback:
            return
            
        try:
            logger.info("Initializing ChromaDB Persistent Client...")
            import chromadb
            # Set up persistent database directory
            os.makedirs("./chromadb_store", exist_ok=True)
            self.client = chromadb.PersistentClient(path="./chromadb_store")
            
            # Get or create collections
            # Chroma uses cosine similarity (represented as 'cosine') or L2/IP
            self.resume_collection = self.client.get_or_create_collection(
                name="resumes", 
                metadata={"hnsw:space": "cosine"}
            )
            self.job_collection = self.client.get_or_create_collection(
                name="jobs",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB collections loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to initialize ChromaDB: {e}. Activating JSON vector store fallback.")
            self.use_fallback = True
            self._load_fallback_data()

    def _load_fallback_data(self):
        if os.path.exists(self.fallback_db_path):
            try:
                with open(self.fallback_db_path, "r") as f:
                    self.fallback_data = json.load(f)
                logger.info(f"Loaded {len(self.fallback_data['resumes'])} resumes and {len(self.fallback_data['jobs'])} jobs from fallback vector store.")
            except Exception as e:
                logger.error(f"Error loading fallback vector store: {e}")
                self.fallback_data = {"resumes": {}, "jobs": {}}

    def _save_fallback_data(self):
        try:
            with open(self.fallback_db_path, "w") as f:
                json.dump(self.fallback_data, f)
        except Exception as e:
            logger.error(f"Error saving fallback vector store: {e}")

    def add_resume(self, candidate_id: int, embedding: list, metadata: dict, document: str = ""):
        self.initialize()
        if self.use_fallback:
            self.fallback_data["resumes"][str(candidate_id)] = {
                "embedding": embedding,
                "metadata": metadata,
                "document": document
            }
            self._save_fallback_data()
            return
            
        try:
            self.resume_collection.upsert(
                ids=[str(candidate_id)],
                embeddings=[embedding],
                metadatas=[metadata],
                documents=[document] if document else None
            )
        except Exception as e:
            logger.error(f"ChromaDB upsert error for candidate {candidate_id}: {e}")

    def delete_resume(self, candidate_id: int):
        self.initialize()
        if self.use_fallback:
            if str(candidate_id) in self.fallback_data["resumes"]:
                del self.fallback_data["resumes"][str(candidate_id)]
                self._save_fallback_data()
            return
            
        try:
            self.resume_collection.delete(ids=[str(candidate_id)])
        except Exception as e:
            logger.error(f"ChromaDB delete error for candidate {candidate_id}: {e}")

    def add_job(self, job_id: int, embedding: list, metadata: dict, document: str = ""):
        self.initialize()
        if self.use_fallback:
            self.fallback_data["jobs"][str(job_id)] = {
                "embedding": embedding,
                "metadata": metadata,
                "document": document
            }
            self._save_fallback_data()
            return
            
        try:
            self.job_collection.upsert(
                ids=[str(job_id)],
                embeddings=[embedding],
                metadatas=[metadata],
                documents=[document] if document else None
            )
        except Exception as e:
            logger.error(f"ChromaDB upsert error for job {job_id}: {e}")

    def query_resumes(self, job_embedding: list, n_results: int = 10) -> list:
        """
        Returns list of dicts: {"candidate_id": int, "score": float}
        Chroma's cosine similarity returns distance where 0.0 means identical and 1.0 means perpendicular.
        We convert distance to similarity score: similarity = 1 - distance
        """
        self.initialize()
        if self.use_fallback:
            return self._query_fallback("resumes", job_embedding, n_results)
            
        try:
            results = self.resume_collection.query(
                query_embeddings=[job_embedding],
                n_results=n_results
            )
            
            output = []
            if results and results["ids"] and len(results["ids"][0]) > 0:
                for idx, cid in enumerate(results["ids"][0]):
                    # ChromaDB returns cosine distance. Similarity = 1 - distance.
                    # Bound score between 0.0 and 1.0
                    distance = results["distances"][0][idx] if "distances" in results and results["distances"] else 0.5
                    similarity = max(0.0, min(1.0, 1.0 - distance))
                    output.append({
                        "candidate_id": int(cid),
                        "score": float(similarity)
                    })
            return output
        except Exception as e:
            logger.error(f"ChromaDB query resumes error: {e}. Attempting fallback query...")
            # If active ChromaDB query fails during run, fallback
            return self._query_fallback("resumes", job_embedding, n_results)

    def _query_fallback(self, collection_name: str, query_embedding: list, n_results: int) -> list:
        data = self.fallback_data[collection_name]
        if not data:
            return []
            
        results = []
        q_vec = np.array(query_embedding)
        q_norm = np.linalg.norm(q_vec)
        
        for item_id, item in data.items():
            i_vec = np.array(item["embedding"])
            i_norm = np.linalg.norm(i_vec)
            
            if q_norm > 0 and i_norm > 0:
                # Cosine similarity calculation
                similarity = np.dot(q_vec, i_vec) / (q_norm * i_norm)
                # Keep within bounds [0.0, 1.0]
                similarity = max(0.0, min(1.0, (similarity + 1.0) / 2.0 if collection_name == "resumes" else similarity))
            else:
                similarity = 0.5
                
            results.append({
                "id": int(item_id),
                "score": float(similarity)
            })
            
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        
        # Format response keys to match expectations
        key_name = "candidate_id" if collection_name == "resumes" else "job_id"
        return [{key_name: item["id"], "score": item["score"]} for item in results[:n_results]]

# Singleton instance
chroma_client = ChromaClient()
