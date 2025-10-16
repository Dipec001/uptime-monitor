#!/bin/bash
set -e

# Create ECR repository
aws ecr-public create-repository \
  --repository-name uptimemonitor \
  --region us-east-1

# Create a lifecycle policy to manage image retention
# Not supported in public ECR as of now, so skipping this step