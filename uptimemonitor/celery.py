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
        'task': 'monitor.tasks.check_heartbeats',
        'schedule': crontab(),  # every minute
    },
}