from rest_framework import serializers
from .models import ContactMessage, LandingContent

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'name', 'email', 'message', 'created_at', 'is_read')
        read_only_fields = ('id', 'created_at', 'is_read')


class LandingContentSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = LandingContent
        fields = ('id', 'title', 'subtitle', 'image', 'image_url', 'section', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
