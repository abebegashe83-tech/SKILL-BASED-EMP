import numpy as np
from typing import List, Dict, Any
from collections import Counter
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.skill_normalizer import SkillNormalizer
from services.embedding_service import EmbeddingService
from app.config import SCORE_WEIGHTS


TECH_DOMAIN = ["react", "nodejs", "python", "javascript", "django", "java", "spring", "angular", "vue", "typescript", "golang", "rust", "kubernetes", "docker", "aws", "azure", "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "graphql", "rest", "api", "microservices", "devops", "ci/cd", "git", "linux", "agile", "scrum", "machine learning", "data science", "deep learning", "nlp", "ai"]
HEALTH_DOMAIN = ["nurse", "doctor", "medical", "clinic", "patient", "healthcare", "hospital", "surgery", "pharmacy", "medicine", "diagnosis", "treatment", "clinical", "physician", "surgeon", "dentist", "pharmacist", "radiology", "pathology", "oncology", "cardiology", "neurology", "pediatrics", "emergency", "triage", "vitals", "cpr", "epidemiology", "public health"]
BUSINESS_DOMAIN = ["sales", "marketing", "finance", "accounting", "management", "hr", "recruiting", "consulting", "strategy", "operations", "logistics", "supply chain", "procurement", "customer service", "business development", "partnerships", "revenue", "profit", "budgeting", "forecasting", "financial planning", "investment", "banking", "insurance", "real estate", "compliance", "auditing", "risk management"]


class MatchingService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.normalizer = SkillNormalizer()

    def _create_weighted_text(self, skills: List[str], context: str = "") -> str:
        weighted_skills = " ".join([f"{skill} " * 3 for skill in skills])
        return f"{weighted_skills} {context}".strip()

    def _jaccard_similarity(self, set1: set, set2: set) -> float:
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return intersection / union if union > 0 else 0.0

    def _compute_skill_overlap_score(self, user_skills: List[str], job_skills: List[str]) -> float:
        user_skill_set = set(user_skills)
        job_skill_set = set(job_skills)
        return self._jaccard_similarity(user_skill_set, job_skill_set)

    def _compute_semantic_skill_score(self, user_skills: List[str], job_skills: List[str]) -> float:
        if not user_skills or not job_skills:
            return 0.0
        
        similarities = []
        for user_skill in user_skills:
            user_embedding = self.embedding_service.get_skill_embedding(user_skill)
            max_similarity = 0.0
            
            for job_skill in job_skills:
                job_embedding = self.embedding_service.get_skill_embedding(job_skill)
                similarity = self.embedding_service.compute_similarity(user_embedding, job_embedding)
                max_similarity = max(max_similarity, similarity)
            
            similarities.append(max_similarity)
        
        return np.mean(similarities) if similarities else 0.0

    def _compute_embedding_score(self, user_text: str, job_text: str) -> float:
        user_embedding = self.embedding_service.get_embedding(user_text)
        job_embedding = self.embedding_service.get_embedding(job_text)
        similarity = self.embedding_service.compute_similarity(user_embedding, job_embedding)
        return (similarity + 1) / 2

    def _detect_domain(self, skills: List[str]) -> str:
        if not skills:
            return "other"
        
        skills_lower = [skill.lower() for skill in skills]
        
        tech_count = sum(1 for skill in skills_lower if any(tech in skill for tech in TECH_DOMAIN))
        health_count = sum(1 for skill in skills_lower if any(health in skill for health in HEALTH_DOMAIN))
        business_count = sum(1 for skill in skills_lower if any(biz in skill for biz in BUSINESS_DOMAIN))
        
        if tech_count > 0:
            return "tech"
        elif health_count > 0:
            return "health"
        elif business_count > 0:
            return "business"
        else:
            return "other"

    def _preprocess_user(self, user: Dict[str, Any], expand_skills: bool = True, threshold: float = 0.6) -> Dict[str, Any]:
        user_skills_raw = user.get('skills', [])
        if isinstance(user_skills_raw, str):
            user_skills = self.normalizer.tokenize(user_skills_raw)
        elif isinstance(user_skills_raw, list):
            user_skills = [self.normalizer.normalize(s) for s in user_skills_raw]
        else:
            user_skills = []
        
        if expand_skills:
            user_skills = self.normalizer.expand_skills(
                user_skills,
                self.embedding_service,
                threshold
            )
        
        user_context = user.get('bio', '') or user.get('experience', '') or ''
        user_weighted_text = self._create_weighted_text(user_skills, user_context)
        
        return {
            'skills': user_skills,
            'weighted_text': user_weighted_text
        }

    def _preprocess_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        job_skills_raw = job.get('required_skills', [])
        if isinstance(job_skills_raw, str):
            job_skills = self.normalizer.tokenize(job_skills_raw)
        elif isinstance(job_skills_raw, list):
            job_skills = [self.normalizer.normalize(s) for s in job_skills_raw]
        else:
            job_skills = []
        
        job_description = job.get('description', '')
        job_weighted_text = self._create_weighted_text(job_skills, job_description)
        
        return {
            'skills': job_skills,
            'weighted_text': job_weighted_text
        }

    def match(
        self,
        user: Dict[str, Any],
        jobs: List[Dict[str, Any]],
        top_k: int = 10,
        min_score: float = 50.0,
        expand_skills: bool = True,
        skill_expansion_threshold: float = 0.6
    ) -> List[Dict[str, Any]]:
        user_processed = self._preprocess_user(user, expand_skills, skill_expansion_threshold)
        
        if not user_processed['skills'] or len(user_processed['skills']) == 0:
            recommendations = []
            for job in jobs:
                recommendations.append({
                    'job': job,
                    'final_score': 0.0,
                    'embedding_score': 0.0,
                    'skill_overlap_score': 0.0,
                    'semantic_skill_score': 0.0,
                })
            return recommendations[:top_k]
        
        user_domain = self._detect_domain(user_processed['skills'])
        
        recommendations = []
        
        for job in jobs:
            job_processed = self._preprocess_job(job)
            job_domain = self._detect_domain(job_processed['skills'])
            
            user_skills = [s.strip().lower() for s in user_processed['skills'] if s and s.strip()]
            job_skills = [s.strip().lower() for s in job_processed['skills'] if s and s.strip()]
            
            intersection = set(user_skills) & set(job_skills)
            
            if len(intersection) == 0:
                semantic_scores = []
                for u in user_skills:
                    for j in job_skills:
                        u_emb = self.embedding_service.get_skill_embedding(u)
                        j_emb = self.embedding_service.get_skill_embedding(j)
                        sim = self.embedding_service.compute_similarity(u_emb, j_emb)
                        semantic_scores.append(sim)
                
                max_semantic = max(semantic_scores) if semantic_scores else 0
                
                if max_semantic < 0.3:
                    recommendations.append({
                        'job': job,
                        'final_score': 0.0,
                        'embedding_score': 0.0,
                        'skill_overlap_score': 0.0,
                        'semantic_skill_score': 0.0,
                    })
                    continue
                
                if user_domain != job_domain:
                    recommendations.append({
                        'job': job,
                        'final_score': 0.0,
                        'embedding_score': 0.0,
                        'skill_overlap_score': 0.0,
                        'semantic_skill_score': 0.0,
                    })
                    continue
            
            embedding_score = self._compute_embedding_score(
                user_processed['weighted_text'],
                job_processed['weighted_text']
            )
            skill_overlap_score = self._compute_skill_overlap_score(
                user_processed['skills'],
                job_processed['skills']
            )
            semantic_skill_score = self._compute_semantic_skill_score(
                user_processed['skills'],
                job_processed['skills']
            )
            
            final_score = (
                0.6 * embedding_score +
                0.25 * skill_overlap_score +
                0.15 * semantic_skill_score
            )
            
            if user_domain != job_domain:
                final_score = final_score * 0.5
            
            final_score = max(0, min(final_score, 1))
            final_score_percentage = int(final_score * 100)
            
            if final_score_percentage >= min_score:
                recommendations.append({
                    'job': job,
                    'final_score': round(final_score_percentage, 2),
                    'embedding_score': round(embedding_score * 100, 2),
                    'skill_overlap_score': round(skill_overlap_score * 100, 2),
                    'semantic_skill_score': round(semantic_skill_score * 100, 2),
                })
        
        recommendations.sort(key=lambda x: x['final_score'], reverse=True)
        return recommendations[:top_k]

    def precompute_job_embeddings(self, jobs: List[Dict[str, Any]]):
        for job in jobs:
            job_processed = self._preprocess_job(job)
            job_id = job.get('id')
            job_embedding = self.embedding_service.get_embedding(job_processed['weighted_text'])
            self.embedding_service.cache_job_embedding(job_id, job_embedding)
