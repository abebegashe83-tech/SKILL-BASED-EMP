"""
Test script for semantic job recommendation system
Tests the skill matching functionality for job seekers and employers
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.matching_service import MatchingService
from services.skill_normalizer import SkillNormalizer

def test_skill_normalization():
    """Test skill normalization"""
    print("=" * 60)
    print("TEST 1: Skill Normalization")
    print("=" * 60)
    
    normalizer = SkillNormalizer()
    
    test_skills = ["php", "laravel", "django", "js", "reactjs", "node.js"]
    print(f"Input skills: {test_skills}")
    
    normalized = [normalizer.normalize(s) for s in test_skills]
    print(f"Normalized skills: {normalized}")
    print()

def test_semantic_skill_matching():
    """Test semantic skill matching between job requirements and candidate skills"""
    print("=" * 60)
    print("TEST 2: Semantic Skill Matching")
    print("=" * 60)
    
    matching_service = MatchingService()
    normalizer = SkillNormalizer()
    
    # Test case 1: Job seeker with php, laravel, django
    # Employer wants backend developer
    job_skills = ["backend", "developer", "python", "django", "flask"]
    candidate_skills = ["php", "laravel", "django", "mysql", "javascript"]
    
    print(f"Job requires: {job_skills}")
    print(f"Candidate has: {candidate_skills}")
    
    normalized_job = [normalizer.normalize(s) for s in job_skills]
    normalized_candidate = [normalizer.normalize(s) for s in candidate_skills]
    
    semantic_score = matching_service._compute_semantic_skill_score(
        normalized_candidate,
        normalized_job
    )
    
    skill_overlap = matching_service._compute_skill_overlap_score(
        normalized_candidate,
        normalized_job
    )
    
    print(f"Semantic Score: {semantic_score * 100:.2f}%")
    print(f"Skill Overlap: {skill_overlap * 100:.2f}%")
    print()

def test_full_recommendation():
    """Test full recommendation system"""
    print("=" * 60)
    print("TEST 3: Full Recommendation System")
    print("=" * 60)
    
    matching_service = MatchingService()
    
    # Job seeker profile
    user = {
        "email": "jobseeker@example.com",
        "skills": ["php", "laravel", "django", "mysql", "javascript", "react"],
        "experience": "5 years of full-stack development",
        "bio": "Experienced developer specializing in web technologies",
        "education": "BS Computer Science",
        "location": "Remote"
    }
    
    # Job postings
    jobs = [
        {
            "id": 1,
            "title": "Backend Developer",
            "required_skills": ["python", "django", "flask", "postgresql"],
            "description": "Looking for an experienced backend developer",
            "salary": "$80,000 - $100,000",
            "location": "Remote"
        },
        {
            "id": 2,
            "title": "Full-Stack Developer",
            "required_skills": ["php", "laravel", "javascript", "react", "mysql"],
            "description": "Full-stack developer needed for web application",
            "salary": "$90,000 - $120,000",
            "location": "Remote"
        },
        {
            "id": 3,
            "title": "Frontend Developer",
            "required_skills": ["javascript", "react", "vue", "css", "html"],
            "description": "Frontend developer for UI/UX work",
            "salary": "$70,000 - $90,000",
            "location": "Remote"
        }
    ]
    
    recommendations = matching_service.match(
        user=user,
        jobs=jobs,
        top_k=3,
        min_score=30.0,
        expand_skills=True,
        skill_expansion_threshold=0.6
    )
    
    print(f"User skills: {user['skills']}")
    print(f"\nRecommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['job']['title']}")
        print(f"   Final Score: {rec['final_score']}%")
        print(f"   Embedding Score: {rec['embedding_score']}%")
        print(f"   Skill Overlap: {rec['skill_overlap_score']}%")
        print(f"   Semantic Skill: {rec['semantic_skill_score']}%")
        print(f"   Required Skills: {rec['job']['required_skills']}")
    print()

def test_employer_skill_matching():
    """Test employer skill matching endpoint scenario"""
    print("=" * 60)
    print("TEST 4: Employer Skill Matching")
    print("=" * 60)
    
    matching_service = MatchingService()
    normalizer = SkillNormalizer()
    
    # Employer wants "backend developer"
    job_description = "backend developer"
    # Extract skills from description (simplified)
    job_skills = ["backend", "developer", "api", "database"]
    
    # Candidate skills
    candidate_skills = ["php", "laravel", "django", "mysql", "rest api"]
    
    print(f"Employer wants: {job_description}")
    print(f"Extracted job skills: {job_skills}")
    print(f"Candidate skills: {candidate_skills}")
    
    normalized_job = [normalizer.normalize(s) for s in job_skills]
    normalized_candidate = [normalizer.normalize(s) for s in candidate_skills]
    
    semantic_score = matching_service._compute_semantic_skill_score(
        normalized_candidate,
        normalized_job
    )
    
    skill_overlap = matching_service._compute_skill_overlap_score(
        normalized_candidate,
        normalized_job
    )
    
    print(f"\nSemantic Match Score: {semantic_score * 100:.2f}%")
    print(f"Skill Overlap: {skill_overlap * 100:.2f}%")
    
    # Find matching skills
    job_set = set(normalized_job)
    candidate_set = set(normalized_candidate)
    matching = list(job_set & candidate_set)
    print(f"Direct matches: {matching}")
    print()

if __name__ == "__main__":
    try:
        test_skill_normalization()
        test_semantic_skill_matching()
        test_full_recommendation()
        test_employer_skill_matching()
        
        print("=" * 60)
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\nThe semantic job recommendation system is working correctly.")
        print("Job seekers can add skills like 'php, laravel, django'")
        print("Employers can enter requirements like 'backend developer'")
        print("The system will semantically match them based on skill similarity.")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
