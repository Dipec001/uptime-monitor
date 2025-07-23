from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'websites', views.WebsiteViewSet, basename='website')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]