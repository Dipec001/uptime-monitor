from django.contrib import admin
from .models import (
    Website, UptimeCheckResult, Alert, NotificationPreference,
    HeartBeat, PingLog, CustomUser
)
from django.contrib.auth.admin import UserAdmin


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("email",)
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "is_staff", "is_active")}
        ),
    )


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
        "target_object_display",
        "alert_type",
        "is_active",
        "retry_count",
        "last_sent_at",
        "created_at",
    )
    list_filter = ("alert_type", "is_active", "created_at", "content_type")
    search_fields = (
        "target_object_display",
        "alert_type",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "last_sent_at")

    def target_object_display(self, obj):
        """Show Website URL or Heartbeat name in the admin."""
        if obj.target_object:
            return str(obj.target_object)
        return f"{obj.content_type} {obj.object_id}"

    target_object_display.short_description = "Target"


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "target_object_display",
        "method",
        "target",
        "is_active",
        "created_at",
    )
    list_filter = ("method", "is_active", "created_at", "content_type")
    search_fields = (
        "user__username",
        "user__email",
        "target",
    )
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    def target_object_display(self, obj):
        """Show what this preference is attached to (Website URL, Heartbeat name, etc.)."""
        if obj.target_object:
            return str(obj.target_object)
        return f"{obj.content_type} {obj.object_id}"

    target_object_display.short_description = "Target"


@admin.register(HeartBeat)
class HeartBeatAdmin(admin.ModelAdmin):
    list_display = (
        "name", 
        "key", 
        "user", 
        "interval", 
        "status", 
        "last_ping",  
        "created_at"
    )
    list_filter = ("status", "interval", "created_at")
    search_fields = ("name", "key", "user__username", "user__email")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
    readonly_fields = ("key", "created_at", "last_ping")


@admin.register(PingLog)
class PingLogAdmin(admin.ModelAdmin):
    list_display = (
        "heartbeat", 
        "timestamp", 
        "status", 
        "notes"
    )
    list_filter = ("status", "timestamp")
    search_fields = ("heartbeat__name", "heartbeat__key", "notes")
    autocomplete_fields = ("heartbeat",)
    ordering = ("-timestamp",)
    readonly_fields = ("heartbeat", "timestamp", "status", "notes")