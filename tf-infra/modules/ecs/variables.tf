variable "env" { type = string }
variable "vpc_id" { type = string }
variable "domain" {
  type = string
}
variable "alert_email" { type = string}
variable "ecr_repo_url" { type = string }
variable "database_url" { type = string }
variable "frontend_base_url" { type = string }
variable "redis_url" { type = string }
variable "ec2_instance_type" {
  type    = string
  default = "t3.medium"
}
variable "private_subnets" {
  type = list(string)
}
variable "public_subnets" {
  description = "publics subnet for ALB"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
  default     = null
}

variable "certificate_status" {
  description = "Validation status of ACM certificate"
  type        = string
  default     = null
}

variable "db_identifier" {
  type        = string
  description = "RDS DB identifier"
}

variable "grafana_admin_password" {
  type        = string
  description = "Admin password for Grafana"
  sensitive   = true
}

variable "github_oauth_client_id" {
  type = string
  sensitive = true
}

variable "github_oauth_client_secret" {
  type      = string
  sensitive = true
}

variable "resend_api_key" {
  type      = string
  sensitive = true
}