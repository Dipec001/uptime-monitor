variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type = string
  default = "uptime-monitor"
}

variable "state_bucket_name" {
  default = "my-terraform-state-bucket"
}

variable "aws_profile" {
  default = "iam-dipec01"
}

variable "env" {
  type = string
  description = "Environment name: dev or prod"
}

variable "db_username" {
  type        = string
  description = "RDS username"
}

variable "db_password" {
  type        = string
  description = "RDS password"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "RDS database name"
}

variable "redis_url" {
  type        = string
  description = "Redis connection URL"
}

variable "use_elasticache" {
  type    = bool
  default = false
}