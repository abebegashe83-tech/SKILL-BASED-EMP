from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    id: Optional[int] = None
    email: str
    skills: List[str] = Field(default_factory=list)
    experience: str = ""
    bio: str = ""
    education: str = ""
    location: str = ""
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "skills": ["python", "django", "javascript", "react"],
                "experience": "5 years of full-stack development",
                "bio": "Experienced developer specializing in web technologies",
                "education": "BS Computer Science",
                "location": "San Francisco, CA"
            }
        }


class Job(BaseModel):
    id: Optional[int] = None
    title: str
    required_skills: List[str] = Field(default_factory=list)
    description: str = ""
    salary: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[str] = None
    is_active: bool = True
    created_by: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Senior Full-Stack Developer",
                "required_skills": ["python", "django", "javascript", "react"],
                "description": "Looking for an experienced full-stack developer to join our team",
                "salary": "$120,000 - $150,000",
                "location": "Remote",
                "experience_level": "Senior",
                "is_active": True,
                "created_by": 1
            }
        }


class RecommendationResult(BaseModel):
    job: Job
    final_score: float
    embedding_score: float
    skill_overlap_score: float
    semantic_skill_score: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "job": {
                    "id": 1,
                    "title": "Senior Full-Stack Developer",
                    "required_skills": ["python", "django", "javascript", "react"],
                    "description": "Looking for an experienced full-stack developer"
                },
                "final_score": 85.5,
                "embedding_score": 88.0,
                "skill_overlap_score": 90.0,
                "semantic_skill_score": 75.0
            }
        }


class RecommendationRequest(BaseModel):
    user: UserProfile
    jobs: List[Job]
    top_k: int = 10
    min_score: float = 50.0
    expand_skills: bool = True
    skill_expansion_threshold: float = 0.6
