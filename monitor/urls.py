from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'websites', views.WebsiteViewSet, basename='website')
router.register(r'preferences', views.NotificationPreferenceViewSet, basename='preferences')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('ping/<uuid:key>/', views.ping_heartbeat, name='ping_heartbeat'),
    path('', include(router.urls)),
]