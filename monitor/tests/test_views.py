# Views tests.
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from django.urls import reverse

@pytest.mark.django_db
def test_register_view_success():
    """
    Test that a user can successfully register via RegisterView.
    """
    client = APIClient()
    url = reverse("register")
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "StrongPassw0rd!"
    }

    response = client.post(url, data, format="json")

    # Assert HTTP 201 Created
    assert response.status_code == status.HTTP_201_CREATED

    # Assert user is created in DB
    user = User.objects.get(username="testuser")
    assert user.email == "test@example.com"

    # Assert response contains user info
    assert "user" in response.data
    assert response.data["user"]["email"] == "test@example.com"

    # Assert response contains JWT tokens
    assert "token" in response.data
    assert "access" in response.data["token"]
    assert "refresh" in response.data["token"]

@pytest.mark.django_db
def test_register_view_failure_existing_email():
    """
    Test registration fails when the email already exists.
    """
    # Create existing user
    User.objects.create_user(username="existing", email="test@example.com", password="password123")

    client = APIClient()
    url = reverse("register")
    data = {
        "username": "newuser",
        "email": "test@example.com",  # duplicate email
        "password": "StrongPassw0rd!"
    }

    response = client.post(url, data, format="json")

    # Assert HTTP 400 Bad Request
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data

@pytest.mark.django_db
def test_register_view_failure_invalid_password():
    """
    Test registration fails when password does not meet validation rules.
    """
    client = APIClient()
    url = reverse("register")
    data = {
        "username": "testuser2",
        "email": "test2@example.com",
        "password": "123"  # too weak
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data


@pytest.mark.django_db
def test_register_view_failure_existing_username():
    """
    Test registration fails when the username already exists.
    """
    # Create existing user
    User.objects.create_user(username="existing", email="test@example.com", password="password123")

    client = APIClient()
    url = reverse("register")
    data = {
        "username": "newuser",
        "email": "test@example.com",  # duplicate email
        "password": "StrongPassw0rd!"
    }

    response = client.post(url, data, format="json")

    # Assert HTTP 400 Bad Request
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data


@pytest.mark.django_db
def test_register_view_failure_existing_username():
    """
    Test registration fails when the username already exists.
    """
    # Create existing user
    User.objects.create_user(username="existing", email="existing@example.com", password="password123")

    client = APIClient()
    url = reverse("register")
    data = {
        "username": "existing",  # duplicate username
        "email": "new@example.com",
        "password": "StrongPassw0rd!"
    }

    response = client.post(url, data, format="json")

    # Assert HTTP 400 Bad Request
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "username" in response.data
