"""
Prometheus metrics for the Uptime Monitor application.
This module defines all custom business and application metrics.
"""

from prometheus_client import Counter, Histogram, Gauge
# Use the default registry
from prometheus_client import REGISTRY


http_5xx_responses_total = Counter(
    "django_http_responses_5xx_total",
    "Total number of HTTP 5xx responses",
    ["view", "method"]
)

# ===========================
# WEBSITE MONITORING METRICS
# ===========================

website_checks_total = Counter(
    'uptime_website_checks_total',
    'Total number of website checks performed',
    ['monitor_id', 'monitor_name', 'status'],  # status: success, failure, timeout
    registry=REGISTRY
)

website_check_duration_seconds = Histogram(
    'uptime_website_check_duration_seconds',
    'Duration of website health checks',
    ['monitor_id', 'monitor_name'],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0],
    registry=REGISTRY
)

website_response_time_seconds = Histogram(
    'uptime_website_response_time_seconds',
    'HTTP response time for monitored websites',
    ['monitor_id', 'monitor_name', 'status_code'],
    buckets=[0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    registry=REGISTRY
)

website_status = Gauge(
    'uptime_website_status',
    'Current status of website (1=up, 0=down)',
    ['monitor_id', 'monitor_name', 'url'],
    registry=REGISTRY
)

website_consecutive_failures = Gauge(
    'uptime_website_consecutive_failures',
    'Number of consecutive failures for a website',
    ['monitor_id', 'monitor_name'],
    registry=REGISTRY
)

website_uptime_percentage = Gauge(
    'uptime_website_uptime_percentage',
    'Uptime percentage over the last 24 hours',
    ['monitor_id', 'monitor_name'],
    registry=REGISTRY
)

# =============================
# DOWNTIME & RECOVERY METRICS
# =============================

downtime_events_total = Counter(
    'uptime_downtime_events_total',
    'Total number of downtime events detected',
    # reason: timeout, http_error, connection_error
    ['monitor_id', 'monitor_name', 'monitor_type', 'reason'],
    registry=REGISTRY
)

recovery_events_total = Counter(
    'uptime_recovery_events_total',
    'Total number of recovery events (back online)',
    ['monitor_id', 'monitor_name', 'monitor_type'],
    registry=REGISTRY
)

downtime_duration_seconds = Histogram(
    'uptime_downtime_duration_seconds',
    'Duration of downtime incidents',
    ['monitor_id', 'monitor_name'],
    buckets=[60, 300, 600, 1800, 3600, 7200, 14400, 28800, 86400],  # 1min to 24h
    registry=REGISTRY
)

# =============================
# HEARTBEAT MONITORING METRICS
# =============================

heartbeat_pings_total = Counter(
    'uptime_heartbeat_pings_total',
    'Total heartbeat pings received',
    ['heartbeat_id', 'heartbeat_name', 'status'],  # status: on_time, late
    registry=REGISTRY
)

heartbeat_missed_total = Counter(
    'uptime_heartbeat_missed_total',
    'Total number of missed heartbeats',
    ['heartbeat_id', 'heartbeat_name'],
    registry=REGISTRY
)

heartbeat_status = Gauge(
    'uptime_heartbeat_status',
    'Current heartbeat status (1=healthy, 0=missed)',
    ['heartbeat_id', 'heartbeat_name'],
    registry=REGISTRY
)

heartbeat_last_ping_timestamp = Gauge(
    'uptime_heartbeat_last_ping_timestamp',
    'Timestamp of last successful ping (Unix epoch)',
    ['heartbeat_id', 'heartbeat_name'],
    registry=REGISTRY
)

heartbeat_time_since_last_ping_seconds = Gauge(
    'uptime_heartbeat_time_since_last_ping_seconds',
    'Seconds since last successful ping',
    ['heartbeat_id', 'heartbeat_name'],
    registry=REGISTRY
)

# ==============
# ALERT METRICS
# ==============
alerts_sent_total = Counter(
    'uptime_alerts_sent_total',
    'Total number of alerts sent',
    ['alert_type', 'channel', 'status'],  # alert_type: downtime, recovery, missed_heartbeat
    registry=REGISTRY                      # channel: email, slack, whatsapp
)                                          # status: success, failed

alerts_failed_total = Counter(
    'uptime_alerts_failed_total',
    'Total number of failed alert deliveries',
    ['alert_type', 'channel', 'error_type'],
    registry=REGISTRY
)

alert_delivery_duration_seconds = Histogram(
    'uptime_alert_delivery_duration_seconds',
    'Time from event detection to alert sent',
    ['alert_type', 'channel'],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0, 300.0],
    registry=REGISTRY
)

