from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'websites', views.WebsiteViewSet, basename='website')
router.register(
    r'preferences',
    views.NotificationPreferenceViewSet,
    basename='preferences'
)
router.register(r'heartbeats', views.HeartBeatViewSet, basename='heartbeat')

urlpatterns = [
    path("trigger-error/", views.trigger_error, name="trigger_error"),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('notifications/test/', views.TestNotificationView.as_view(), name='test-notification'),
    path('ping/<uuid:key>/', views.ping_heartbeat, name='ping_heartbeat'),
    path(
        "forgot-password/",
        views.ForgotPasswordView.as_view(),
        name="forgot-password"
    ),
    path("reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
    path(
        "dashboard-metrics/",
        views.DashboardMetricsView.as_view(),
        name="dashboard-metrics"
    ),
    path('', include(router.urls)),
]
