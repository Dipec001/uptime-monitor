terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "uptimemonitor-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    use_lockfile   = true
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}

# =========================
# Networking
# =========================
module "networking" {
  source = "../modules/networking"
  env    = "prod"
  ecs_sg_id  = module.ecs.ecs_security_group_id
}

# =========================
# RDS
# =========================
module "rds" {
  source      = "../modules/rds"
  env         = "prod"
  db_subnet_group_name   = module.networking.rds_subnet_group_name
  vpc_security_group_ids = [module.networking.db_sg_id]
  db_username = var.db_username
  db_password = var.db_password
  db_name     = var.db_name
}

# =========================
# Redis (ElastiCache)
# =========================
module "redis" {
  source          = "../modules/redis"
  env             = "prod"
  subnet_ids       = module.networking.private_subnet_ids
  security_group_ids = [module.networking.db_sg_id]
  use_elasticache = true
}

# =========================
# ECS Cluster + Services
# =========================
module "ecs" {
  source             = "../modules/ecs"
  env                = "prod"
  vpc_id             = module.networking.vpc_id
  public_subnets     = [module.networking.public_subnet_id]
  ecr_repo_url       = var.ecr_repo_url
  image_tag          = var.image_tag
  database_url       = "postgres://${var.db_username}:${var.db_password}@${module.rds.db_endpoint}:5432/${var.db_name}"
  redis_url          = "redis://${module.redis.redis_endpoint}:6379/0"
  ec2_instance_type  = "t3.micro"
}
