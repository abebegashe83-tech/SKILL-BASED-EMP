from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.jobs.models import Job
from apps.jobs.serializers import JobSerializer
from django.contrib.auth import get_user_model
from services.recommendation_service import get_job_recommendations
from apps.users.models import JobseekerProfile
from .serializers import JobRecommendationSerializer
from services.skill_extraction_service import (
    extract_skills_from_description,
    suggest_skills_from_partial,
    get_role_skills,
    enhance_job_skills
)

User = get_user_model()

class RecommendJobsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        print("AI MATCHING STARTED")
        print(f"User: {request.user.email if request.user.is_authenticated else 'Anonymous'}, Role: {getattr(request.user, 'role', 'N/A')}")
        
        if not request.user.is_authenticated:
            return Response({"message": "Authentication required for personalized recommendations. Please log in as a jobseeker."}, status=status.HTTP_200_OK)
        
        if getattr(request.user, 'role', '').lower() != 'jobseeker':
            return Response({"error": "Only jobseekers can receive job recommendations."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = request.user.jobseeker_profile
        except JobseekerProfile.DoesNotExist:
            return Response({"error": "Jobseeker profile not found."}, status=status.HTTP_404_NOT_FOUND)

        print(f"Profile found: {profile.id if hasattr(profile, 'id') else 'N/A'}")
            
        try:
            recommendations = get_job_recommendations(profile, top_n=5)
            print(f"Recommendations returned: {len(recommendations)}")
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        response_data = []
        for rec in recommendations:
            response_data.append({
                "similarity_score": rec.get('score', rec.get('final_score', 0)),
                "skill_score": rec.get('skill_score', 0),
                "related_score": rec.get('related_score', 0),
                "experience_score": rec.get('experience_score', 0),
                "source": rec.get('source', 'profile'),
                "job": rec['job'],
                "direct_matches": rec.get('direct_matches', []),
                "related_matches": rec.get('related_matches', []),
                "reason": rec.get('reason', ''),
                "exact_match": rec.get('exact_match', False),
                "embedding": rec.get('embedding', 0),
                "overlap": rec.get('overlap', 0),
                "related": rec.get('related', 0)
            })
            
        serializer = JobRecommendationSerializer(response_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RankCandidatesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        print("AI CANDIDATE RANKING STARTED")
        print(f"Job ID: {job_id}")
        
        if request.user.role != 'EMPLOYER':
            return Response({"error": "Only employers can rank candidates."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            job = Job.objects.get(id=job_id, created_by=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        print(f"Job: {job.title}")
        
        from services.recommendation_service import calculate_match_score
        from apps.applications.models import Application
        
        applications = Application.objects.filter(job=job)
        print(f"Candidates who applied: {applications.count()}")
        
        ranked_candidates = []
        for application in applications:
            profile = application.user.jobseeker_profile if hasattr(application.user, 'jobseeker_profile') else None
            if profile:
                score_data = calculate_match_score(job, profile)
                ranked_candidates.append({
                    "match_score": score_data.get('score', score_data.get('final_score', 0)),
                    "skill_score": score_data.get('skill_score', 0),
                    "experience_score": score_data.get('experience_score', 0),
                    "source": score_data.get('source', 'profile'),
                    "candidate_info": {
                        "id": application.user.id,
                        "email": application.user.email,
                        "skills": getattr(profile, 'skills', [])
                    }
                })
        
        ranked_candidates.sort(key=lambda x: x['match_score'], reverse=True)
        
        print("Top ranked candidates:")
        for i, candidate in enumerate(ranked_candidates[:3], 1):
            print(f"  {i}. {candidate['candidate_info']['email']} - Score: {candidate['match_score']}%")
            
        return Response(ranked_candidates, status=status.HTTP_200_OK)


class ExtractSkillsView(APIView):
    """
    Extract skills from natural language job description.
    POST with description to get semantically matched skills.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        description = request.data.get('description', '')
        threshold = float(request.data.get('threshold', 0.6))
        top_k = int(request.data.get('top_k', 10))
        
        if not description:
            return Response(
                {"error": "Description is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            extracted_skills = extract_skills_from_description(
                description, 
                threshold=threshold, 
                top_k=top_k
            )
            return Response({
                "description": description,
                "extracted_skills": extracted_skills,
                "count": len(extracted_skills)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SuggestSkillsView(APIView):
    """
    Get skill suggestions based on partial input or role.
    GET with partial skill name or role name to get suggestions.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        partial = request.query_params.get('partial', '')
        role = request.query_params.get('role', '')
        top_k = int(request.query_params.get('top_k', 5))
        
        if role:
            # Get skills for a specific role
            skills = get_role_skills(role)
            return Response({
                "role": role,
                "suggested_skills": skills[:top_k],
                "count": len(skills[:top_k])
            }, status=status.HTTP_200_OK)
        
        if partial:
            # Get autocomplete suggestions
            suggestions = suggest_skills_from_partial(partial, top_k=top_k)
            return Response({
                "partial": partial,
                "suggestions": suggestions,
                "count": len(suggestions)
            }, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Either 'partial' or 'role' parameter is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class EnhanceSkillsView(APIView):
    """
    Enhance existing skills with semantically extracted skills from description.
    POST with existing skills and description to get enhanced skill list.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        existing_skills = request.data.get('existing_skills', [])
        description = request.data.get('description', '')
        
        if not description:
            return Response(
                {"error": "Description is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            enhanced_skills = enhance_job_skills(description, existing_skills)
            return Response({
                "existing_skills": existing_skills,
                "description": description,
                "enhanced_skills": enhanced_skills,
                "added_skills": [s for s in enhanced_skills if s not in existing_skills],
                "count": len(enhanced_skills)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
