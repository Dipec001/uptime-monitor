from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from monitor.models import UptimeCheckResult
import logging

logger = logging.getLogger('monitor')

class Command(BaseCommand):
    help = 'Deletes UptimeCheckResult entries older than N days (default 90)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Retention period in days. Default is 90.'
        )

    def handle(self, *args, **options):
        retention_days = options['days']
        cutoff_date = timezone.now() - timedelta(days=retention_days)
        deleted_count, _ = UptimeCheckResult.objects.filter(
            checked_at__lt=cutoff_date
        ).delete()

        message = f"[✓] Deleted {deleted_count} uptime logs older than {retention_days} days"
        logger.info(message)
        self.stdout.write(self.style.SUCCESS(f"[✓] Deleted {deleted_count} records older than {retention_days} days."))
