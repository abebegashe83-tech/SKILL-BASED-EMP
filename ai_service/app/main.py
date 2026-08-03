import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel

from api.routes import get_recommendations
from models.schemas import UserProfile, Job, RecommendationResult, RecommendationRequest

app = FastAPI(title="AI Matching Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequestAPI(BaseModel):
    user: Dict[str, Any]
    jobs: List[Dict[str, Any]]
    top_k: int = 10
    min_score: float = 30.0
    expand_skills: bool = True
    skill_expansion_threshold: float = 0.6

class SkillMatchRequest(BaseModel):
    job_skills: List[str]
    candidate_skills: List[str]
    threshold: float = 0.6

@app.post("/recommendations")
def recommendations_endpoint(request: RecommendationRequestAPI) -> List[Dict[str, Any]]:
    """Get job recommendations for a user"""
    # Convert to RecommendationRequest format
    user_profile = UserProfile(**request.user)
    jobs = [Job(**job) for job in request.jobs]
    
    recommendation_request = RecommendationRequest(
        user=user_profile,
        jobs=jobs,
        top_k=request.top_k,
        min_score=request.min_score,
        expand_skills=request.expand_skills,
        skill_expansion_threshold=request.skill_expansion_threshold
    )
    
    results = get_recommendations(recommendation_request)
    return results

@app.post("/skill-match")
def skill_match_endpoint(request: SkillMatchRequest) -> Dict[str, Any]:
    """Semantic skill matching endpoint for employers"""
    from services.matching_service import MatchingService
    from services.skill_normalizer import SkillNormalizer
    
    matching_service = MatchingService()
    normalizer = SkillNormalizer()
    
    # Normalize skills
    normalized_job_skills = [normalizer.normalize(s) for s in request.job_skills]
    normalized_candidate_skills = [normalizer.normalize(s) for s in request.candidate_skills]
    
    # Calculate semantic similarity
    embedding_score = matching_service._compute_semantic_skill_score(
        normalized_candidate_skills,
        normalized_job_skills
    )
    
    # Calculate skill overlap
    skill_overlap = matching_service._compute_skill_overlap_score(
        normalized_candidate_skills,
        normalized_job_skills
    )
    
    # Find matching skills
    job_set = set(normalized_job_skills)
    candidate_set = set(normalized_candidate_skills)
    matching_skills = list(job_set & candidate_set)
    
    # Find semantically similar skills
    similar_skills = []
    for job_skill in normalized_job_skills:
        if job_skill not in candidate_set:
            similar = matching_service.embedding_service.find_similar_skills(job_skill, request.threshold)
            for sim in similar:
                if sim in candidate_set:
                    similar_skills.append((job_skill, sim))
    
    return {
        "semantic_score": round(embedding_score * 100, 2),
        "skill_overlap": round(skill_overlap * 100, 2),
        "matching_skills": matching_skills,
        "semantically_similar": similar_skills,
        "job_skills": normalized_job_skills,
        "candidate_skills": normalized_candidate_skills
    }

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
