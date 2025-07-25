from django.db import models
from django.contrib.auth.models import User


# For now, we'll use this fixed set of check intervals
CHECK_INTERVAL_CHOICES = [
    (1, '1 minute'),
    (5, '5 minutes'),
    (10, '10 minutes'),
    (15, '15 minutes'),
    (30, '30 minutes'),
    (60, '1 hour'),
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

    def __str__(self):
        return self.name or self.url


class UptimeCheckResult(models.Model):
    website = models.ForeignKey(Website, on_delete=models.CASCADE, related_name='checks')
    status_code = models.IntegerField()
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


class Alert(models.Model):
    ALERT_TYPES = [
        ("downtime", "Downtime"),
        ("recovery", "Recovery"),
    ]

    website = models.ForeignKey(Website, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    is_active = models.BooleanField(default=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['website', 'alert_type', 'is_active']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.website.url} - {self.alert_type} - Active: {self.is_active}"


class NotificationPreference(models.Model):
    METHOD_CHOICES = [
        ("email", "Email"),
        ("slack", "Slack"),
        ("webhook", "Webhook"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    website = models.ForeignKey(Website, on_delete=models.CASCADE)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default="email")
    target = models.CharField(max_length=255)  # email address, Slack URL, or webhook URL
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "website", "method") # just one method per site, regardless of target.
        # unique_together = ("user", "website", "method", "target")

    def __str__(self):
        return f"{self.user.username} → {self.method}: {self.target}"
