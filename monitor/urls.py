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
    path('login/', views.LoginView.as_view(), name='login'),
    path('auth/social/', views.SocialAuthView.as_view(), name='social_auth'),
    path('auth/methods/', views.UserAuthMethodsView.as_view(), name='auth_methods'),
    path('auth/set-password/', views.SetPasswordView.as_view(), name='set_password'),
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path(
        'notifications/test/',
        views.TestNotificationView.as_view(),
        name='test-notification'
    ),
    path(
        'notifications/test_email/',
        views.TestEmailNotificationView.as_view(),
        name='test-email-notification'
    ),
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
    path(
        'websites/bulk_create/',
        views.BulkCreateWebsitesView.as_view(),
        name='bulk-create-sites'
    ),
    path(
        'alerts/bulk_create/',
        views.BulkCreateAlertsView.as_view(),
        name='bulk-create-alerts'
    ),
    path('', include(router.urls)),
]
