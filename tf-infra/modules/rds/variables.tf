variable "env" {
  description = "Environment name (staging or prod)"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "vpc_security_group_ids" {
  description = "List of security groups for RDS access"
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "Subnet group name from networking module"
  type        = string
}
