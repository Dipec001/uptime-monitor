# Reference existing secret
data "aws_secretsmanager_secret" "app_credentials" {
  arn = "arn:aws:secretsmanager:us-east-1:790814117525:secret:uptimemonitor/production/credentials-WNQLM4"
}

# Update secret with SES credentials
resource "aws_secretsmanager_secret_version" "app_credentials" {
  secret_id = data.aws_secretsmanager_secret.app_credentials.id
  
  secret_string = jsonencode({
    EMAIL_HOST          = "email-smtp.us-east-1.amazonaws.com"
    EMAIL_HOST_USER     = aws_iam_access_key.ses_smtp.id
    EMAIL_HOST_PASSWORD = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
    DEFAULT_FROM_EMAIL  = "dpecchukwu@gmail.com"
  })
}