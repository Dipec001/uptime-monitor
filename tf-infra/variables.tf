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
