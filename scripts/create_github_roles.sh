#!/bin/bash
set -e

# ---------- Configuration ----------
AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID  # replace with your AWS account ID or set as env variable
GITHUB_OWNER="Dipec001"
GITHUB_REPO="uptime-monitor"
AWS_REGION="us-east-1"  # Change if needed

# ---------- Policies to attach ----------
POLICIES=(
  "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
  "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
)

# ---------- Function to create or update a role ----------
create_or_update_github_role() {
  local ROLE_NAME=$1
  local BRANCH_REF=$2

  echo "Processing role: $ROLE_NAME for branch $BRANCH_REF"

  # Trust policy
  local TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:$GITHUB_OWNER/$GITHUB_REPO:ref:refs/heads/$BRANCH_REF"
        }
      }
    }
  ]
}
EOF
)

  # Check if role exists
  if aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
    echo "Role $ROLE_NAME exists. Updating assume role policy..."
    aws iam update-assume-role-policy \
      --role-name "$ROLE_NAME" \
      --policy-document "$TRUST_POLICY"
  else
    echo "Creating role $ROLE_NAME..."
    aws iam create-role \
      --role-name "$ROLE_NAME" \
      --assume-role-policy-document "$TRUST_POLICY"
  fi

  # Attach required policies (idempotent)
  for POLICY in "${POLICIES[@]}"; do
    echo "Attaching policy $POLICY to $ROLE_NAME..."
    aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn "$POLICY" || true
  done

  # Output role ARN
  ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
  echo "$ROLE_NAME ARN: $ROLE_ARN"
  echo
}

# ---------- Staging Role ----------
create_or_update_github_role "GitHubActions-Staging" "dev"

# ---------- Production Role ----------
create_or_update_github_role "GitHubActions-Production" "main"

echo "✅ All roles are ready. Use the ARNs in your GitHub Actions workflow."
