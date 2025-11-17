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
    UserLoginSerializer,
    UserProfileSerializer
)
from .models import (
    Website,
    NotificationPreference,
    HeartBeat,
    UptimeCheckResult,
    PingLog
)
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
from rest_framework.decorators import permission_classes, api_view, action
import uuid
import logging
from django.db.models import OuterRef, Subquery
from .oauth_utils import (
    verify_google_token,
    verify_github_token,
    GoogleAuthError,
    GitHubAuthError
)
from django.core.mail import send_mail
from django.conf import settings
import os
from dotenv import load_dotenv
import requests
from datetime import timedelta
from django.utils.timezone import now
from django.core.validators import validate_email
from django.contrib.contenttypes.models import ContentType

load_dotenv()

logger = logging.getLogger('monitor')

User = get_user_model()


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info("🔵 Received registration request: %s", request.data)

        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as ve:
            logger.warning("[!] Registration validation failed: %s", ve.detail)
            # DRF will automatically return 400 if you let it propagate
            # Clean up the ugly Django error messages
            if 'email' in ve.detail:
                error_msg = ve.detail['email'][0]
                if 'already exists' in str(error_msg).lower():
                    return Response({
                        'email': ['This email is already registered. Try logging in instead!']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            raise ve
        except Exception as e:
            logger.exception("🔥 Unexpected error during registration: %s", str(e))
            raise APIException("Something went wrong. Please try again later.")

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        logger.info("[✓] User registered successfully: %s", user.email)

        return Response({
            'message': "User registered successfully",
            'user': UserSerializer(user).data,
            'is_new_user': True,
            'token': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        logger.info(f"Login attempt for email: {request.data.get('email')}")
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.warning(f"Login failed for email: {request.data.get('email')} - {str(e)}")
            raise

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        # Get remember_me from request
        remember = request.data.get("remember_me", False)

        if remember:
            # Extend token lifetimes for "Remember me"
            refresh.set_exp(lifetime=timedelta(days=30))
            refresh.access_token.set_exp(lifetime=timedelta(days=7))
            logger.info(f"'Remember me' enabled for user: {user.email}")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveAPIView):
    """
    GET /api/user/profile/
    Retrieve current user's profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


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
    
    # ✅ NEW: Custom detail action with extended data
    @action(detail=True, methods=['get'])
    def detail_view(self, request, pk=None):
        """Get extended detail view with stats and history"""
        website = self.get_object()
        
        # Get latest check
        latest_check = (
            UptimeCheckResult.objects
            .filter(website=website)
            .order_by('-checked_at')
            .first()
        )

        # Calculate uptime percentage (last 24 hours)
        twenty_four_hours_ago = now() - timedelta(hours=24)
        recent_checks = UptimeCheckResult.objects.filter(
            website=website,
            checked_at__gte=twenty_four_hours_ago
        )
        
        total_checks = recent_checks.count()
        successful_checks = recent_checks.filter(
            status_code__gte=200,
            status_code__lt=300
        ).count()
        
        uptime_percentage = (
            (successful_checks / total_checks * 100) 
            if total_checks > 0 else 0
        )

        # Response time chart (last 24 hours)
        response_time_data = []
        for check in recent_checks.order_by('checked_at'):
            response_time_data.append({
                "time": check.checked_at.isoformat(),
                "response_time": round(check.response_time_ms, 2),
                "status_code": check.status_code,
            })

        # Recent check history (last 20)
        recent_history = []
        for check in UptimeCheckResult.objects.filter(website=website).order_by('-checked_at')[:20]:
            recent_history.append({
                "checked_at": check.checked_at,
                "status_code": check.status_code,
                "response_time": round(check.response_time_ms, 2),
                "error_message": check.error_message,
                "ip": check.ip,
            })

        # Get notification preferences
        website_content_type = ContentType.objects.get_for_model(Website)
        notifications = NotificationPreference.objects.filter(
            user=request.user,
            content_type=website_content_type,
            object_id=website.id
        )

        notification_list = []
        for notif in notifications:
            notification_list.append({
                "id": notif.id,
                "method": notif.method,
                "target": notif.target,
            })

        data = {
            "website": WebsiteSerializer(website, context={'request': request}).data,
            "latest_check": {
                "status_code": latest_check.status_code if latest_check else None,
                "response_time": round(latest_check.response_time_ms, 2) if latest_check else None,
                "checked_at": latest_check.checked_at if latest_check else None,
                "status": "up" if latest_check and 200 <= latest_check.status_code < 300 else "down" if latest_check else "unknown",
            },
            "uptime_percentage": round(uptime_percentage, 2),
            "total_checks_24h": total_checks,
            "successful_checks_24h": successful_checks,
            "response_time_chart": response_time_data,
            "recent_history": recent_history,
            "notifications": notification_list,
        }

        return Response(data)


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


@api_view(['GET', 'POST'])
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
    
    # Extract runtime from POST body if provided
    if request.method == 'POST' and request.data.get('runtime'):
        metadata['runtime'] = request.data.get('runtime')

    try:
        process_ping.delay(str(uuid_key), metadata)
        logger.info(
            f"Ping queued for heartbeat {heartbeat.name} (User: {heartbeat.user.email})"
        )
        return Response({"message": "Ping queued", "status": "ok"})
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

    # ✅ NEW: Custom detail action with extended data
    @action(detail=True, methods=['get'])
    def detail_view(self, request, pk=None):
        """Get extended detail view with ping history"""
        heartbeat = self.get_object()
        
        # Get recent pings (last 24 hours)
        twenty_four_hours_ago = now() - timedelta(hours=24)
        recent_pings = PingLog.objects.filter(
            heartbeat=heartbeat,
            timestamp__gte=twenty_four_hours_ago
        ).order_by('timestamp')

        # Ping history chart
        ping_history_chart = []
        for ping in recent_pings:
            ping_history_chart.append({
                "time": ping.timestamp.isoformat(),
                "status": ping.status,
                "runtime": ping.runtime,
            })

        # Recent ping logs (last 20)
        recent_logs = []
        for ping in PingLog.objects.filter(heartbeat=heartbeat).order_by('-timestamp')[:20]:
            recent_logs.append({
                "timestamp": ping.timestamp,
                "status": ping.status,
                "runtime": ping.runtime,
                "notes": ping.notes,
                "ip": ping.ip,
                "user_agent": ping.user_agent,
            })

        # Calculate uptime
        total_pings = recent_pings.count()
        successful_pings = recent_pings.filter(status='success').count()
        uptime_percentage = (
            (successful_pings / total_pings * 100) 
            if total_pings > 0 else 0
        )

        # Get notification preferences
        heartbeat_content_type = ContentType.objects.get_for_model(HeartBeat)
        notifications = NotificationPreference.objects.filter(
            user=request.user,
            content_type=heartbeat_content_type,
            object_id=heartbeat.id
        )

        notification_list = []
        for notif in notifications:
            notification_list.append({
                "id": notif.id,
                "method": notif.method,
                "target": notif.target,
            })

        data = {
            "heartbeat": HeartBeatSerializer(heartbeat, context={'request': request}).data,
            "uptime_percentage": round(uptime_percentage, 2),
            "total_pings_24h": total_pings,
            "successful_pings_24h": successful_pings,
            "ping_history_chart": ping_history_chart,
            "recent_logs": recent_logs,
            "notifications": notification_list,
        }

        return Response(data)


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
        total_websites = Website.objects.filter(user=user, is_active=True).count()
        
        # ✅ Count websites that are actually UP (not down)
        # A website is "up" if its last check had a successful status code
        latest_check = UptimeCheckResult.objects.filter(
            website=OuterRef("pk")
        ).order_by("-checked_at")

        websites_with_status = (
            Website.objects.filter(user=user, is_active=True)
            .annotate(
                last_status_code=Subquery(latest_check.values("status_code")[:1]),
            )
        )

        # Count how many have successful status codes (200-299)
        active_websites = sum(
            1 for site in websites_with_status 
            if site.last_status_code and 200 <= site.last_status_code < 300
        )

        total_heartbeats = HeartBeat.objects.filter(user=user).count()
        active_heartbeats = HeartBeat.objects.filter(user=user, status="up").count()

        # Recent monitors with response time
        websites = (
            Website.objects.filter(user=user)
            .annotate(
                last_status_code=Subquery(latest_check.values("status_code")[:1]),
                last_checked_at=Subquery(latest_check.values("checked_at")[:1]),
                last_response_time=Subquery(latest_check.values("response_time_ms")[:1]),
            )
            .order_by("-created_at")[:5]
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
                "response_time": site.last_response_time,
                "uptime": None,
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

        # Response Time Chart Data (Last 24 Hours)
        twenty_four_hours_ago = now() - timedelta(hours=24)
        
        response_time_checks = (
            UptimeCheckResult.objects.filter(
                website__user=user,
                checked_at__gte=twenty_four_hours_ago
            )
            .values('checked_at', 'response_time_ms')
            .order_by('checked_at')
        )

        response_time_chart = []
        for check in response_time_checks:
            response_time_chart.append({
                "time": check['checked_at'].isoformat(),  # Send full datetime
                "response_time": round(check['response_time_ms'], 2)
            })

        # Recent Incidents
        recent_incidents = []
        failed_checks = (
            UptimeCheckResult.objects.filter(
                website__user=user,
                status_code__gte=400
            )
            .select_related('website')
            .order_by('-checked_at')[:10]
        )

        for check in failed_checks:
            recent_incidents.append({
                "name": check.website.name or check.website.url,
                "type": "website",
                "timestamp": check.checked_at,
                "reason": check.error_message or f"HTTP {check.status_code}",
            })

        data = {
            "stats": {
                "total_websites": total_websites,
                "active_websites": active_websites,  # ✅ Now accurate
                "total_heartbeats": total_heartbeats,
                "active_heartbeats": active_heartbeats
            },
            "recent_monitors": recent_monitors,
            "recent_heartbeats": recent_heartbeats_list,
            "response_time_chart": response_time_chart,
            "recent_incidents": recent_incidents,
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
        print("Provider:", provider, "Access Token:", access_token)  # Debugging line
        
        try:
            # Verify token with OAuth provider
            if provider == 'google':
                user_info = verify_google_token(access_token)
                provider_id_field = 'google_id'
                provider_id = user_info['google_id']
            elif provider == 'github':
                # GitHub sends a CODE, need to exchange it first
                real_access_token = self._exchange_github_code(access_token)
                user_info = verify_github_token(real_access_token)
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
    
    def _exchange_github_code(self, code):
        """Exchange GitHub authorization code for access token"""
        print("Exchanging GitHub code for access token:", code)  # Debugging line
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            headers={'Accept': 'application/json'},
            data={
                'client_id': os.getenv('GITHUB_OAUTH_CLIENT_ID'),
                'client_secret': os.getenv('GITHUB_OAUTH_CLIENT_SECRET'),
                'code': code
            },
            timeout=10
        )
        
        token_data = token_response.json()
        
        if 'access_token' not in token_data:
            logger.error("GitHub token exchange failed: %s", token_data)
            raise GitHubAuthError(
                token_data.get('error_description', 'Failed to exchange code for token')
            )
        
        return token_data['access_token']


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


class BulkCreateWebsitesView(generics.GenericAPIView):
    """
    Bulk create websites for onboarding
    """
    serializer_class = WebsiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        websites_data = request.data.get("websites")

        if not websites_data or not isinstance(websites_data, list):
            return Response(
                {"error": "'websites' must be a non-empty list."},
                status=status.HTTP_400_BAD_REQUEST
            )

        created = []
        errors = []

        for index, data in enumerate(websites_data):
            # Only accept URL from onboarding — name is blank for now
            serializer = self.get_serializer(data={"url": data.get("url")})
            if serializer.is_valid():
                website = serializer.save(
                    user=request.user,
                    next_check_at=now()  # ensures monitoring begins immediately
                )
                created.append(self.get_serializer(website).data)
            else:
                errors.append({"index": index, "errors": serializer.errors})

        return Response(
            {
                "created": created,
                "errors": errors,
            },
            status=status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED
        )


class BulkCreateAlertsView(generics.GenericAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        object_ids = request.data.get("object_ids", [])
        model = request.data.get("model")
        method = request.data.get("method")
        target = request.data.get("target")

        if not object_ids or not isinstance(object_ids, list):
            return Response({"error": "'object_ids' must be a non-empty list."}, status=400)

        created, errors = [], []

        for index, object_id in enumerate(object_ids):
            serializer = self.get_serializer(
                data={
                    "model": model,
                    "object_id": object_id,
                    "method": method,
                    "target": target,
                }
            )
            if serializer.is_valid():
                pref = serializer.save(user=request.user)
                created.append(self.get_serializer(pref).data)
            else:
                errors.append({"index": index, "errors": serializer.errors})

        status_code = status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED
        return Response({"created": created, "errors": errors}, status=status_code)


class TestEmailNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        # Optional: Validate email format
        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email format"}, status=400)

        try:
            send_mail(
                subject="AliveChecks Test Notification",
                message="This is a test email from AliveChecks.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False
            )
            return Response({"message": "Test email sent successfully!"}, status=200)
        except Exception as e:
            logger.error(f"Failed to send test email: {str(e)}")
            return Response({
                "error": "Failed to send test email. Please try again."
            }, status=500)
