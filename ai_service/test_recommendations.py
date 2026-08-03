import requests
import json

# Test data
user_profile = {
    "id": 1,
    "email": "jobseeker@example.com",
    "skills": ["python", "django", "javascript", "react", "sql"],
    "experience": "5 years of full-stack development",
    "bio": "Experienced developer specializing in web technologies",
    "education": "BS Computer Science",
    "location": "San Francisco, CA"
}

jobs = [
    {
        "id": 1,
        "title": "Senior Full-Stack Developer",
        "required_skills": ["python", "django", "javascript", "react"],
        "description": "Looking for an experienced full-stack developer to join our team",
        "salary": "$120,000 - $150,000",
        "location": "Remote"
    },
    {
        "id": 2,
        "title": "Backend Developer",
        "required_skills": ["python", "django", "postgresql"],
        "description": "Backend developer for API development",
        "salary": "$100,000 - $120,000",
        "location": "New York"
    },
    {
        "id": 3,
        "title": "Frontend Developer",
        "required_skills": ["javascript", "react", "css"],
        "description": "Frontend developer for UI development",
        "salary": "$90,000 - $110,000",
        "location": "Remote"
    }
]

# Test recommendation endpoint
print("Testing AI Recommendation System...")
print("=" * 50)

try:
    response = requests.post(
        "http://127.0.0.1:8001/recommendations",
        json={
            "user": user_profile,
            "jobs": jobs,
            "top_k": 5,
            "min_score": 30.0,
            "expand_skills": True
        }
    )

    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("\n✅ Recommendation System Working!")
        print("\nResponse:")
        print(json.dumps(response.json(), indent=2))
        
        # Analyze results
        recommendations = response.json()
        print(f"\n📊 Summary:")
        print(f"   Total recommendations: {len(recommendations)}")
        if recommendations:
            print(f"   Top match: {recommendations[0]['job']['title']} - Score: {recommendations[0]['final_score']}%")
            print(f"   Scores breakdown:")
            for i, rec in enumerate(recommendations[:3], 1):
                print(f"   {i}. {rec['job']['title']}: {rec['final_score']}% (Embedding: {rec['embedding_score']}%, Overlap: {rec['skill_overlap_score']}%, Semantic: {rec['semantic_skill_score']}%)")
    else:
        print(f"\n❌ Error: {response.text}")
        
except Exception as e:
    print(f"\n❌ Exception occurred: {e}")
