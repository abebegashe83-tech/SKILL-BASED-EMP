from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import ContactMessageSerializer, LandingContentSerializer
from .models import LandingContent
import os
from django.conf import settings

class ContactMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Contact message sent successfully'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LandingContentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        data = LandingContent.objects.all()
        serializer = LandingContentSerializer(data, many=True, context={'request': request})
        return Response(serializer.data)


class LandingImagesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Return list of image URLs from media/landing folder"""
        landing_dir = os.path.join(settings.MEDIA_ROOT, 'landing')
        images = []

        if os.path.exists(landing_dir):
            for filename in os.listdir(landing_dir):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                    image_url = f'/media/landing/{filename}'
                    images.append({
                        'url': image_url,
                        'name': filename
                    })

        return Response({
            'images': images,
            'count': len(images)
        })
