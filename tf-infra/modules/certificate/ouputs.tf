output "certificate_arn" {
  value       = var.env == "prod" ? aws_acm_certificate.alivechecks[0].arn : null
  description = "ARN of the validated ACM certificate"
}

output "certificate_status" {
  value       = var.env == "prod" ? aws_acm_certificate.alivechecks[0].status : null
  description = "Status of the certificate"
}
