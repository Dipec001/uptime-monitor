"""
Helper functions and decorators for easy metrics instrumentation.
"""

import time
import functools
from contextlib import contextmanager
from . import metrics

# =====================================================
# WEBSITE CHECK HELPERS
# =====================================================


@contextmanager
def track_website_check(monitor_id: str, monitor_name: str):
    """
    Context manager to track website check duration and result.
    
    Usage:
        with track_website_check(website.id, website.name) as tracker:
            response = requests.get(website.url)
            tracker.record_success(response.elapsed.total_seconds(), response.status_code)
    """
    start_time = time.time()
    
    class Tracker:
        def record_success(self, response_time: float, status_code: int):
            duration = time.time() - start_time
            metrics.website_checks_total.labels(
                monitor_id=str(monitor_id),
                monitor_name=monitor_name,
                status='success'
            ).inc()
            
            metrics.website_check_duration_seconds.labels(
                monitor_id=str(monitor_id),
                monitor_name=monitor_name
            ).observe(duration)
            
            metrics.website_response_time_seconds.labels(
                monitor_id=str(monitor_id),
                monitor_name=monitor_name,
                status_code=str(status_code)
            ).observe(response_time)
        
        def record_failure(self, reason: str):
            duration = time.time() - start_time
            metrics.website_checks_total.labels(
                monitor_id=str(monitor_id),
                monitor_name=monitor_name,
                status='failure'
            ).inc()
            
            metrics.website_check_duration_seconds.labels(
                monitor_id=str(monitor_id),
                monitor_name=monitor_name
            ).observe(duration)
    
    tracker = Tracker()
    try:
        yield tracker
    except Exception as e:
        tracker.record_failure(str(type(e).__name__))
        raise


def update_website_status(monitor_id: str, monitor_name: str, url: str, is_up: bool):
    """Update the current status gauge for a website."""
    metrics.website_status.labels(
        monitor_id=str(monitor_id),
        monitor_name=monitor_name,
        url=url
    ).set(1 if is_up else 0)


def update_consecutive_failures(monitor_id: str, monitor_name: str, count: int):
    """Update consecutive failure count."""
    metrics.website_consecutive_failures.labels(
        monitor_id=str(monitor_id),
        monitor_name=monitor_name
    ).set(count)


def record_downtime_event(monitor_id: str, monitor_name: str, monitor_type: str, reason: str):
    """Record a downtime event."""
    metrics.downtime_events_total.labels(
        monitor_id=str(monitor_id),
        monitor_name=monitor_name,
        monitor_type=monitor_type,
        reason=reason
    ).inc()


def record_recovery_event(monitor_id: str, monitor_name: str, monitor_type: str):
    """Record a recovery event."""
    metrics.recovery_events_total.labels(
        monitor_id=str(monitor_id),
        monitor_name=monitor_name,
        monitor_type=monitor_type
    ).inc()


def record_downtime_duration(monitor_id: str, monitor_name: str, duration_seconds: float):
    """Record the duration of a downtime incident."""
    metrics.downtime_duration_seconds.labels(
        monitor_id=str(monitor_id),
        monitor_name=monitor_name
    ).observe(duration_seconds)


def update_uptime_percentage(monitor_id: str, monitor_name: str, percentage: float):
    """Update 24-hour uptime percentage."""
    metrics.website_uptime_percentage.labels(
        monitor_id=str(monitor_id),
        monitor_name=monitor_name
    ).set(percentage)


# =====================================================
# HEARTBEAT HELPERS
# =====================================================

def record_heartbeat_ping(heartbeat_id: str, heartbeat_name: str, is_on_time: bool):
    """Record a heartbeat ping."""
    status = 'on_time' if is_on_time else 'late'
    metrics.heartbeat_pings_total.labels(
        heartbeat_id=str(heartbeat_id),
        heartbeat_name=heartbeat_name,
        status=status
    ).inc()
    
    # Update status and timestamp
    metrics.heartbeat_status.labels(
        heartbeat_id=str(heartbeat_id),
        heartbeat_name=heartbeat_name
    ).set(1)
    
    metrics.heartbeat_last_ping_timestamp.labels(
        heartbeat_id=str(heartbeat_id),
        heartbeat_name=heartbeat_name
    ).set(time.time())


def record_missed_heartbeat(heartbeat_id: str, heartbeat_name: str):
    """Record a missed heartbeat."""
    metrics.heartbeat_missed_total.labels(
        heartbeat_id=str(heartbeat_id),
        heartbeat_name=heartbeat_name
    ).inc()
    
    metrics.heartbeat_status.labels(
        heartbeat_id=str(heartbeat_id),
        heartbeat_name=heartbeat_name
    ).set(0)


def update_heartbeat_time_since_last_ping(
        heartbeat_id: str,
        heartbeat_name: str,
        seconds: float
):
    """Update time since last ping."""
    metrics.heartbeat_time_since_last_ping_seconds.labels(
        heartbeat_id=str(heartbeat_id),
        heartbeat_name=heartbeat_name
    ).set(seconds)


# =====================================================
# ALERT HELPERS
# =====================================================

