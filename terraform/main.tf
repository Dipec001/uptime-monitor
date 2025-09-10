provider "aws" {
  region = "us-east-1"
}

variable "project_name" { default = "uptime-monitor" }
variable "availability_zone" { default = "us-east-1a" }
variable "ami_id" { default = "ami-0abcdef1234567890" }
variable "instance_type" { default = "t3.micro" }
variable "key_name" { default = "uptime-monitor-key" }
variable "domain_name" { default = "pingops.com" }
variable "subdomain" { default = "monitor.pingops.com" }
variable "db_name" { default = "uptimemonitor" }
variable "db_user" { default = "admin" }
variable "db_password" { default = "supersecret123!" }

module "vpc" {
  source            = "./modules/vpc"
  project_name      = var.project_name
  availability_zone = var.availability_zone
}

module "security_groups" {
  source       = "./modules/security_groups"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
}

module "alb" {
  source         = "./modules/alb"
  project_name   = var.project_name
  public_subnets = [module.vpc.public_subnet_id]
  vpc_id         = module.vpc.vpc_id
  alb_sg         = module.security_groups.alb_sg
}

module "ec2" {
  source                = "./modules/ec2"
  project_name          = var.project_name
  private_subnet        = module.vpc.private_subnet_id
  instance_type         = var.instance_type
  ami_id                = var.ami_id
  key_name              = var.key_name
  ec2_sg                = module.security_groups.ec2_sg
  target_group_arn      = module.alb.tg_arn
  instance_profile_name = "uptime-monitor-ec2-role"
}

module "rds" {
  source        = "./modules/rds"
  project_name  = var.project_name
  private_subnet = module.vpc.private_subnet_id
  rds_sg        = module.security_groups.rds_sg
  db_name       = var.db_name
  db_user       = var.db_user
  db_password   = var.db_password
}

module "redis" {
  source         = "./modules/redis"
  project_name   = var.project_name
  private_subnet = module.vpc.private_subnet_id
  redis_sg       = module.security_groups.redis_sg
}

module "s3" {
  source       = "./modules/s3"
  project_name = var.project_name
}

module "route53" {
  source      = "./modules/route53"
  domain_name = var.domain_name
  subdomain   = var.subdomain
  alb_dns     = module.alb.alb_dns
  alb_zone_id = "Z35SXDOTRQ7X7K" # Replace with actual ALB hosted zone ID
}

module "monitoring" {
  source         = "./modules/monitoring"
  project_name   = var.project_name
  ami_id         = var.ami_id
  private_subnet = module.vpc.private_subnet_id
  ec2_sg         = module.security_groups.ec2_sg
}
