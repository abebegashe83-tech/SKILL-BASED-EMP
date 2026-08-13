from django.urls import path
from .views import ContactMessageView, LandingContentView, LandingImagesView

urlpatterns = [
    path('', ContactMessageView.as_view(), name='contact-message'),
    path('landing-content/', LandingContentView.as_view(), name='landing-content'),
    path('landing-images/', LandingImagesView.as_view(), name='landing-images'),
]
