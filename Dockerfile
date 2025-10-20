# =======================
# 1. Builder Stage
# =======================
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

# Install packages system-wide (no --user)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Make sure /usr/local/bin executables are world-executable
RUN chmod -R a+x /usr/local/bin

# =======================
# 2. Final Stage
# =======================
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN useradd --create-home appuser

# Copy system-wide installed packages
COPY --from=builder /usr/local /usr/local

# Copy codebase
COPY --chown=appuser:appuser . .

# Collect static files (Django admin, etc.)
RUN python manage.py collectstatic --noinput || true

# Create entrypoint script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Running database migrations..."\n\
python manage.py migrate --noinput\n\
echo "Migrations complete!"\n\
exec "$@"' > /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh && \
    chown appuser:appuser /app/docker-entrypoint.sh

# Switch to non-root user
USER appuser

EXPOSE 8000

# Define entrypoint and default command
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "uptimemonitor.wsgi:application"]
