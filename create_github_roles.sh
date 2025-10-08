#!/bin/bash
set -e

# ---------- Configuration ----------
AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID
GITHUB_OWNER="Dipec001"
GITHUB_REPO="uptime-monitor"
AWS_REGION="us-east-1"  # change if needed

# ---------- Policies to attach ----------
POLICIES=(
  "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
  "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
)

# ---------- Create Staging Role ----------
STAGING_ROLE_NAME="GitHubActions-Staging"

aws iam create-role \
  --role-name $STAGING_ROLE_NAME \
  --assume-role-policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Effect\": \"Allow\",
        \"Principal\": {
          \"Federated\": \"arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com\"
        },
        \"Action\": \"sts:AssumeRoleWithWebIdentity\",
        \"Condition\": {
          \"StringEquals\": {
            \"token.actions.githubusercontent.com:sub\": \"repo:$GITHUB_OWNER/$GITHUB_REPO:ref:refs/heads/staging\"
          }
        }
      }
    ]
  }"

echo "Created role: $STAGING_ROLE_NAME"

for POLICY in "${POLICIES[@]}"; do
  aws iam attach-role-policy --role-name $STAGING_ROLE_NAME --policy-arn $POLICY
done

echo "Attached policies to $STAGING_ROLE_NAME"

STAGING_ROLE_ARN=$(aws iam get-role --role-name $STAGING_ROLE_NAME --query 'Role.Arn' --output text)
echo "Staging role ARN: $STAGING_ROLE_ARN"

# ---------- Create Production Role ----------
PROD_ROLE_NAME="GitHubActions-Production"

aws iam create-role \
  --role-name $PROD_ROLE_NAME \
  --assume-role-policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Effect\": \"Allow\",
        \"Principal\": {
          \"Federated\": \"arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com\"
        },
        \"Action\": \"sts:AssumeRoleWithWebIdentity\",
        \"Condition\": {
          \"StringEquals\": {
            \"token.actions.githubusercontent.com:sub\": \"repo:$GITHUB_OWNER/$GITHUB_REPO:ref:refs/heads/main\"
          }
        }
      }
    ]
  }"

echo "Created role: $PROD_ROLE_NAME"

for POLICY in "${POLICIES[@]}"; do
  aws iam attach-role-policy --role-name $PROD_ROLE_NAME --policy-arn $POLICY
done

echo "Attached policies to $PROD_ROLE_NAME"

PROD_ROLE_ARN=$(aws iam get-role --role-name $PROD_ROLE_NAME --query 'Role.Arn' --output text)
echo "Production role ARN: $PROD_ROLE_ARN"

echo "✅ Done! Use these ARNs in your GitHub Actions workflow."
