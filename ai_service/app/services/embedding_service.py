import numpy as np
from typing import List, Dict, Tuple, Optional
from sentence_transformers import SentenceTransformer
import pickle
import os


class EmbeddingService:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', cache_dir: str = None):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)
        self.cache_dir = cache_dir or os.path.join(os.path.dirname(__file__), '../../data/cache')
        os.makedirs(self.cache_dir, exist_ok=True)
        self.skill_embeddings_cache: Dict[str, np.ndarray] = {}
        self.job_embeddings_cache: Dict[int, np.ndarray] = {}
        self._load_skill_cache()

    def _get_cache_path(self, cache_type: str, identifier: str) -> str:
        return os.path.join(self.cache_dir, f"{cache_type}_{identifier}.pkl")

    def _load_skill_cache(self):
        cache_path = self._get_cache_path('skill', 'embeddings')
        if os.path.exists(cache_path):
            with open(cache_path, 'rb') as f:
                self.skill_embeddings_cache = pickle.load(f)

    def _save_skill_cache(self):
        cache_path = self._get_cache_path('skill', 'embeddings')
        with open(cache_path, 'wb') as f:
            pickle.dump(self.skill_embeddings_cache, f)

    def get_embedding(self, text: str) -> np.ndarray:
        return self.model.encode(text, convert_to_numpy=True)

    def get_embeddings_batch(self, texts: List[str]) -> np.ndarray:
        return self.model.encode(texts, convert_to_numpy=True)

    def cache_skill_embedding(self, skill: str, embedding: np.ndarray):
        self.skill_embeddings_cache[skill.lower()] = embedding
        self._save_skill_cache()

    def get_skill_embedding(self, skill: str) -> np.ndarray:
        skill_key = skill.lower()
        if skill_key not in self.skill_embeddings_cache:
            embedding = self.get_embedding(skill)
            self.cache_skill_embedding(skill_key, embedding)
        return self.skill_embeddings_cache[skill_key]

    def cache_job_embedding(self, job_id: int, embedding: np.ndarray):
        self.job_embeddings_cache[job_id] = embedding

    def get_job_embedding(self, job_id: int) -> Optional[np.ndarray]:
        return self.job_embeddings_cache.get(job_id)

    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        return float(np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2) + 1e-8))

    def find_similar_skills(self, skill: str, threshold: float = 0.6, top_k: int = 10) -> List[str]:
        if not self.skill_embeddings_cache:
            return []
        
        skill_embedding = self.get_skill_embedding(skill)
        similarities = []
        
        for cached_skill, cached_embedding in self.skill_embeddings_cache.items():
            if cached_skill.lower() != skill.lower():
                similarity = self.compute_similarity(skill_embedding, cached_embedding)
                if similarity >= threshold:
                    similarities.append((cached_skill, similarity))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in similarities[:top_k]]

    def precompute_skill_embeddings(self, skills: List[str]):
        for skill in skills:
            self.get_skill_embedding(skill)

    def clear_job_cache(self):
        self.job_embeddings_cache.clear()

    def clear_skill_cache(self):
        self.skill_embeddings_cache.clear()
        cache_path = self._get_cache_path('skill', 'embeddings')
        if os.path.exists(cache_path):
            os.remove(cache_path)
