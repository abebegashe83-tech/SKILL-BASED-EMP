import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipelines.predict import PredictionPipeline
from models.schemas import UserProfile, Job
from typing import List, Dict, Any


def create_sample_user() -> Dict[str, Any]:
    return {
        "id": 1,
        "email": "john.doe@example.com",
        "skills": ["python", "django", "javascript", "react", "nodejs"],
        "experience": "5 years of full-stack development experience building scalable web applications",
        "bio": "Passionate developer with expertise in both backend and frontend technologies",
        "education": "BS Computer Science",
        "location": "San Francisco, CA"
    }


def create_sample_jobs() -> List[Dict[str, Any]]:
    return [
        {
            "id": 1,
            "title": "Senior Full-Stack Developer",
            "required_skills": ["python", "django", "javascript", "react"],
            "description": "Looking for an experienced full-stack developer to join our team building innovative web solutions",
            "salary": "$120,000 - $150,000",
            "location": "Remote",
            "experience_level": "Senior",
            "is_active": True,
            "created_by": 1
        },
        {
            "id": 2,
            "title": "Frontend Developer",
            "required_skills": ["javascript", "react", "typescript", "css"],
            "description": "Seeking a skilled frontend developer to build modern, responsive user interfaces",
            "salary": "$90,000 - $120,000",
            "location": "New York, NY",
            "experience_level": "Mid",
            "is_active": True,
            "created_by": 2
        },
        {
            "id": 3,
            "title": "Backend Developer",
            "required_skills": ["python", "django", "postgresql", "redis"],
            "description": "Backend developer needed for API development and database optimization",
            "salary": "$100,000 - $130,000",
            "location": "Remote",
            "experience_level": "Mid",
            "is_active": True,
            "created_by": 3
        },
        {
            "id": 4,
            "title": "DevOps Engineer",
            "required_skills": ["docker", "kubernetes", "aws", "terraform"],
            "description": "DevOps engineer to manage cloud infrastructure and CI/CD pipelines",
            "salary": "$130,000 - $160,000",
            "location": "Seattle, WA",
            "experience_level": "Senior",
            "is_active": True,
            "created_by": 4
        },
        {
            "id": 5,
            "title": "Machine Learning Engineer",
            "required_skills": ["python", "tensorflow", "pytorch", "scikit-learn"],
            "description": "ML engineer to develop and deploy machine learning models at scale",
            "salary": "$140,000 - $180,000",
            "location": "San Francisco, CA",
            "experience_level": "Senior",
            "is_active": True,
            "created_by": 5
        },
        {
            "id": 6,
            "title": "Data Scientist",
            "required_skills": ["python", "pandas", "numpy", "statistics"],
            "description": "Data scientist to analyze data and build predictive models",
            "salary": "$110,000 - $140,000",
            "location": "Boston, MA",
            "experience_level": "Mid",
            "is_active": True,
            "created_by": 6
        },
        {
            "id": 7,
            "title": "Mobile Developer",
            "required_skills": ["react native", "javascript", "ios", "android"],
            "description": "Mobile developer to build cross-platform mobile applications",
            "salary": "$100,000 - $130,000",
            "location": "Austin, TX",
            "experience_level": "Mid",
            "is_active": True,
            "created_by": 7
        },
        {
            "id": 8,
            "title": "Software Engineer",
            "required_skills": ["python", "java", "algorithms", "data structures"],
            "description": "Software engineer to work on core platform features",
            "salary": "$95,000 - $125,000",
            "location": "Remote",
            "experience_level": "Mid",
            "is_active": True,
            "created_by": 8
        }
    ]


def main():
    print("=" * 80)
    print("SKILL-BASED EMPLOYMENT MATCHING SYSTEM")
    print("=" * 80)
    print()
    
    user = create_sample_user()
    jobs = create_sample_jobs()
    
    print(f"User Profile: {user['email']}")
    print(f"Skills: {', '.join(user['skills'])}")
    print()
    print(f"Total Jobs Available: {len(jobs)}")
    print()
    
    pipeline = PredictionPipeline()
    
    print("Computing recommendations...")
    print()
    
    recommendations = pipeline.predict(
        user=user,
        jobs=jobs,
        top_k=10,
        min_score=30.0,
        expand_skills=True,
        skill_expansion_threshold=0.6
    )
    
    print("=" * 80)
    print("RECOMMENDATION RESULTS")
    print("=" * 80)
    print()
    
    if not recommendations:
        print("No recommendations found matching the criteria.")
    else:
        for i, rec in enumerate(recommendations, 1):
            print(f"{i}. {rec['job']['title']}")
            print(f"   Company: {rec['job'].get('location', 'N/A')}")
            print(f"   Salary: {rec['job'].get('salary', 'N/A')}")
            print(f"   Final Score: {rec['final_score']}%")
            print(f"   - Embedding Similarity: {rec['embedding_score']}%")
            print(f"   - Skill Overlap: {rec['skill_overlap_score']}%")
            print(f"   - Semantic Skill Match: {rec['semantic_skill_score']}%")
            print(f"   Required Skills: {', '.join(rec['job']['required_skills'])}")
            print()
    
    print("=" * 80)
    print(f"Total Recommendations: {len(recommendations)}")
    print("=" * 80)


if __name__ == "__main__":
    main()
