# redis_utils.py
import time
import redis
from django.conf import settings

r = redis.StrictRedis.from_url(settings.REDIS_URL)

def allow_ping_sliding(heartbeat_id, user_id=None, interval_seconds=10, max_calls=1):
    """
    Sliding-window rate limiter.
    - heartbeat_id: which heartbeat
    - user_id: optional, per-user limits
    - interval_seconds: window size in seconds (e.g., 10s)
    - max_calls: max allowed calls in the window
    Returns True if allowed, False if rate-limited.
    """
    now_ts = int(time.time() * 1000)  # milliseconds
    window_start = now_ts - (interval_seconds * 1000)

    # Redis sorted set key
    key = f"rate:hb:{heartbeat_id}"
    if user_id:
        key = f"rate:user:{user_id}:hb:{heartbeat_id}"

    # Remove old timestamps outside the window
    r.zremrangebyscore(key, 0, window_start)

    # Get current count
    count = r.zcard(key)

    if count >= max_calls:
        return False

    # Add current timestamp
    r.zadd(key, {str(now_ts): now_ts})
    r.expire(key, interval_seconds + 1)

    return True
