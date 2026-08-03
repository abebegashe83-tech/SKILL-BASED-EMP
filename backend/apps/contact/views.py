from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import ContactMessageSerializer, LandingContentSerializer
from .models import LandingContent

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
