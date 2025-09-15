from django.contrib import admin
from .models import Website, UptimeCheckResult, Alert, NotificationPreference


@admin.register(Website)
class WebsiteAdmin(admin.ModelAdmin):
    list_display = ("name", 
                    "url", 
                    "user", 
                    "check_interval", 
                    "is_active", 
                    "is_down", 
                    "next_check_at", 
                    "created_at"
    )
    list_filter = ("is_active", "is_down", "check_interval", "created_at")
    search_fields = ("name", "url", "user__username", "user__email")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
    readonly_fields = (
        "created_at", 
        "last_downtime_at", 
        "last_recovered_at", 
        "next_check_at"
    )


@admin.register(UptimeCheckResult)
class UptimeCheckResultAdmin(admin.ModelAdmin):
    list_display = (
        "website", 
        "status_code", 
        "response_time_ms", 
        "checked_at", 
        "is_passed"
    )
    list_filter = ("status_code", "checked_at")
    search_fields = ("website__url",)
    autocomplete_fields = ("website",)
    ordering = ("-checked_at",)
    readonly_fields = ("checked_at",)

    def is_passed(self, obj):
        return obj.is_passed
    is_passed.boolean = True
    is_passed.short_description = "Passed?"


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = (
        "website", 
        "alert_type", 
        "is_active", 
        "retry_count", 
        "last_sent_at", 
        "created_at"
    )
    list_filter = ("alert_type", "is_active", "created_at")
    search_fields = ("website__url",)
    autocomplete_fields = ("website",)
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "last_sent_at")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        "user", 
        "website", 
        "method", 
        "target", 
        "is_active", 
        "created_at"
    )
    list_filter = ("method", "is_active", "created_at")
    search_fields = ("user__username", "user__email", "website__url", "target")
    autocomplete_fields = ("user", "website")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)