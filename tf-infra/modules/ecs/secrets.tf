# Reference existing secret
data "aws_secretsmanager_secret" "app_credentials" {
  arn = "arn:aws:secretsmanager:us-east-1:790814117525:secret:uptimemonitor/production/credentials-WNQLM4"
}

# Update with new email addresses
resource "aws_secretsmanager_secret_version" "app_credentials" {
  secret_id = data.aws_secretsmanager_secret.app_credentials.id
  
  secret_string = jsonencode({
    # SMTP credentials - not needed with django-ses!

    DEFAULT_FROM_EMAIL = "alerts@alivechecks.com"
    NOREPLY_EMAIL      = "noreply@alivechecks.com"
    SUPPORT_EMAIL      = "support@alivechecks.com"
    
    # Will add Other non-email secrets
    GITHUB_OAUTH_CLIENT_ID     = var.github_oauth_client_id
    GITHUB_OAUTH_CLIENT_SECRET = var.github_oauth_client_secret
  })
}