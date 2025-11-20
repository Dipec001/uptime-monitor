from rest_framework import serializers
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
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .alerts import send_password_reset_email_task
from django.conf import settings

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data in API responses
    Shows what auth methods the user has available
    """
    auth_methods = serializers.SerializerMethodField()
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'is_active',
            'auth_methods',      # NEW: Shows ["google", "email_password"]
            'has_password',      # NEW: True/False
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_auth_methods(self, obj):
        """Return list of available authentication methods"""
        return obj.auth_methods

    def get_has_password(self, obj):
        """Check if user has a usable password"""
        return obj.has_usable_password()


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving and updating user profile
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']


class SocialAuthSerializer(serializers.Serializer):
    """
    Validates social auth tokens from frontend

    Frontend sends:
    {
        "provider": "google" or "github",
        "access_token": "token_from_oauth_provider"
    }
    """
    provider = serializers.ChoiceField(choices=['google', 'github'])
    access_token = serializers.CharField(required=True, min_length=10)

    def validate_provider(self, value):
        """Ensure provider is supported"""
        if value not in ['google', 'github']:
            raise serializers.ValidationError(
                "Invalid provider. Choose 'google' or 'github'"
            )
        return value

    def validate_access_token(self, value):
        """Basic token validation"""
        if not value or len(value) < 10:
            raise serializers.ValidationError("Invalid access token")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    """
    For traditional email/password registration
    """
    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists. "
                "Try logging in or use 'Forgot Password'."
            )
        return value
    
    def validate_password(self, value):
        """Simple password validation - just minimum length"""
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        return value

    def create(self, validated_data):
        """Create new user with email/password"""

        # Create user using the manager (handles password hashing)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
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
            'is_active',
            'last_downtime_at',
            'last_recovered_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'last_downtime_at',
            'last_recovered_at',
        ]

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

        # Exclude current instance from duplicate check
        existing_query = Website.objects.filter(user=user, url=normalized_url)
        
        # If this is an update (instance exists), exclude the current instance
        if self.instance:
            existing_query = existing_query.exclude(pk=self.instance.pk)

        # Check for duplicate with normalized URL
        if existing_query.exists():
            raise serializers.ValidationError(
                "You already have a monitor for this URL."
            )

        return normalized_url

    def create(self, validated_data):
        # ensures website gets picked up immediately
        validated_data['next_check_at'] = timezone.now()
        return super().create(validated_data)


class UptimeCheckResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UptimeCheckResult
        fields = '__all__'
        read_only_fields = [
            'checked_at',
            'status_code',
            'response_time_ms'
        ]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    MODEL_CHOICES = (("heartbeat", "HeartBeat"), ("website", "Website"))
    model = serializers.ChoiceField(choices=MODEL_CHOICES, write_only=True)

    class Meta:
        model = NotificationPreference
        fields = [
            "id",
            "user",
            "model",
            "object_id",
            "method",
            "target",
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
        # If PATCH, reuse instance values instead of requiring them in data
        if self.instance:
            data["content_type"] = self.instance.content_type
            data["object_id"] = self.instance.object_id
            data["target_object"] = self.instance.target_object
        else:
            if not model_name:
                raise serializers.ValidationError("model is required.")

            if model_name.lower() == "heartbeat":
                data["content_type"] = ContentType.objects.get_for_model(HeartBeat)
            elif model_name.lower() == "website":
                data["content_type"] = ContentType.objects.get_for_model(Website)
            else:
                raise serializers.ValidationError(
                    "Invalid model type. Must be 'heartbeat' or 'website'."
                )

            # Validate object exists only on create
            object_id = data.get("object_id")
            model_class = data["content_type"].model_class()
            try:
                obj = model_class.objects.get(id=object_id)
                data["target_object"] = obj
            except model_class.DoesNotExist:
                raise serializers.ValidationError(
                    f"{model_class.__name__} with id {object_id} does not exist."
                )

            # Ownership check
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
                raise serializers.ValidationError(
                    "Target must be a valid URL for Slack/Webhook."
                )

        return data

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data.pop("model", None)  # Remove the friendly field
        validated_data.pop("target_object", None)  # Don't save this to DB
        return super().create(validated_data)

    def update(self, instance, validated_data):
        obj_id = validated_data.get("object_id")
        if obj_id and obj_id != instance.object_id:
            raise serializers.ValidationError("Changing object_id is not allowed.")

        model = validated_data.get("model")
        if model and model.lower() != instance.content_type.model:
            raise serializers.ValidationError("Changing model is not allowed.")

        validated_data.pop("target_object", None)
        return super().update(instance, validated_data)


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
            'is_active',
            'status',
            'next_due',  # show next due field
            'last_ping',
            'created_at',
            'ping_url'
        ]
        read_only_fields = [
            'id',
            'key',
            'status',
            'last_ping',
            'next_due',
            'created_at',
            'ping_url'
        ]

    def get_ping_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/ping/{obj.key}/')
        return f'/api/ping/{obj.key}/'

    def validate_interval(self, value):
        if value < 10:
            raise serializers.ValidationError(
                "Interval must be at least 10 seconds."
            )
        return value

    def create(self, validated_data):
        hb = super().create(validated_data)
        hb.update_next_due()
        hb.save(update_fields=["next_due"])
        return hb


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        """
        Always accept the email without revealing if the user exists.
        """
        try:
            user = User.objects.get(email=value)

            # If OAuth-only user, warn the user instead of sending reset link
            if not user.has_usable_password():
                raise serializers.ValidationError(
                    "This account uses a social login provider. "
                    "Please sign in with Google or GitHub instead."
                )

            # Store for use in save()
            self.user = user

        except User.DoesNotExist:
            # Don't reveal anything — continue silently
            self.user = None

        return value

    def save(self):
        """
        Always respond success, but only send email if user exists.
        """
        email = self.validated_data["email"]
        user = getattr(self, "user", None)

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = f"{settings.FRONTEND_BASE_URL}/reset-password/{uid}/{token}/"

            # Send via Celery
            send_password_reset_email_task.delay(
                user_email=email,
                reset_link=reset_link
            )

        # Always act as if it worked
        return {
            "detail": "If an account with this email exists, a reset link has been sent."
        }


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


class UserLoginSerializer(serializers.Serializer):
    """
    For traditional email/password login
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Validate credentials"""
        email = attrs.get('email')
        password = attrs.get('password')

        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No account found with this email address."
            )

        # Check if user has a password set
        if not user.has_usable_password():
            raise serializers.ValidationError(
                "This account was created using Google or GitHub. "
                "Please use 'Continue with Google/GitHub' to sign in."
            )

        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError(
                "Incorrect password. Please try again."
            )

        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError(
                "This account has been deactivated. Please contact support."
            )

        attrs['user'] = user
        return attrs
