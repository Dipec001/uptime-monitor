#!/usr/bin/env bash
set -e

ENVIRONMENT=$1
echo "Deploying environment: $ENVIRONMENT"

if [ "$ENVIRONMENT" == "prod" ]; then
  CLUSTER="prod-uptimemonitor-cluster"
  SERVICE="prod-uptimemonitor-service"
else
  CLUSTER="staging-uptimemonitor-cluster"
  SERVICE="staging-uptimemonitor-service"
fi

echo "Triggering ECS deployment for $ENVIRONMENT..."
aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --force-new-deployment

echo "Deployment triggered successfully!"
echo "You can monitor the deployment status in the AWS ECS console."
