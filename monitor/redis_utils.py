# redis_utils.py
import time
import redis
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def get_redis_connection():
    """
    Safely get a Redis connection. Returns None if unavailable.
    """
    redis_url = getattr(settings, "REDIS_URL", None)
    if not redis_url:
        logger.warning("REDIS_URL not set in settings. Redis features disabled.")
        return None

    try:
        r = redis.StrictRedis.from_url(redis_url)
        r.ping()  # test connection
        return r
    except redis.ConnectionError as e:
        logger.error(f"Cannot connect to Redis at {redis_url}: {e}")
        return None


# Global Redis connection
r = get_redis_connection()


def allow_ping_sliding(
        heartbeat_id,
        user_id=None,
        interval_seconds=10,
        max_calls=1
        ):
    """
    Sliding-window rate limiter.
    Returns True if allowed, False if rate-limited.
    """
    if r is None:
        # If Redis not available, default to allow (or optionally deny)
        logger.warning("Redis not available, skipping rate limiting")
        return True

    now_ts = int(time.time() * 1000)  # milliseconds
    window_start = now_ts - (interval_seconds * 1000)

    # Redis sorted set key
    key = f"rate:hb:{heartbeat_id}"
    if user_id:
        key = f"rate:user:{user_id}:hb:{heartbeat_id}"

    try:
        # Remove timestamps outside the window
        r.zremrangebyscore(key, 0, window_start)

        # Get current count
        count = r.zcard(key)

        if count >= max_calls:
            return False

        # Add current timestamp
        r.zadd(key, {str(now_ts): now_ts})
        r.expire(key, interval_seconds + 1)
        return True
    except redis.RedisError as e:
        logger.error(f"Redis error in allow_ping_sliding: {e}")
        # Fail open: allow ping if Redis fails
        return True
