output "database_url" {
  description = "Full DATABASE_URL for Django (from RDS module)"
  value       = module.rds.database_url
  sensitive   = true
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}
