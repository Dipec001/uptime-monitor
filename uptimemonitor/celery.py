import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uptimemonitor.settings')

app = Celery('uptimemonitor')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


# 🔁 My periodic tasks here
app.conf.beat_schedule = {
    'check-due-websites-every-minute': {
        'task': 'monitor.tasks.check_due_websites',
        'schedule': crontab(),  # every minute
    },
    'cleanup-uptime-logs-daily': {
        'task': 'monitor.tasks.cleanup_old_logs',
        'schedule': crontab(hour=2, minute=0),
        'args': (90,),
    },
    'check_heartbeats-every-minute': {
        'task': 'monitor.tasks.check_due_heartbeats',
        'schedule': crontab(),  # every minute
    },
}


# =====================================================
# CELERY BEAT SCHEDULE
# =====================================================

# Add this to your celery.py or settings.py:
"""
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'collect-business-metrics': {
        'task': 'monitoring.tasks.collect_business_metrics',
        'schedule': crontab(minute='*/2'),  # Every 2 minutes
    },
    'collect-uptime-percentages': {
        'task': 'monitoring.tasks.collect_uptime_percentages',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'collect-heartbeat-metrics': {
        'task': 'monitoring.tasks.collect_heartbeat_metrics',
        'schedule': crontab(minute='*/1'),  # Every minute
    },
    'collect-celery-queue-metrics': {
        'task': 'monitoring.tasks.collect_celery_queue_metrics',
        'schedule': 30.0,  # Every 30 seconds
    },
    'collect-database-metrics': {
        'task': 'monitoring.tasks.collect_database_metrics',
        'schedule': crontab(minute='*/2'),  # Every 2 minutes
    },
}
"""