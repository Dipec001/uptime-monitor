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
    ResetPasswordSerializer
)
from .models import Website, NotificationPreference, HeartBeat, UptimeCheckResult
from .tasks import process_ping
from django.http import Http404
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import permission_classes, api_view
import uuid
import logging
from django.db.models import OuterRef, Subquery

logger = logging.getLogger('monitor')

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info("🔵 Received registration request: %s", request.data)

        try:
            serializer = self.get_serializer(data=request.data)

            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)

                logger.info("[✓] User registered: %s", user.email)

                return Response({
                    "message": "User registered successfully",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                    },
                    "token": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)

            logger.warning("[!] Registration failed with errors: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("🔥 Unexpected error during registration: %s", str(e))
            raise APIException("Something went wrong. Please try again later.")


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
    """
    # TODO: Add rate limiting to prevent abuse
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(
                f"[!] Test notification validation failed: {serializer.errors} "
                f"by {request.user.email}"
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        target_object = data.get("target_object")
        method = data.get("method")
        target = data.get("target")

        if not target_object:
            return Response(
                {"error": "Target object not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check ownership
        if hasattr(target_object, "user") and target_object.user != request.user:
            raise PermissionDenied("You do not own this object.")

        # Simulate sending a test notification
        try:
            # Here you would integrate with your actual notification sending logic
            logger.info(
                f"[✓] Test notification sent to {target} via {method} "
                f"for user {request.user.email} on {target_object}."
            )
            return Response(
                {
                    "message": f"Test notification sent to {target} via {method}."
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"[!] Failed to send test notification: {e}")
            return Response(
                {"error": "Failed to send test notification."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ForgotPasswordView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(
                f"[✓] Password reset email sent to "
                f"{serializer.validated_data['email']}")
            return Response(
                {
                    "detail": "Password reset email sent."
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
