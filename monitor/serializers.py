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
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

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
    model = serializers.CharField(write_only=True)  # "heartbeat" or "website"
    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "user",
            "model",
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
        model_name = data.get("model")
        if not model_name:
            raise serializers.ValidationError("model is required.")
        
        if model_name.lower() == "heartbeat":
            data["content_type"] = ContentType.objects.get_for_model(HeartBeat)
        elif model_name.lower() == "website":
            data["content_type"] = ContentType.objects.get_for_model(Website)
        else:
            raise serializers.ValidationError("Invalid model type. Must be 'heartbeat' or 'website'.")

        # Validate object exists
        object_id = data.get("object_id")
        model_class = data["content_type"].model_class()
        try:
            obj = model_class.objects.get(id=object_id)
        except model_class.DoesNotExist:
            raise serializers.ValidationError(f"{model_class.__name__} with id {object_id} does not exist.")

        # 3. Ownership check (Website/HeartBeat must belong to user)
        # Ensure ownership
        user = self.context["request"].user
        if hasattr(obj, "user") and obj.user != user:
            raise serializers.ValidationError("You do not own this object.")
        
        # Validate method/target combo
        method = data.get("method")
        target = data.get("target")
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
        validated_data.pop("model", None)  # Remove the friendly field
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
            'next_due', # show next due field
            'last_ping', 
            'created_at', 
            'ping_url'
        ]
        read_only_fields = ['id', 'key', 'status', 'last_ping', 'next_due', 'created_at', 'ping_url']

    def get_ping_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/ping/{obj.key}/')
        return f'/api/ping/{obj.key}/'

    def validate_interval(self, value):
        if value < 10:
            raise serializers.ValidationError("Interval must be at least 10 seconds.")
        return value
    
    def create(self, validated_data):
        hb = super().create(validated_data)
        hb.update_next_due()
        hb.save(update_fields=["next_due"])
        return hb


from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .alerts import send_email_alert_task

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user with this email.")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_email_alert_task.delay(
            email,
            "Password Reset Request",
            f"Click the link to reset your password: {reset_link}"
        )

        return reset_link


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            uid = urlsafe_base64_decode(data["uid"]).decode()
            self.user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError("Invalid UID.")

        if not default_token_generator.check_token(self.user, data["token"]):
            raise serializers.ValidationError("Invalid or expired token.")

        return data

    def save(self):
        self.user.set_password(self.validated_data["new_password"])
        self.user.save()
        return self.user
