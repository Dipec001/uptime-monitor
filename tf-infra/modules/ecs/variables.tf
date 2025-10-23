variable "env" { type = string }
variable "vpc_id" { type = string }
variable "ecr_repo_url" { type = string }
variable "database_url" { type = string }
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
