variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "uptime-monitor"
}

variable "db_username" {
  type    = string
  default = "uptimemonitor_admin"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "domain_name" {
  description = "My main domain for Route 53 (e.g., example.com)"
  type        = string
}
