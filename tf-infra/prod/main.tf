terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket       = "uptimemonitor-tfstate"
    key          = "prod/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# =========================
# ACM + Certificate
# =========================
module "certificate" {
  source               = "../modules/certificate"
  env                  = "prod"
  cloudflare_zone_id   = var.cloudflare_zone_id
  cloudflare_api_token = var.cloudflare_api_token
}

# =========================
# Networking
# =========================
module "networking" {
  source          = "../modules/networking"
  env             = "prod"
  ecs_tasks_sg_id = module.ecs.ecs_tasks_security_group_id
}

# =========================
# RDS
# =========================
module "rds" {
  source                 = "../modules/rds"
  env                    = "prod"
  db_subnet_group_name   = module.networking.rds_subnet_group_name
  vpc_security_group_ids = [module.networking.db_sg_id]
  db_username            = var.db_username
  db_password            = var.db_password
  db_name                = var.db_name
}

# =========================
# Redis (ElastiCache)
# =========================
module "redis" {
  source = "../modules/redis"
  env    = "prod"

  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.redis.redis_security_group_id]
  vpc_id             = module.networking.vpc_id
  ecs_tasks_sg_id    = module.ecs.ecs_tasks_security_group_id
  use_elasticache    = true
}

# =========================
# ECS Cluster + Services
# =========================
module "ecs" {
  source            = "../modules/ecs"
  env               = "prod"
  vpc_id            = module.networking.vpc_id
  private_subnets   = module.networking.private_subnet_ids
  ecr_repo_url      = var.ecr_repo_url
  frontend_base_url = var.frontend_base_url
  database_url      = "postgres://${var.db_username}:${urlencode(var.db_password)}@${module.rds.db_endpoint}/${var.db_name}"
  redis_url         = "redis://${module.redis.redis_endpoint}:6379/0"
  ec2_instance_type = "t3.medium"
  github_oauth_client_id     = var.github_oauth_client_id
  github_oauth_client_secret = var.github_oauth_client_secret
  resend_api_key    = var.resend_api_key
  public_subnets    = module.networking.public_subnet_ids
  alert_email       = "dpecchukwu@gmail.com"
  db_identifier     = module.rds.db_identifier
  domain            = "alivechecks.com"
  grafana_admin_password  = var.grafana_admin_password

  certificate_arn    = module.certificate.certificate_arn
  certificate_status = module.certificate.certificate_status

  depends_on = [module.certificate]
}

# ========================= 
# Grafana DNS Record
# ========================= 
resource "cloudflare_record" "grafana" {
  zone_id = var.cloudflare_zone_id
  name    = "grafana"
  type    = "CNAME"
  content = module.ecs.alb_dns_name
  ttl     = 1
  proxied = false
  
  comment = "Grafana observability dashboard"
  
  depends_on = [module.ecs]
}