@contextmanager
def track_alert_delivery(alert_type: str, channel: str):
    """
    Track alert delivery time and status.
    
    Usage:
        with track_alert_delivery('downtime', 'email') as tracker:
            send_email(...)
            tracker.success()
    """
    start_time = time.time()
    
    class Tracker:
        def __init__(self):
            self.completed = False
        
        def success(self):
            duration = time.time() - start_time
            metrics.alerts_sent_total.labels(
                alert_type=alert_type,
                channel=channel,
                status='success'
            ).inc()
            
            metrics.alert_delivery_duration_seconds.labels(
                alert_type=alert_type,
                channel=channel
            ).observe(duration)
            self.completed = True
        
        def failure(self, error_type: str):
            metrics.alerts_sent_total.labels(
                alert_type=alert_type,
                channel=channel,
                status='failed'
            ).inc()
            
            metrics.alerts_failed_total.labels(
                alert_type=alert_type,
                channel=channel,
                error_type=error_type
            ).inc()
            self.completed = True
        
        def retry(self):
            metrics.alert_retry_attempts.labels(
                alert_type=alert_type,
                channel=channel
            ).inc()
    
    tracker = Tracker()
    try:
        yield tracker
    except Exception as e:
        if not tracker.completed:
            tracker.failure(type(e).__name__)
        raise


# =====================================================
# CELERY TASK DECORATOR
# =====================================================

def track_celery_task(func):
    """
    Decorator to automatically track Celery task metrics.
    
    Usage:
        @celery_app.task
        @track_celery_task
        def my_task():
            pass
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        task_name = func.__name__
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            metrics.celery_task_duration_seconds.labels(
                task_name=task_name,
                status='success'
            ).observe(duration)
            
            metrics.celery_task_total.labels(
                task_name=task_name,
                status='success'
            ).inc()
            
            return result
            
        except Exception:
            duration = time.time() - start_time
            
            metrics.celery_task_duration_seconds.labels(
                task_name=task_name,
                status='failure'
            ).observe(duration)
            
            metrics.celery_task_total.labels(
                task_name=task_name,
                status='failure'
            ).inc()
            
            raise
    
    return wrapper


# =====================================================
# CELERY QUEUE MONITORING
# =====================================================

def update_celery_queue_metrics(celery_app):
    """
    Update Celery queue length and active tasks.
    Call this periodically (e.g., every 30 seconds).
    """
    try:
        inspect = celery_app.control.inspect()
        
        # Get queue lengths
        active_queues = inspect.active_queues()
        if active_queues:
            for worker, queues in active_queues.items():
                for queue in queues:
                    queue_name = queue.get('name', 'default')
                    # This doesn't give us waiting tasks, need Redis for that
        
        # Get active tasks
        active = inspect.active()
        if active:
            for worker, tasks in active.items():
                queue_name = 'default'  # You may need to extract from worker name
                metrics.celery_active_tasks.labels(
                    queue_name=queue_name
                ).set(len(tasks))
        
        # Get worker pool size
        stats = inspect.stats()
        if stats:
            for worker, stat in stats.items():
                pool_size = stat.get('pool', {}).get('max-concurrency', 0)
                metrics.celery_worker_pool_size.labels(
                    worker_name=worker
                ).set(pool_size)
                
    except Exception as e:
        # Log but don't fail
        print(f"Error updating Celery metrics: {e}")


def get_redis_queue_length(redis_client, queue_name='celery'):
    """
    Get queue length directly from Redis.
    More accurate than inspect().
    """
    try:
        queue_length = redis_client.llen(queue_name)
        metrics.celery_queue_length.labels(
            queue_name=queue_name
        ).set(queue_length)
        return queue_length
    except Exception:
        metrics.redis_connection_errors_total.inc()
        raise


# =====================================================
# BUSINESS METRICS HELPERS
# =====================================================

def update_active_monitors_count(monitor_type: str, count: int):
    """Update active monitor count."""
    metrics.active_monitors_total.labels(
        monitor_type=monitor_type
    ).set(count)


def update_active_users_count(count: int):
    """Update active users count."""
    metrics.active_users_total.set(count)


def update_monitors_per_user(user_id: str, username: str, count: int):
    """Update monitors per user."""
    metrics.monitors_per_user.labels(
        user_id=str(user_id),
        username=username
    ).set(count)


def record_user_registration():
    """Record a new user registration."""
    metrics.user_registrations_total.inc()


def record_api_auth_attempt(success: bool):
    """Record API authentication attempt."""
    status = 'success' if success else 'failed'
    metrics.api_auth_attempts_total.labels(status=status).inc()


# =====================================================
# DATABASE QUERY TRACKING
# =====================================================

@contextmanager
def track_db_query(model_name: str, operation: str):
    """
    Track database query performance.
    
    Usage:
        with track_db_query('Website', 'select'):
            websites = Website.objects.filter(is_active=True)
    """
    start_time = time.time()
    
    try:
        yield
    finally:
        duration = time.time() - start_time
        
        metrics.db_query_duration_seconds.labels(
            model=model_name,
            operation=operation
        ).observe(duration)
        
        # Track slow queries
        if duration > 0.1:  # 100ms threshold
            metrics.db_slow_queries_total.labels(
                model=model_name,
                operation=operation
            ).inc()


# =====================================================
# EXTERNAL API TRACKING
# =====================================================

@contextmanager
def track_external_api_call(service: str):
    """
    Track external API calls (SES, Slack, etc.).
    
    Usage:
        with track_external_api_call('ses') as tracker:
            ses_client.send_email(...)
            tracker.success()
    """
    start_time = time.time()
    
    class Tracker:
        def __init__(self):
            self.completed = False
        
        def success(self):
            duration = time.time() - start_time
            metrics.external_api_requests_total.labels(
                service=service,
                status='success'
            ).inc()
            
            metrics.external_api_duration_seconds.labels(
                service=service
            ).observe(duration)
            self.completed = True
        
        def failure(self):
            duration = time.time() - start_time
            metrics.external_api_requests_total.labels(
                service=service,
                status='failed'
            ).inc()
            
            metrics.external_api_duration_seconds.labels(
                service=service
            ).observe(duration)
            self.completed = True
    
    tracker = Tracker()
    try:
        yield tracker
    except Exception:
        if not tracker.completed:
            tracker.failure()
        raise