output "db_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "db_identifier" {
  value = aws_db_instance.this.identifier
}

output "database_url" {
  description = "Full DATABASE_URL for Django"
  value       = "postgres://${var.db_username}:${var.db_password}@${aws_db_instance.this.endpoint}/${var.db_name}"
  sensitive   = true
}

