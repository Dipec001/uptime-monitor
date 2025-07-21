from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from monitor.serializers import RegisterSerializer
from rest_framework.exceptions import APIException
from django.contrib.auth import get_user_model
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

                logger.info("✅ User registered: %s", user.email)

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

            logger.warning("❌ Registration failed with errors: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("🔥 Unexpected error during registration: %s", str(e))
            raise APIException("Something went wrong. Please try again later.")
