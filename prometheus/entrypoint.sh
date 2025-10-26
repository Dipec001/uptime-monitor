#!/bin/sh
set -e

if [ -z "$S3_BUCKET" ]; then
  echo "Error: S3_BUCKET environment variable not set!"
  exit 1
fi

# Download config from S3
echo "Downloading Prometheus config from S3..."
aws s3 cp "s3://${S3_BUCKET}/prometheus/prometheus.yml" /etc/prometheus/prometheus.yml

# Verify config
echo "Verifying Prometheus config..."
/bin/promtool check config /etc/prometheus/prometheus.yml

# Start Prometheus
echo "Starting Prometheus..."
exec /bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --storage.tsdb.retention.time=30d
