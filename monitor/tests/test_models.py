import pytest
from django.contrib.auth.models import User
from django.db import IntegrityError
from monitor.models import Website, UptimeCheckResult, Alert, NotificationPreference, HeartBeat

# ---------------------------------------------------
# Website Model Tests
# ---------------------------------------------------

@pytest.mark.django_db
def test_website_creation_defaults():
    """
    Test that a Website instance is created with correct default values.
    """
    user = User.objects.create(username="testuser")
    site = Website.objects.create(user=user, url="https://example.com")

    assert site.check_interval == 5
    assert site.is_active is True
    assert site.is_down is False
    assert site.name is None or isinstance(site.name, str)

@pytest.mark.django_db
def test_website_str_method():
    """
    Test the __str__ method returns the name if present, else URL.
    """
    user = User.objects.create(username="testuser")
    site1 = Website.objects.create(user=user, url="https://example.com")
    site2 = Website.objects.create(user=user, url="https://example.com", name="My Site")

    assert str(site1) == site1.url
    assert str(site2) == "My Site"

# ---------------------------------------------------
# UptimeCheckResult Model Tests
# ---------------------------------------------------

@pytest.mark.django_db
def test_uptime_check_result_is_passed_property():
    """
    Ensure the `is_passed` property correctly evaluates the status_code.
    """
    user = User.objects.create(username="testuser")
    site = Website.objects.create(user=user, url="https://example.com")

    # Passed check
    result_ok = UptimeCheckResult.objects.create(
        website=site, status_code=200, response_time_ms=120
    )
    # Failed check
    result_fail = UptimeCheckResult.objects.create(
        website=site, status_code=500, response_time_ms=250
    )

    assert result_ok.is_passed is True
    assert result_fail.is_passed is False

@pytest.mark.django_db
def test_uptime_check_result_str_method():
    """
    Test the string representation includes URL and status.
    """
    user = User.objects.create(username="testuser")
    site = Website.objects.create(user=user, url="https://example.com")

    result = UptimeCheckResult.objects.create(
        website=site, status_code=200, response_time_ms=100
    )

    assert str(result).startswith(site.url)
    assert str(result).endswith(str(result.status_code) + " at " + str(result.checked_at))

# ---------------------------------------------------
# Alert Model Tests
# ---------------------------------------------------

@pytest.mark.django_db
def test_alert_defaults_and_str():
    """
    Test that an Alert has correct defaults and string representation.
    """
    user = User.objects.create(username="tester")
    site = Website.objects.create(user=user, url="https://example.com")
    
    alert = Alert.objects.create(website=site, alert_type="downtime")

    # Defaults
    assert alert.is_active is True
    assert alert.retry_count == 1

    # __str__ method
    expected_str = f"{site.url} - downtime - Active: True"
    assert str(alert) == expected_str

# ---------------------------------------------------
# NotificationPreference Model Tests
# ---------------------------------------------------

@pytest.mark.django_db
def test_notification_preference_unique_constraint():
    """
    Ensure the unique constraint on (user, website, method) is enforced.
    """
    user = User.objects.create(username="tester")
    site = Website.objects.create(user=user, url="https://example.com")

    NotificationPreference.objects.create(
        user=user, website=site, method="email", target="test@example.com"
    )

    with pytest.raises(IntegrityError):
        NotificationPreference.objects.create(
            user=user, website=site, method="email", target="another@example.com"
        )

@pytest.mark.django_db
def test_notification_preference_str_method():
    """
    Test string representation returns user → method: target.
    """
    user = User.objects.create(username="tester")
    site = Website.objects.create(user=user, url="https://example.com")

    pref = NotificationPreference.objects.create(
        user=user, website=site, method="slack", target="https://hooks.slack.com/test"
    )

    assert str(pref) == f"{user.username} → slack: {pref.target}"

# ---------------------------------------------------
# HeartBeat Model Tests
# ---------------------------------------------------

@pytest.mark.django_db
def test_heartbeat_defaults_and_str():
    """
    Ensure HeartBeat instance has correct default status and string representation.
    """
    user = User.objects.create(username="tester")
    hb = HeartBeat.objects.create(user=user, name="Daily Backup", interval=86400, grace_period=60)

    assert hb.status == "unknown"
    assert str(hb) == "Daily Backup (unknown)"