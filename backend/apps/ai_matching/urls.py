from django.urls import path
from .views import (
    RecommendJobsView, 
    RankCandidatesView,
    ExtractSkillsView,
    SuggestSkillsView,
    EnhanceSkillsView
)

urlpatterns = [
    path('recommendations/', RecommendJobsView.as_view(), name='recommendations'),
    path('rank-candidates/<int:job_id>/', RankCandidatesView.as_view(), name='rank-candidates'),
    path('extract-skills/', ExtractSkillsView.as_view(), name='extract-skills'),
    path('suggest-skills/', SuggestSkillsView.as_view(), name='suggest-skills'),
    path('enhance-skills/', EnhanceSkillsView.as_view(), name='enhance-skills'),
]