alert_retry_attempts = Counter(
    'uptime_alert_retry_attempts_total',
    'Number of alert retry attempts',
    ['alert_type', 'channel'],
    registry=REGISTRY
)

# =====================
# CELERY TASK METRICS
# =====================

celery_task_duration_seconds = Histogram(
    'uptime_celery_task_duration_seconds',
    'Celery task execution duration',
    ['task_name', 'status'],  # status: success, failure, retry
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0, 300.0],
    registry=REGISTRY
)

celery_task_total = Counter(
    'uptime_celery_task_total',
    'Total number of celery tasks executed',
    ['task_name', 'status'],
    registry=REGISTRY
)

celery_queue_length = Gauge(
    'uptime_celery_queue_length',
    'Number of tasks waiting in queue',
    ['queue_name'],
    registry=REGISTRY
)

celery_active_tasks = Gauge(
    'uptime_celery_active_tasks',
    'Number of tasks currently being processed',
    ['queue_name'],
    registry=REGISTRY
)

celery_worker_pool_size = Gauge(
    'uptime_celery_worker_pool_size',
    'Number of worker processes/threads available',
    ['worker_name'],
    registry=REGISTRY
)

# =================
# BUSINESS METRICS
# =================
active_monitors_total = Gauge(
    'uptime_active_monitors_total',
    'Total number of active monitors',
    ['monitor_type'],  # website, heartbeat
    registry=REGISTRY
)

active_users_total = Gauge(
    'uptime_active_users_total',
    'Total number of active users',
    registry=REGISTRY
)

monitors_per_user = Gauge(
    'uptime_monitors_per_user',
    'Number of monitors per user',
    ['user_id', 'username'],
    registry=REGISTRY
)

user_registrations_total = Counter(
    'uptime_user_registrations_total',
    'Total number of user registrations',
    registry=REGISTRY
)

api_requests_total = Counter(
    'uptime_api_requests_total',
    'Total API requests (excluding healthcheck/metrics)',
    ['endpoint', 'method', 'status_code'],
    registry=REGISTRY
)

api_auth_attempts_total = Counter(
    'uptime_api_auth_attempts_total',
    'API authentication attempts',
    ['status'],  # success, failed
    registry=REGISTRY
)

# =================
# DATABASE METRICS
# =================

db_query_duration_seconds = Histogram(
    'uptime_db_query_duration_seconds',
    'Database query execution time',
    ['model', 'operation'],  # operation: select, insert, update, delete
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
    registry=REGISTRY
)

db_slow_queries_total = Counter(
    'uptime_db_slow_queries_total',
    'Number of slow queries (>100ms)',
    ['model', 'operation'],
    registry=REGISTRY
)

db_connection_pool_size = Gauge(
    'uptime_db_connection_pool_size',
    'Database connection pool statistics',
    ['state'],  # active, idle, total
    registry=REGISTRY
)

# ======================
# SYSTEM HEALTH METRICS
# ======================

redis_connection_errors_total = Counter(
    'uptime_redis_connection_errors_total',
    'Total Redis connection errors',
    registry=REGISTRY
)

external_api_requests_total = Counter(
    'uptime_external_api_requests_total',
    'Requests to external APIs (SES, Slack, etc.)',
    ['service', 'status'],
    registry=REGISTRY
)

external_api_duration_seconds = Histogram(
    'uptime_external_api_duration_seconds',
    'Duration of external API calls',
    ['service'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
    registry=REGISTRY
)