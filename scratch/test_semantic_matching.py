"""
Test script for semantic job recommendation functionality.

This script tests:
1. Natural language skill extraction
2. Skill suggestion based on partial input
3. Role-based skill retrieval
4. Skill enhancement
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from services.skill_extraction_service import (
    extract_skills_from_description,
    suggest_skills_from_partial,
    get_role_skills,
    enhance_job_skills
)

def test_skill_extraction():
    """Test extracting skills from natural language descriptions."""
    print("=" * 60)
    print("TEST 1: Natural Language Skill Extraction")
    print("=" * 60)
    
    test_cases = [
        "I want backend developer",
        "Looking for frontend developer with React experience",
        "Need full stack developer who knows Python and JavaScript",
        "I want a mobile developer for iOS",
        "Looking for DevOps engineer with AWS and Docker experience"
    ]
    
    for description in test_cases:
        print(f"\nDescription: '{description}'")
        skills = extract_skills_from_description(description, threshold=0.5, top_k=8)
        print(f"Extracted skills: {[s['skill'] for s in skills]}")
        print(f"Similarities: {[(s['skill'], f'{s['similarity']:.2f}') for s in skills[:3]]}")

def test_skill_suggestions():
    """Test skill suggestions based on partial input."""
    print("\n" + "=" * 60)
    print("TEST 2: Skill Suggestions (Autocomplete)")
    print("=" * 60)
    
    test_cases = ["pyt", "rea", "nod", "jav", "dja"]
    
    for partial in test_cases:
        print(f"\nPartial: '{partial}'")
        suggestions = suggest_skills_from_partial(partial, top_k=5)
        print(f"Suggestions: {suggestions}")

def test_role_skills():
    """Test getting skills for specific roles."""
    print("\n" + "=" * 60)
    print("TEST 3: Role-Based Skills")
    print("=" * 60)
    
    test_cases = [
        "backend developer",
        "frontend developer",
        "full stack developer",
        "data scientist",
        "devops engineer"
    ]
    
    for role in test_cases:
        print(f"\nRole: '{role}'")
        skills = get_role_skills(role)
        print(f"Skills: {skills[:10]}")  # Show first 10

def test_skill_enhancement():
    """Test enhancing existing skills with extracted skills."""
    print("\n" + "=" * 60)
    print("TEST 4: Skill Enhancement")
    print("=" * 60)
    
    test_cases = [
        (["python", "django"], "I want backend developer with database experience"),
        (["javascript", "react"], "Looking for full stack developer with Node.js"),
        ([], "I want data scientist with machine learning experience")
    ]
    
    for existing_skills, description in test_cases:
        print(f"\nExisting skills: {existing_skills}")
        print(f"Description: '{description}'")
        enhanced = enhance_job_skills(description, existing_skills)
        added = [s for s in enhanced if s not in existing_skills]
        print(f"Enhanced skills: {enhanced}")
        print(f"Added skills: {added}")

def test_semantic_matching():
    """Test the complete semantic matching workflow."""
    print("\n" + "=" * 60)
    print("TEST 5: Complete Semantic Matching Workflow")
    print("=" * 60)
    
    # Simulate employer creating a job with natural language
    employer_description = "I want backend developer with Python and Django experience"
    print(f"\nEmployer says: '{employer_description}'")
    
    # Extract skills
    extracted_skills = extract_skills_from_description(employer_description, threshold=0.5, top_k=10)
    skill_list = [s['skill'] for s in extracted_skills]
    print(f"Extracted skills: {skill_list}")
    
    # Simulate job seeker with skills
    jobseeker_skills = ["python", "django", "flask", "postgresql", "javascript"]
    print(f"\nJob seeker has skills: {jobseeker_skills}")
    
    # Check for matches
    matches = set(skill_list) & set(jobseeker_skills)
    print(f"Direct skill matches: {matches}")
    
    # Calculate match percentage
    if skill_list:
        match_percentage = len(matches) / len(skill_list) * 100
        print(f"Match percentage: {match_percentage:.1f}%")

if __name__ == "__main__":
    try:
        test_skill_extraction()
        test_skill_suggestions()
        test_role_skills()
        test_skill_enhancement()
        test_semantic_matching()
        
        print("\n" + "=" * 60)
        print("ALL TESTS COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError during testing: {e}")
        import traceback
        traceback.print_exc()
