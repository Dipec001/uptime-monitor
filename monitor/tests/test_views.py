# Views tests.
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from monitor.models import Website, NotificationPreference
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


@pytest.mark.django_db
def test_register_view_success():
    """
    Test that a user can successfully register via RegisterView.
    """
    client = APIClient()
    url = reverse("register")
    data = {
        "email": "test@example.com",
        "password": "StrongPassw0rd!"
    }

    response = client.post(url, data, format="json")

    # Assert HTTP 201 Created
    assert response.status_code == status.HTTP_201_CREATED

    # Assert user is created in DB
    user = User.objects.get(email="test@example.com")
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
    User.objects.create_user(email="test@example.com", password="password123")

    client = APIClient()
    url = reverse("register")
    data = {
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
        "email": "test2@example.com",
        "password": "123"  # too weak
    }

    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data


# ---------------------------------------------------
# Website Views Tests
# ---------------------------------------------------

@pytest.fixture
def user():
    """Create a test user."""
    return User.objects.create_user(
        email="tester@example.com",
        password="StrongPassw0rd!"
    )


@pytest.fixture
def api_client(user):
    """Authenticated APIClient fixture."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def website(user):
    """Create a sample Website instance for the user."""
    return Website.objects.create(
        user=user,
        name="My Site",
        url="https://example.com",
        check_interval=5
    )

# ----------------- Tests -----------------


@pytest.mark.django_db
def test_website_list(api_client, website):
    """Test that authenticated user can list their websites."""
    # Use the DRF router name
    url = reverse("website-list")
    response = api_client.get(url)
    print(response.data)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["url"] == website.url


@pytest.mark.django_db
def test_website_create_success(api_client):
    """Test successful website creation."""
    url = reverse("website-list")
    data = {
        "name": "New Site",
        "url": "https://newsite.com",
        "check_interval": 5
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert Website.objects.filter(url="https://newsite.com").exists()


@pytest.mark.django_db
def test_website_create_duplicate_url(api_client, website):
    """Test creating a website with duplicate URL fails."""
    url = reverse("website-list")
    data = {
        "name": "Duplicate Site",
        "url": website.url,  # duplicate
        "check_interval": 5
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "url" in response.data


@pytest.mark.django_db
def test_website_update(api_client, website):
    """Test updating a website's name."""
    url = reverse("website-detail", args=[website.id])
    data = {"name": "Updated Name"}
    response = api_client.patch(url, data, format="json")
    assert response.status_code == status.HTTP_200_OK
    website.refresh_from_db()
    assert website.name == "Updated Name"


@pytest.mark.django_db
def test_website_delete(api_client, website):
    """Test deleting a website."""
    url = reverse("website-detail", args=[website.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Website.objects.filter(id=website.id).exists()

# ---------------------------------------------------
# NotificationPreference Views Tests (Generic Relation)
# ---------------------------------------------------


@pytest.fixture
def another_user():
    """Another user for ownership tests."""
    return User.objects.create_user(
        email="other@example.com",
        password="StrongPassw0rd!"
    )


@pytest.fixture
def other_website(another_user):
    """Website owned by another user."""
    return Website.objects.create(
        user=another_user,
        name="Other Site",
        url="https://other.com",
        check_interval=5
    )


# ----------------- Tests -----------------

@pytest.mark.django_db
def test_create_notification_preference_success(api_client, website):
    """Test successful creation of a notification preference."""
    url = reverse("preferences-list")
    data = {
        "content_type": ContentType.objects.get_for_model(Website).id,
        "object_id": website.id,
        "method": "email",
        "target": "user@example.com",
        "model": "website"
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert NotificationPreference.objects.filter(
        user=website.user,
        content_type=ContentType.objects.get_for_model(Website),
        object_id=website.id
    ).exists()


@pytest.mark.django_db
def test_create_preference_unauthorized_website(api_client, other_website):
    """Test that creating a preference on a website not owned by user fails."""
    url = reverse("preferences-list")
    data = {
        "content_type": ContentType.objects.get_for_model(Website).id,
        "object_id": other_website.id,
        "method": "email",
        "target": "user@example.com",
        "model": "website"
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "do not own" in str(response.data).lower()


@pytest.mark.django_db
def test_create_duplicate_preference(api_client, website):
    """Test that duplicate preferences are prevented."""
    NotificationPreference.objects.create(
        user=website.user,
        content_type=ContentType.objects.get_for_model(Website),
        object_id=website.id,
        method="email",
        target="user@example.com"
    )

    url = reverse("preferences-list")
    data = {
        "content_type": ContentType.objects.get_for_model(Website).id,
        "object_id": website.id,
        "method": "email",
        "target": "user@example.com",
        "model": "website"
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already have" in str(response.data).lower()


@pytest.mark.django_db
@pytest.mark.parametrize("method,target", [
    ("email", "not-an-email"),
    ("slack", "not-a-url"),
    ("webhook", "ftp://invalid.com")
])
def test_create_invalid_target(api_client, website, method, target):
    """Test validation errors for invalid email or URL targets."""
    url = reverse("preferences-list")
    data = {
        "content_type": ContentType.objects.get_for_model(Website).id,
        "object_id": website.id,
        "method": method,
        "target": target
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data


@pytest.mark.django_db
def test_update_preference(api_client, website):
    """Test updating a notification preference."""
    print(website.id, "website.id")
    preference = NotificationPreference.objects.create(
        user=website.user,
        content_type=ContentType.objects.get_for_model(Website),
        object_id=website.id,
        method="email",
        target="old@example.com"
    )

    url = reverse("preferences-detail", args=[preference.id])
    # TODO: Check to make sure we don't need to pass the model
    #  anytime we want to update
    data = {"target": "new@example.com", "model": "website", "method": "email"}
    response = api_client.patch(url, data, format="json")
    print(response.data)
    assert response.status_code == status.HTTP_200_OK
    preference.refresh_from_db()
    assert preference.target == "new@example.com"
