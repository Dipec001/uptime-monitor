# =======================
# 1. Builder Stage
# =======================
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build deps for psycopg2, Pillow, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --user --no-cache-dir --upgrade pip \
    && pip install --user --no-cache-dir -r requirements.txt

# =======================
# 2. Final Stage
# =======================
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN useradd --create-home appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Make sure Python can find user-installed packages
ENV PATH=/root/.local/bin:$PATH

# Copy codebase
COPY --chown=appuser:appuser . .

# Collect static files (Django admin, etc.)
RUN python manage.py collectstatic --noinput || true

# Switch to appuser
USER appuser

EXPOSE 8000

# Use Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "uptimemonitor.wsgi:application"]
