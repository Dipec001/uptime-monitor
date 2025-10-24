variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "ecr_repo_url" {
  description = "ECR repository URL for ECS service"
  type        = string
}

variable "ec2_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "use_elasticache" {
  description = "Whether to provision Elasticache or not"
  type        = bool
  default     = true
}

variable "env" {
  description = "the environment"
  type        = string
  default     = "prod"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for alivechecks.com"
  type        = string
  sensitive   = true
}

variable "alert_email" {
  type    = string
  default = "dpecchukwu@gmail.com"
}

variable "domain" {
  type    = string
  default = "alivechecks.com"
}

variable "grafana_admin_password" {
  description = "Grafana Admin password"
  type        = string
  sensitive   = true
}