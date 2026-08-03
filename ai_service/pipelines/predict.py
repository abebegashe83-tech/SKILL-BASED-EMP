import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.matching_service import MatchingService
from models.schemas import UserProfile, Job, RecommendationRequest
from typing import List, Dict, Any


class PredictionPipeline:
    def __init__(self):
        self.matching_service = MatchingService()

    def predict(
        self,
        user: Dict[str, Any],
        jobs: List[Dict[str, Any]],
        top_k: int = 10,
        min_score: float = 50.0,
        expand_skills: bool = True,
        skill_expansion_threshold: float = 0.6
    ) -> List[Dict[str, Any]]:
        recommendations = self.matching_service.match(
            user=user,
            jobs=jobs,
            top_k=top_k,
            min_score=min_score,
            expand_skills=expand_skills,
            skill_expansion_threshold=skill_expansion_threshold
        )
        return recommendations

    def predict_single(self, user: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        recommendations = self.predict(user=user, jobs=[job], top_k=1, min_score=0.0)
        return recommendations[0] if recommendations else None


if __name__ == "__main__":
    sample_user = {
        "id": 1,
        "email": "user@example.com",
        "skills": ["python", "django", "javascript", "react"],
        "experience": "5 years of full-stack development",
        "bio": "Experienced developer specializing in web technologies"
    }
    
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
    
    pipeline = PredictionPipeline()
    recommendations = pipeline.predict(sample_user, sample_jobs)
    
    print("\n=== RECOMMENDATIONS ===")
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['job']['title']} - Score: {rec['final_score']}%")
        print(f"   Embedding Score: {rec['embedding_score']}%")
        print(f"   Skill Overlap: {rec['skill_overlap_score']}%")
        print(f"   Semantic Skill: {rec['semantic_skill_score']}%")
