#!/bin/bash
set -e

aws ecr-public describe-images \
  --repository-name uptimemonitor \
  --region us-east-1 \
  --query 'reverse(sort_by(imageDetails,& imagePushedAt))[:][].imageDigest' \
  --output text | awk '{for(i=16;i<=NF;i++) print $i}' | while read digest; do
    aws ecr-public batch-delete-image --repository-name uptimemonitor --image-ids imageDigest=$digest --region us-east-1
  done
