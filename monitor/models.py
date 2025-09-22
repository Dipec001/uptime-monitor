from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

# For now, we'll use this fixed set of check intervals
CHECK_INTERVAL_CHOICES = [
    (1, '1 minute'),
    (5, '5 minutes'),
    (10, '10 minutes'),
    (15, '15 minutes'),
    (30, '30 minutes'),
    (60, '1 hour'),
]

CRON_STATUS_CHOICES = [
    ("unknown", "Unknown"),  # never pinged
    ("up", "Up"),
    ("down", "Down"),
]

# Notification methods
METHOD_CHOICES = [
        ("email", "Email"),
        ("slack", "Slack"),
        ("webhook", "Webhook"),
        ("whatsapp", "WhatsApp"),
    ]

class Website(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='websites')
    name = models.CharField(max_length=100, blank=True, null=True)
    url = models.URLField()
    check_interval = models.IntegerField(
        choices=CHECK_INTERVAL_CHOICES,
        default=5,
        help_text="How often (in minutes) to check the website."
    )
    expected_status = models.IntegerField(default=200) # some users expect 301/302.
    timeout_ms = models.IntegerField(default=5000, 
        help_text="Maximum wait time (in milliseconds) for the request to respond," \
        " before you give up and mark it as failed."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    next_check_at = models.DateTimeField(null=True, blank=True)
    is_down = models.BooleanField(default=False)
    last_downtime_at = models.DateTimeField(null=True, blank=True)
    last_recovered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_active', 'next_check_at']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at'] # default ordering

    def __str__(self):
        return self.name or self.url


class UptimeCheckResult(models.Model):
    website = models.ForeignKey(Website, on_delete=models.CASCADE, related_name='checks')
    status_code = models.IntegerField()
    error_message = models.TextField(blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    response_time_ms = models.FloatField()
    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['website', 'checked_at']),
        ]

    @property
    def is_passed(self):
        return 200 <= self.status_code < 300

    def __str__(self):
        return f"{self.website.url} - {self.status_code} at {self.checked_at}"
    

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Alert(models.Model):
    """Model to track alerts sent for various entities (Website, HeartBeat, etc.)"""
    ALERT_TYPES = [
        ("downtime", "Downtime"),
        ("recovery", "Recovery"),
    ]

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    target_object = GenericForeignKey("content_type", "object_id")

    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    is_active = models.BooleanField(default=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['content_type', 'object_id', 'alert_type', 'is_active']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.target_object} - {self.alert_type} - Active: {self.is_active}"


class NotificationPreference(models.Model):
    """
    User's notification preferences for any monitorable object (Website, HeartBeat, etc.)
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Generic relation to Website or HeartBeat
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    target_object = GenericForeignKey("content_type", "object_id")

    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="email")
    target = models.CharField(max_length=255)  # email, Slack URL, webhook, WhatsApp, etc.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "content_type", "object_id", "method")

    def __str__(self):
        return f"{self.user.username} → {self.method}: {self.target} ({self.target_object})"

    

class HeartBeat(models.Model):
    """A heartbeat is a periodic signal sent by a service to indicate normal operation."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="heartbeats")
    name = models.CharField(max_length=100)  # e.g. "Daily Backup"
    key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    interval = models.IntegerField(
        help_text="Expected interval in seconds (e.g. 86400 for daily)"
    )
    grace_period = models.IntegerField(default=60, help_text="Extra time buffer in seconds")
    last_ping = models.DateTimeField(null=True, blank=True, db_index=True)
    next_due = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=CRON_STATUS_CHOICES, default="unknown")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # optional, but useful

    def update_next_due(self):
        """Call this after every ping or creation."""
        now = timezone.now()
        self.next_due = now + timezone.timedelta(seconds=self.interval + self.grace_period)

    def __str__(self):
        return f"{self.name} ({self.status})"


class PingLog(models.Model):
    """Log each heartbeat ping for auditing and debugging."""

    heartbeat = models.ForeignKey("HeartBeat", on_delete=models.CASCADE, related_name="pings")
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=[("success", "Success"), ("fail", "Fail")])
    runtime = models.FloatField(null=True, blank=True, help_text="Runtime in seconds")
    notes = models.TextField(blank=True)  # e.g., error message or logs snippet
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['heartbeat', 'timestamp']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.heartbeat.name} @ {self.timestamp} - {self.status}"


class HeartbeatNotificationPreference(models.Model):
    """User's notification preferences for a heartbeat."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    heartbeat = models.ForeignKey(HeartBeat, on_delete=models.CASCADE)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="email")
    target = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "heartbeat", "method")

    def __str__(self):
        return f"{self.user.username} → {self.method}: {self.target}"
