output "certificate_arn" {
  value       = var.env == "prod" ? aws_acm_certificate.alivechecks[0].arn : null
  description = "ARN of the validated ACM certificate"
}

output "certificate_status" {
  value       = var.env == "prod" ? aws_acm_certificate.alivechecks[0].status : null
  description = "Status of the certificate"
}

# =========================
# Outputs for verification
# =========================
output "ses_domain_verification_token" {
  description = "Add this TXT record to Cloudflare DNS"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_tokens" {
  description = "Add these CNAME records to Cloudflare DNS"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}