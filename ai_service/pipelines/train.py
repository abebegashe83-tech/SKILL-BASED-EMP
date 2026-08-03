import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.matching_service import MatchingService
from services.embedding_service import EmbeddingService
from services.skill_normalizer import SkillNormalizer
from models.schemas import Job
from typing import List, Dict, Any


class TrainingPipeline:
    def __init__(self):
        self.matching_service = MatchingService()
        self.embedding_service = self.matching_service.embedding_service
        self.normalizer = self.matching_service.normalizer

    def precompute_job_embeddings(self, jobs: List[Dict[str, Any]]) -> Dict[int, Any]:
        print(f"Precomputing embeddings for {len(jobs)} jobs...")
        
        embeddings = {}
        for job in jobs:
            job_id = job.get('id')
            job_skills_raw = job.get('required_skills', [])
            
            if isinstance(job_skills_raw, str):
                job_skills = self.normalizer.tokenize(job_skills_raw)
            elif isinstance(job_skills_raw, list):
                job_skills = [self.normalizer.normalize(s) for s in job_skills_raw]
            else:
                job_skills = []
            
            job_description = job.get('description', '')
            weighted_skills = " ".join([f"{skill} " * 3 for skill in job_skills])
            job_weighted_text = f"{weighted_skills} {job_description}".strip()
            
            job_embedding = self.embedding_service.get_embedding(job_weighted_text)
            embeddings[job_id] = job_embedding
            self.embedding_service.cache_job_embedding(job_id, job_embedding)
            
            print(f"  - Job {job_id}: {job.get('title', 'Unknown')} - Embedding cached")
        
        print(f"Precomputation complete. {len(embeddings)} job embeddings cached.")
        return embeddings

    def precompute_skill_embeddings(self, skills: List[str]) -> Dict[str, Any]:
        print(f"Precomputing embeddings for {len(skills)} skills...")
        
        embeddings = {}
        for skill in skills:
            normalized_skill = self.normalizer.normalize(skill)
            skill_embedding = self.embedding_service.get_embedding(normalized_skill)
            embeddings[normalized_skill] = skill_embedding
            self.embedding_service.cache_skill_embedding(normalized_skill, skill_embedding)
        
        print(f"Precomputation complete. {len(embeddings)} skill embeddings cached.")
        return embeddings

    def run(self, jobs: List[Dict[str, Any]], skills: List[str] = None):
        if skills:
            self.precompute_skill_embeddings(skills)
        return self.precompute_job_embeddings(jobs)


if __name__ == "__main__":
    sample_jobs = [
        {
            "id": 1,
            "title": "Senior Full-Stack Developer",
            "required_skills": ["python", "django", "javascript", "react"],
            "description": "Looking for an experienced full-stack developer to join our team"
        },
        {
            "id": 2,
            "title": "Frontend Developer",
            "required_skills": ["javascript", "react", "typescript", "css"],
            "description": "Seeking a skilled frontend developer for our web applications"
        },
        {
            "id": 3,
            "title": "Backend Developer",
            "required_skills": ["python", "django", "postgresql", "redis"],
            "description": "Backend developer needed for API development"
        }
    ]
    
    sample_skills = ["python", "django", "javascript", "react", "typescript", "nodejs", "sql"]
    
    pipeline = TrainingPipeline()
    pipeline.run(sample_jobs, sample_skills)
