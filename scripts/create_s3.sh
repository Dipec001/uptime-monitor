#!/bin/bash

set -e

echo "Starting S3 bucket creation for Terraform state..."

# Create S3 bucket for Terraform state
aws s3api create-bucket --bucket uptimemonitor-tfstate --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning --bucket uptimemonitor-tfstate --versioning-configuration Status=Enabled

echo "S3 bucket 'uptimemonitor-tfstate' created with versioning enabled."