"""
Demo script to test job matching between an employer's job posting and a job seeker's profile
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.schemas import UserProfile, Job, RecommendationRequest
from api.routes import get_recommendations


def print_separator():
    print("\n" + "="*80 + "\n")


def main():
    print_separator()
    print("🎯 JOB MATCHING SYSTEM DEMO")
    print_separator()
    
    # ============================================================================
    # EMPLOYER: Creating a Job Posting
    # ============================================================================
    print("👔 EMPLOYER JOB POSTING")
    print("-" * 80)
    
    job_posting = Job(
        id=1,
        title="Senior Full-Stack Developer",
        required_skills=[
            "Python",
            "Django",
            "React",
            "JavaScript",
            "PostgreSQL",
            "REST API",
            "Docker",
            "Git",
            "AWS"
        ],
        description="""
        We are looking for a Senior Full-Stack Developer to join our growing team.
        
        Responsibilities:
        - Design and develop scalable web applications using Django and React
        - Build and maintain RESTful APIs
        - Work with PostgreSQL databases and optimize queries
        - Deploy applications using Docker and AWS
        - Collaborate with cross-functional teams in an Agile environment
        - Mentor junior developers and conduct code reviews
        
        Requirements:
        - 5+ years of experience in full-stack development
        - Strong proficiency in Python and Django framework
        - Expert knowledge of React and modern JavaScript (ES6+)
        - Experience with PostgreSQL and database design
        - Familiarity with Docker containerization
        - Experience with AWS cloud services
        - Strong problem-solving skills and attention to detail
        """,
        salary="$120,000 - $150,000",
        location="Remote (US-based)",
        experience_level="Senior",
        is_active=True,
        created_by=100
    )
    
    print(f"Job Title: {job_posting.title}")
    print(f"Location: {job_posting.location}")
    print(f"Salary: {job_posting.salary}")
    print(f"Experience Level: {job_posting.experience_level}")
    print(f"\nRequired Skills:")
    for skill in job_posting.required_skills:
        print(f"  • {skill}")
    print(f"\nDescription: {job_posting.description.strip()[:200]}...")
    
    print_separator()
    
    # ============================================================================
    # JOB SEEKER: Creating a Profile
    # ============================================================================
    print("👤 JOB SEEKER PROFILE")
    print("-" * 80)
    
    job_seeker = UserProfile(
        id=1,
        email="john.developer@email.com",
        skills=[
            "Python",
            "Django",
            "React",
            "JavaScript",
            "TypeScript",
            "PostgreSQL",
            "MySQL",
            "REST API",
            "GraphQL",
            "Docker",
            "Kubernetes",
            "Git",
            "AWS",
            "CI/CD",
            "Agile"
        ],
        experience="""
        6 years of professional experience as a Full-Stack Developer.
        
        Recent Experience:
        - Senior Developer at Tech Solutions Inc. (2021-Present)
          * Led development of microservices architecture using Django and React
          * Implemented CI/CD pipelines and containerized applications with Docker
          * Managed AWS infrastructure and optimized cloud costs by 30%
          
        - Full-Stack Developer at StartupXYZ (2018-2021)
          * Built RESTful APIs serving 100K+ daily active users
          * Developed responsive web applications using React and Redux
          * Optimized PostgreSQL queries reducing response time by 50%
        """,
        bio="""
        Passionate full-stack developer with expertise in building scalable web applications.
        I love working with modern technologies and solving complex problems. 
        Strong advocate for clean code, test-driven development, and continuous learning.
        """,
        education="Bachelor of Science in Computer Science, State University (2017)",
        location="San Francisco, CA"
    )
    
    print(f"Name: John Developer")
    print(f"Email: {job_seeker.email}")
    print(f"Location: {job_seeker.location}")
    print(f"Education: {job_seeker.education}")
    print(f"\nSkills ({len(job_seeker.skills)} total):")
    for skill in job_seeker.skills:
        print(f"  • {skill}")
    print(f"\nExperience Summary: {job_seeker.experience.strip()[:200]}...")
    print(f"\nBio: {job_seeker.bio.strip()}")
    
    print_separator()
    
    # ============================================================================
    # AI MATCHING: Getting Recommendations
    # ============================================================================
    print("🤖 AI MATCHING ENGINE - ANALYZING...")
    print("-" * 80)
    
    # Create recommendation request
    recommendation_request = RecommendationRequest(
        user=job_seeker,
        jobs=[job_posting],
        top_k=10,
        min_score=0.0,  # Show all matches regardless of score
        expand_skills=True,
        skill_expansion_threshold=0.6
    )
    
    # Get recommendations
    recommendations = get_recommendations(recommendation_request)
    
    print_separator()
    
    # ============================================================================
    # RESULTS: Display Matching Results
    # ============================================================================
    print("📊 MATCHING RESULTS")
    print("-" * 80)
    
    if recommendations:
        for idx, rec in enumerate(recommendations, 1):
            job = rec['job']
            print(f"\nMatch #{idx}: {job['title']}")
            print(f"Company Location: {job['location']}")
            print(f"Salary Range: {job['salary']}")
            print(f"\n🎯 MATCH SCORES:")
            print(f"  ├─ Overall Match Score:      {rec['final_score']:.2f}%")
            print(f"  ├─ Embedding Score:          {rec['embedding_score']:.2f}%")
            print(f"  ├─ Skill Overlap Score:      {rec['skill_overlap_score']:.2f}%")
            print(f"  └─ Semantic Skill Score:     {rec['semantic_skill_score']:.2f}%")
            
            # Determine match quality
            final_score = rec['final_score']
            if final_score >= 80:
                match_quality = "🟢 EXCELLENT MATCH"
                recommendation = "Highly recommended! This job aligns very well with your skills."
            elif final_score >= 70:
                match_quality = "🟡 GOOD MATCH"
                recommendation = "Good fit! You have most of the required skills."
            elif final_score >= 60:
                match_quality = "🟠 MODERATE MATCH"
                recommendation = "Decent match. Some skill gaps but worth considering."
            else:
                match_quality = "🔴 LOW MATCH"
                recommendation = "Limited match. Significant skill gaps exist."
            
            print(f"\n{match_quality}")
            print(f"💡 Recommendation: {recommendation}")
            
            # Skill analysis
            job_skills_set = set([s.lower() for s in job['required_skills']])
            seeker_skills_set = set([s.lower() for s in job_seeker.skills])
            
            matching_skills = job_skills_set.intersection(seeker_skills_set)
            missing_skills = job_skills_set.difference(seeker_skills_set)
            
            print(f"\n✅ Matching Skills ({len(matching_skills)}):")
            for skill in sorted(matching_skills):
                print(f"  • {skill.title()}")
            
            if missing_skills:
                print(f"\n❌ Missing Skills ({len(missing_skills)}):")
                for skill in sorted(missing_skills):
                    print(f"  • {skill.title()}")
            
            print(f"\n📈 Skill Coverage: {len(matching_skills)}/{len(job_skills_set)} required skills")
            coverage_percentage = (len(matching_skills) / len(job_skills_set) * 100) if job_skills_set else 0
            print(f"   ({coverage_percentage:.1f}% coverage)")
    else:
        print("No matching jobs found.")
    
    print_separator()
    print("✨ Demo completed successfully!")
    print_separator()


if __name__ == "__main__":
    main()
