import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Dict, Any
from models.schemas import UserProfile, Job, RecommendationResult, RecommendationRequest
from services.matching_service import MatchingService


def get_recommendations(request: RecommendationRequest) -> List[Dict[str, Any]]:
    matching_service = MatchingService()
    
    user_dict = request.user.model_dump()
    jobs_dict = [job.model_dump() for job in request.jobs]
    
    recommendations = matching_service.match(
        user=user_dict,
        jobs=jobs_dict,
        top_k=request.top_k,
        min_score=request.min_score,
        expand_skills=request.expand_skills,
        skill_expansion_threshold=request.skill_expansion_threshold
    )
    
    return recommendations
