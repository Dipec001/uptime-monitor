output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "ecs_service_name" {
  value = aws_ecs_service.this.name
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_sg.id
}

output "alb_sg_id" {
  value = aws_security_group.alb_sg.id
}

# ========================= 
# Outputs from ses.tf
# ========================= 
output "ses_smtp_user" {
  value       = aws_iam_access_key.ses_smtp.id
  description = "SMTP username for SES"
}

output "ses_smtp_endpoint" {
  value       = "email-smtp.${var.aws_region}.amazonaws.com"
  description = "SES SMTP endpoint"
}

output "ses_sender_email" {
  value       = aws_ses_email_identity.sender.email
  description = "Verified sender email"
}

# DO NOT output the password in plain text in production
# output "ses_smtp_password" {
#   value     = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
#   sensitive = true
# }