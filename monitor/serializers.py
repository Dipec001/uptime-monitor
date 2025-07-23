from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Website, CHECK_INTERVAL_CHOICES, UptimeCheckResult, NotificationPreference
from urllib.parse import urlparse, urlunparse
from datetime import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        # Create the user using create_user to hash the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class WebsiteSerializer(serializers.ModelSerializer):
    check_interval_display = serializers.SerializerMethodField()

    class Meta:
        model = Website
        fields = [
            'id',
            'name',
            'url',
            'check_interval',
            'check_interval_display',
            'is_active'
        ]
        read_only_fields = ['id','created_at','is_active']

    def get_check_interval_display(self, obj):
        return dict(CHECK_INTERVAL_CHOICES).get(obj.check_interval)

    def validate_url(self, value):
        user = self.context['request'].user

        # Parse and normalize URL
        parsed = urlparse(value)
        normalized_path = parsed.path.rstrip('/')
        normalized_url = urlunparse(parsed._replace(
            path=normalized_path,
            scheme=parsed.scheme.lower(),
            netloc=parsed.netloc.lower()
        ))

        # Check for duplicate with normalized URL
        if Website.objects.filter(user=user, url=normalized_url).exists():
            raise serializers.ValidationError("You already have a monitor for this URL.")

        return normalized_url
    
    def create(self, validated_data):
        validated_data['next_check_at'] = timezone.now()  # 🔥 ensures website gets picked up immediately
        return super().create(validated_data)


class UptimeCheckResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UptimeCheckResult
        fields = '__all__'
        read_only_fields = ['checked_at', 'status_code', 'response_time_ms']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'website', 'method', 'target', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']

    def validate_website(self, website):
        if website.user != self.context['request'].user:
            raise serializers.ValidationError("You do not own this website.")
        return website

    def validate(self, data):
        method = data.get('method')
        target = data.get('target')

        if method == 'email' and '@' not in target:
            raise serializers.ValidationError("Invalid email address.")
        if method in ['slack', 'webhook'] and not target.startswith('http'):
            raise serializers.ValidationError("Target must be a valid URL for Slack or Webhook.")

        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)