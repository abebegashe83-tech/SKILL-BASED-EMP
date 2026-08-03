from django.urls import path
from .views import ContactMessageView, LandingContentView

urlpatterns = [
    path('', ContactMessageView.as_view(), name='contact-message'),
    path('landing-content/', LandingContentView.as_view(), name='landing-content'),
]
