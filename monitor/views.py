from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, APIException
from monitor.serializers import RegisterSerializer, WebsiteSerializer, NotificationPreferenceSerializer
from .models import Website, NotificationPreference
from django.http import Http404
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
import logging

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
        return Website.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"[!] Website validation failed: {serializer.errors} by {request.user.username}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        website = serializer.save(user=request.user)
        logger.info(f"[✓] Monitor created: {website.url} by {request.user.username}")
        return Response(self.get_serializer(website).data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        logger.debug(f"Update attempt with data: {request.data} by {request.user.username}")

        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
        except Http404:
            logger.warning(f"[!] Update failed: Monitor not found for ID {kwargs.get('pk')} by {request.user.username}")
            return Response({"detail": "Monitor not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            logger.warning(f"[!] Update validation failed: {serializer.errors} by {request.user.username}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        website = serializer.save()
        logger.info(f"[✓] Monitor updated: {website.url} by {request.user.username}")
        return Response(serializer.data)

    def perform_destroy(self, instance):
        logger.warning(f"[!] Monitor deleted: {instance.url} by {self.request.user.username}")
        return super().perform_destroy(instance)


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer

    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        website = serializer.validated_data['website']
        user = self.request.user
        if website.user != user:
            logger.warning(f"[⚠️] User {user.id} tried to add a preference to website {website.id} not owned by them.")
            raise PermissionDenied("You do not own this website.")

        try:
            serializer.save(user=user)
            logger.info(f"[✓] Notification preference created for user {user.id} on website {website.id}.")
        except IntegrityError:
            logger.warning(f"[!] Duplicate notification preference for user {user.id}, website {website.id}, method {serializer.validated_data.get('method')}.")
            raise ValidationError("You already have this notification preference.")


    def perform_update(self, serializer):
        user = self.request.user
        try:
            serializer.save(user=user)
            logger.info(f"[✓] Notification preference updated for user {user.id}.")
        except IntegrityError:
            logger.warning(f"[!] Duplicate on update: user {user.id}, method {serializer.validated_data.get('method')}.")
            raise ValidationError("You already have this notification preference.")