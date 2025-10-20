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

variable "image_tag" {
  description = "Docker image tag to deploy"
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
  default     = "staging"
}