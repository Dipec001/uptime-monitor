from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, APIException
from monitor.serializers import (
    RegisterSerializer,
    WebsiteSerializer,
    NotificationPreferenceSerializer,
    HeartBeatSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    SocialAuthSerializer,
    UserSerializer,
    UserLoginSerializer
)
from .models import Website, NotificationPreference, HeartBeat, UptimeCheckResult
from .tasks import process_ping
from .alerts import (
    send_test_website_notification,
    send_test_heartbeat_notification
)
from rest_framework.throttling import UserRateThrottle
from django.http import Http404
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import permission_classes, api_view
import uuid
import logging
from django.db.models import OuterRef, Subquery
from .oauth_utils import (
    verify_google_token,
    verify_github_token,
    GoogleAuthError,
    GitHubAuthError
)

logger = logging.getLogger('monitor')

User = get_user_model()
    

class RegisterView(generics.GenericAPIView):
    """
    API endpoint for user registration with logging.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info("🔵 Received registration request: %s", request.data)

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            logger.info("[✓] User registered successfully: %s", user.email)

            return Response({
                'message': "User registered successfully",
                'user': UserSerializer(user).data,
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("🔥 Unexpected error during registration: %s", str(e))
            raise APIException("Something went wrong. Please try again later.")


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class WebsiteViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Website.objects.none()
        return Website.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(
                f"[!] Website validation failed: {serializer.errors}"
                f"by {request.user.email}"
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        website = serializer.save(user=request.user)
        logger.info(f"[✓] Monitor created: {website.url} by {request.user.email}")
        return Response(
            self.get_serializer(website).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        logger.debug(
            f"Update attempt with data: {request.data} by {request.user.email}"
        )

        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
        except Http404:
            logger.warning(
                f"[!] Update failed: Monitor not found for ID {kwargs.get('pk')} "
                f"by {request.user.email}"
            )
            return Response(
                {"detail": "Monitor not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            logger.warning(
                f"[!] Update validation failed: {serializer.errors} "
                f"by {request.user.email}"
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        website = serializer.save()
        logger.info(f"[✓] Monitor updated: {website.url} by {request.user.email}")
        return Response(serializer.data)

    def perform_destroy(self, instance):
        logger.warning(
            f"[!] Monitor deleted: {instance.url} by {self.request.user.email}"
        )
        return super().perform_destroy(instance)


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return NotificationPreference.objects.none()
        return NotificationPreference.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user

        try:
            serializer.save()
            target_type = serializer.validated_data.get("content_type").model
            target_id = serializer.validated_data.get("object_id")
            logger.info(
                f"[✓] Notification preference created for user {user.id} "
                f"on {target_type} {target_id}."
            )
        except IntegrityError:
            method = serializer.validated_data.get("method")
            logger.warning(
                f"[!] Duplicate notification preference for user {user.id}, "
                f"target ({serializer.validated_data.get('content_type')}, "
                f"{serializer.validated_data.get('object_id')}), "
                f"method {method}."
            )
            raise ValidationError(
                f"You already have a {method} preference for this object."
            )

    def perform_update(self, serializer):
        user = self.request.user
        try:
            serializer.save()
            logger.info(f"[✓] Notification preference updated for user {user.id}.")
        except IntegrityError:
            method = serializer.validated_data.get("method")
            logger.warning(
                f"[!] Duplicate on update: user {user.id}, method {method}."
            )
            raise ValidationError(
                f"You already have a {method} preference for this object."
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def ping_heartbeat(request, key):
    """Endpoint to receive heartbeat pings asynchronously."""

    try:
        uuid_key = uuid.UUID(str(key))
    except ValueError:
        return Response(
            {
                "error": "Invalid key format"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if heartbeat exists
    heartbeat = HeartBeat.objects.filter(key=uuid_key).first()
    if not heartbeat:
        return Response(
            {
                "error": "Heartbeat not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    metadata = {
        "ip": request.META.get("REMOTE_ADDR"),
        "user_agent": request.META.get("HTTP_USER_AGENT"),
    }

    try:
        process_ping.delay(str(uuid_key), metadata)
        logger.info(
            f"Ping queued for heartbeat {heartbeat.name} (User: {heartbeat.user.email})"
        )
        return Response({"message": "Ping queued"})
    except Exception as e:
        logger.error(f"Error queueing ping for heartbeat {heartbeat.name}: {e}")
        return Response(
            {"error": "Failed to queue ping"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class HeartBeatViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for HeartBeat objects.
    Only authenticated users can create/list/edit/delete their own heartbeats.
    """
    serializer_class = HeartBeatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return heartbeats belonging to current user
        return HeartBeat.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Ensure user cannot change heartbeat ownership
        serializer.save(user=self.request.user)


