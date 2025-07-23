from celery import shared_task
from .utils import get_due_websites, check_website_uptime
from .models import Website, UptimeCheckResult
from datetime import timedelta
from django.utils.timezone import now


@shared_task(bind=True, max_retries=3)
def check_single_website(self, website_id):
    try:
        website = Website.objects.get(pk=website_id)

        if not website.is_active:
            return

        status_code, response_time_ms = check_website_uptime(website.url)

        UptimeCheckResult.objects.create(
            website=website,
            status_code=status_code,
            response_time_ms=response_time_ms
        )

        # 🔁 Schedule next check
        # Floor the current time to the nearest minute
        current_time = now().replace(second=0, microsecond=0)

        # Calculate the next aligned interval (e.g., if interval=1 and it's 00:02:32 → next_check = 00:03:00)
        website.next_check_at = current_time + timedelta(minutes=website.check_interval)
        website.save(update_fields=["next_check_at"])

        print(f"[✓] {website.url} checked: {status_code} in {response_time_ms}ms")

    except Website.DoesNotExist:
        print(f"[!] Website {website_id} no longer exists.")

    except Exception as e:
        print(f"[!] Error checking {website_id}: {str(e)}")
        self.retry(countdown=10)


@shared_task
def check_due_websites():
    due_websites = get_due_websites()

    count = 0
    for website in due_websites.iterator():  # memory-safe for large queries
        check_single_website.delay(website.id)
        count += 1

    return f"Queued {count} websites for checking."
