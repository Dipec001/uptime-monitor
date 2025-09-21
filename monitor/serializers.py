from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    Website, 
    CHECK_INTERVAL_CHOICES, 
    UptimeCheckResult, 
    NotificationPreference, 
    HeartBeat 
)
from urllib.parse import urlparse, urlunparse
from django.utils import timezone
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
        # ensures website gets picked up immediately
        validated_data['next_check_at'] = timezone.now()
        return super().create(validated_data)


class UptimeCheckResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UptimeCheckResult
        fields = '__all__'
        read_only_fields = ['checked_at', 'status_code', 'response_time_ms']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "user",
            "content_type",
            "object_id",
            "method",
            "target",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "user"]

    def validate(self, data):
        """
        Ensure NotificationPreference has valid content_type/object_id,
        user owns the target, and method/target are consistent.
        Works for both POST and PATCH.
        """
        instance = getattr(self, "instance", None)

        # Pick new values if provided, else fall back to existing instance
        content_type = data.get("content_type") or getattr(instance, "content_type", None)
        object_id = data.get("object_id") or getattr(instance, "object_id", None)
        method = data.get("method") or getattr(instance, "method", None)
        target = data.get("target") or getattr(instance, "target", None)

        user = self.context["request"].user

        # 1. Ensure content_type is valid and points to Website or HeartBeat
        if not content_type:
            raise serializers.ValidationError("content_type is required.")
        model_class = content_type.model_class()
        if model_class not in [Website, HeartBeat]:
            raise serializers.ValidationError("Invalid content type.")

        # 2. Ensure object_id exists
        if not object_id:
            raise serializers.ValidationError("object_id is required.")
        try:
            target_object = model_class.objects.get(id=object_id)
        except model_class.DoesNotExist:
            raise serializers.ValidationError("Target object does not exist.")

        # 3. Ownership check (Website/HeartBeat must belong to user)
        if hasattr(target_object, "user") and target_object.user != user:
            raise serializers.ValidationError("You do not own this target object.")

        # 4. Ensure method/target combo makes sense
        if not method:
            raise serializers.ValidationError("method is required.")
        if not target:
            raise serializers.ValidationError("target is required.")

        if method == "email" and "@" not in target:
            raise serializers.ValidationError("Invalid email address.")
        if method in ["slack", "webhook"]:
            if not (target.startswith("http://") or target.startswith("https://")):
                raise serializers.ValidationError("Target must be a valid URL for Slack/Webhook.")

        return data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)




class HeartBeatSerializer(serializers.ModelSerializer):
    """Serializer for HeartBeat model with ping URL generation."""
    ping_url = serializers.SerializerMethodField()

    class Meta:
        model = HeartBeat
        fields = [
            'id', 
            'name', 
            'key', 
            'interval', 
            'grace_period', 
            'status', 
            'last_ping', 
            'created_at', 
            'ping_url'
        ]
        read_only_fields = ['id', 'key', 'status', 'last_ping', 'created_at', 'ping_url']

    def get_ping_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/ping/{obj.key}/')
        return f'/api/ping/{obj.key}/'

    def validate_interval(self, value):
        if value < 10:
            raise serializers.ValidationError("Interval must be at least 10 seconds.")
        return value