class TestNotificationView(generics.GenericAPIView):
    """
    API endpoint to test notification methods for a given target (Website or HeartBeat).

    POST /api/notifications/test/
    Body: {
        "model": "website",  # or "heartbeat"
        "object_id": 123,
        "method": "email",
        "target": "user@example.com"
    }
    """
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [UserRateThrottle]  # Rate limiting to prevent abuse

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            logger.warning(
                f"[!] Test notification validation failed: {serializer.errors} "
                f"by {request.user.email}"
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        target_object = data.get("target_object")  # From validate() via GenericForeignKey
        method = data.get("method")
        target = data.get("target")
        content_type = data.get("content_type")

        if not target_object:
            return Response(
                {"error": "Target object not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ownership already validated in serializer, but double-check
        if hasattr(target_object, "user") and target_object.user != request.user:
            raise PermissionDenied("You do not own this object.")

        # Send test notification based on method
        try:
            if method == "email":
                self._send_test_email(
                    target_object=target_object,
                    content_type=content_type,
                    email=target,
                    user=request.user
                )
            elif method == "slack":
                self._send_test_slack(
                    target_object=target_object,
                    webhook_url=target,
                    user=request.user
                )
            elif method == "webhook":
                self._send_test_webhook(
                    target_object=target_object,
                    webhook_url=target,
                    user=request.user
                )
            else:
                return Response(
                    {"error": f"Unsupported notification method: {method}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info(
                f"[✓] Test notification sent to {target} via {method} "
                f"for user {request.user.email} on {target_object}."
            )

            return Response(
                {
                    "status": "success",
                    "message": f"Test notification sent to {target} via {method}.",
                    "monitor_type": content_type.model,
                    "monitor_name": getattr(target_object, 'name', str(target_object))
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"[!] Failed to send test notification: {e}", exc_info=True)
            return Response(
                {"error": "Failed to send test notification.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _send_test_email(self, target_object, content_type, email, user):
        """Send test email notification"""
        model_name = content_type.model

        if model_name == 'website':
            send_test_website_notification.delay(
                email=email,
                user_name=user.first_name or user.username,
                website_name=target_object.name or target_object.url,
                website_url=target_object.url
            )
        elif model_name == 'heartbeat':
            send_test_heartbeat_notification.delay(
                email=email,
                user_name=user.first_name or user.username,
                heartbeat_name=target_object.name,
                heartbeat_interval=target_object.interval
            )
        else:
            raise ValueError(f"Unsupported model type: {model_name}")

    def _send_test_slack(self, target_object, webhook_url, user):
        """Send test Slack notification"""
        # TODO: Implement Slack notification
        # For now, queue a task
        # from .tasks import send_test_slack_notification
        # send_test_slack_notification.delay(
        #     webhook_url=webhook_url,
        #     user_name=user.first_name or user.username,
        #     monitor_name=getattr(target_object, 'name', str(target_object))
        # )

    def _send_test_webhook(self, target_object, webhook_url, user):
        """Send test webhook notification"""
        # TODO: Implement webhook notification
        # For now, queue a task
        # from .tasks import send_test_webhook_notification
        # send_test_webhook_notification.delay(
        #     webhook_url=webhook_url,
        #     user_name=user.first_name or user.username,
        #     monitor_name=getattr(target_object, 'name', str(target_object))
        # )


class ForgotPasswordView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        logger.info(
            f"[✓] Password reset requested for {serializer.validated_data['email']}"
        )
        return Response(result, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(
                f"[✓] Password reset successful for user {serializer.user.email}"
            )
            return Response(
                {
                    "detail": "Password reset successful."
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Stats
        total_websites = Website.objects.filter(user=user).count()
        active_websites = Website.objects.filter(user=user, is_active=True).count()
        total_heartbeats = HeartBeat.objects.filter(user=user).count()
        active_heartbeats = HeartBeat.objects.filter(user=user, status="up").count()

        # Subquery: get latest check per website
        latest_check = UptimeCheckResult.objects.filter(
            website=OuterRef("pk")
        ).order_by("-checked_at")

        websites = (
            Website.objects.filter(user=user)
            .annotate(
                last_status_code=Subquery(latest_check.values("status_code")[:1]),
                last_checked_at=Subquery(latest_check.values("checked_at")[:1]),
            )
            .order_by("-created_at")[:5]  # last 5 websites
        )

        recent_monitors = []
        for site in websites:
            status = "unknown"
            if site.last_status_code is not None:
                status = "up" if 200 <= site.last_status_code < 300 else "down"

            recent_monitors.append({
                "website_name": site.name or site.url,
                "status": status,
                "last_check": site.last_checked_at,
                "uptime": None,  # placeholder for later % uptime calc
            })

        # Recent heartbeats
        recent_heartbeats = (
            HeartBeat.objects.filter(user=user)
            .order_by("-last_ping")[:5]
        )
        recent_heartbeats_list = []
        for hb in recent_heartbeats:
            recent_heartbeats_list.append({
                "cronjob_name": hb.name,
                "status": hb.status,
                "last_ping": hb.last_ping,
                "uptime": 100 if hb.status == "up" else 0
            })

        data = {
            "stats": {
                "total_websites": total_websites,
                "active_websites": active_websites,
                "total_heartbeats": total_heartbeats,
                "active_heartbeats": active_heartbeats
            },
            "recent_monitors": recent_monitors,
            "recent_heartbeats": recent_heartbeats_list,
        }

        return Response(data)


def trigger_error(request):
    # Don’t leave this route active in production long-term
    raise Exception("Test 500 error — monitoring check")


class SocialAuthView(APIView):
    """
    Handle social authentication with flexible account linking
    
    Logic:
    1. If user exists with this provider_id → Login (existing OAuth user)
    2. If user exists with this email → Link provider to existing account
    3. If user doesn't exist → Create new user with OAuth
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SocialAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        provider = serializer.validated_data['provider']
        access_token = serializer.validated_data['access_token']
        
        try:
            # Verify token with OAuth provider
            if provider == 'google':
                user_info = verify_google_token(access_token)
                provider_id_field = 'google_id'
                provider_id = user_info['google_id']
            elif provider == 'github':
                user_info = verify_github_token(access_token)
                provider_id_field = 'github_id'
                provider_id = user_info['github_id']
            else:
                return Response(
                    {'error': 'Invalid provider'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create user with flexible linking
            user, is_new_user = self._get_or_create_user(
                user_info, 
                provider_id_field, 
                provider_id
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'is_new_user': is_new_user,
                'linked_provider': provider,
                'auth_methods': user.auth_methods  # Show all available login methods
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except (GoogleAuthError, GitHubAuthError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': 'Authentication failed', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_or_create_user(self, user_info, provider_id_field, provider_id):
        """
        Get existing user or create new one with flexible account linking
        
        Returns:
            tuple: (user, is_new_user)
        """
        email = user_info['email']
        
        # ============================================
        # Step 1: Try to find user by provider ID
        # ============================================
        # Example: User previously logged in with Google
        user = User.objects.filter(**{provider_id_field: provider_id}).first()
        if user:
            # Update user info from OAuth provider
            self._update_user_info(user, user_info)
            return user, False
        
        # ============================================
        # Step 2: Try to find user by email (LINK ACCOUNTS)
        # ============================================
        # Example: User signed up with email/password, now wants to add Google
        user = User.objects.filter(email=email).first()
        if user:
            # Check if this provider is already linked to another account
            existing_provider_user = User.objects.filter(
                **{provider_id_field: provider_id}
            ).first()
            
            if existing_provider_user and existing_provider_user.id != user.id:
                raise Exception(
                    f"This {provider_id_field.replace('_id', '')} account is already "
                    f"linked to another user"
                )
            
            # Link this OAuth provider to existing account
            setattr(user, provider_id_field, provider_id)
            self._update_user_info(user, user_info)
            
            return user, False
        
        # ============================================
        # Step 3: Create new user (first time OAuth login)
        # ============================================
        user = self._create_new_user(user_info, provider_id_field, provider_id)
        return user, True
    
    def _update_user_info(self, user, user_info):
        """Update user information from OAuth provider"""
        # Only update if new data is available and fields are empty
        if user_info.get('first_name') and not user.first_name:
            user.first_name = user_info['first_name']
        
        if user_info.get('last_name') and not user.last_name:
            user.last_name = user_info['last_name']
        
        # Always update avatar (user might change it on OAuth provider)
        if user_info.get('avatar'):
            user.avatar = user_info['avatar']
        
        user.save()
    
    def _create_new_user(self, user_info, provider_id_field, provider_id):
        """Create a new user from OAuth data"""
        email = user_info['email']
        
        # Create user with OAuth provider linked
        user = User.objects.create(
            email=email,
            first_name=user_info.get('first_name', ''),
            last_name=user_info.get('last_name', ''),
            avatar=user_info.get('avatar', ''),
            **{provider_id_field: provider_id}
        )
        
        # User created via OAuth has no password initially
        user.set_unusable_password()
        user.save()
        
        return user


# ============================================
# Check Authentication Methods
# ============================================

class UserAuthMethodsView(APIView):
    """
    Check what authentication methods are available for a user
    Useful for showing appropriate login options
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            return Response({
                'email': email,
                'auth_methods': user.auth_methods,
                'has_password': user.has_usable_password(),
                'has_google': bool(user.google_id),
                'has_github': bool(user.github_id),
            })
        except User.DoesNotExist:
            return Response({
                'email': email,
                'auth_methods': [],
                'user_exists': False,
                'message': 'No account found with this email'
            })


# ============================================
# Set Password (for OAuth users)
# ============================================

class SetPasswordView(APIView):
    """
    Allow OAuth-only users to set a password
    """
    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        password = request.data.get('password')
        
        if not password or len(password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        user.set_password(password)
        user.save()
        
        return Response({
            'message': 'Password set successfully',
            'auth_methods': user.auth_methods
        })
