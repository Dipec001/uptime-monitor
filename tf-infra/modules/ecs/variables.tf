variable "env" { type = string }
variable "vpc_id" { type = string }
variable "public_subnets" { type = list(string) }
variable "ecr_repo_url" { type = string }
variable "image_tag" { type = string }
variable "database_url" { type = string }
variable "redis_url" { type = string }
variable "ec2_instance_type" {
  type    = string
  default = "t3.micro"
}
