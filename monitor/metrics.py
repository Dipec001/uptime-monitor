from prometheus_client import (Counter, pushadd_to_gateway, CollectorRegistry,
                               Histogram, Gauge)

registry = CollectorRegistry()


http_5xx_responses_total = Counter(
    "django_http_responses_5xx_total",
    "Total number of HTTP 5xx responses",
    ["view", "method"]
)

website_success_total = Counter(
    "website_success_total",
    "Website check result (success)",
    ["website"],
    registry=registry,
)

website_failed_total = Counter(
    "website_failed_total",
    "Website check result (failed)",
    ["website"],
    registry=registry,
)


def push_website_metric(website_name: str, success: bool):
    if success:
        website_success_total.labels(website=website_name).inc()
    else:
        website_failed_total.labels(website=website_name).inc()

    pushadd_to_gateway("http://localhost:9091", job="website_check", registry=registry)


# =======================
# MONITORING METRICS
# =======================

# Track checks performed
website_checks_total = Counter(
    'website_checks_total',
    'Total number of website checks performed',
    ['website_id', 'status']  # Labels for filtering
)

# Track check duration
website_check_duration = Histogram(
    'website_check_duration_seconds',
    'Time taken to check a website',
    ['website_id'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
)

# Track downtime detection
website_downtime_detected = Counter(
    'website_downtime_detected_total',
    'Number of times downtime was detected',
    ['website_id', 'reason']
)

# Current status of all monitors
website_status = Gauge(
    'website_status',
    'Current status of website (1=up, 0=down)',
    ['website_id', 'url']
)

# =======================
# ALERT METRICS
# =======================

# Email alerts sent
alerts_sent_total = Counter(
    'alerts_sent_total',
    'Total alerts sent',
    ['alert_type', 'status']  # email/sms, success/failure
)

# Alert delivery time
alert_delivery_duration = Histogram(
    'alert_delivery_duration_seconds',
    'Time from downtime detection to alert sent',
    ['alert_type'],
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 300.0]
)

# Failed alerts (needs immediate attention!)
alerts_failed_total = Counter(
    'alerts_failed_total',
    'Total failed alert deliveries',
    ['alert_type', 'error_type']
)

# =======================
# CELERY TASK METRICS
# =======================

# Task execution time
celery_task_duration = Histogram(
    'celery_task_duration_seconds',
    'Celery task execution time',
    ['task_name', 'status'],
    buckets=[0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0]
)

# Task queue size
celery_queue_length = Gauge(
    'celery_queue_length',
    'Number of tasks in queue',
    ['queue_name']
)

# =======================
# BUSINESS METRICS
# =======================

# Active monitors
active_monitors_total = Gauge(
    'active_monitors_total',
    'Total number of active monitors'
)

# Monitors by user
monitors_per_user = Gauge(
    'monitors_per_user',
    'Number of monitors per user',
    ['user_id']
)

# Uptime percentage (rolling 24h)
website_uptime_percentage = Gauge(
    'website_uptime_percentage',
    '24-hour uptime percentage',
    ['website_id']
)
