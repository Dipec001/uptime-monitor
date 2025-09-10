terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "uptime-monitor-terraform-state"   # Auto-created bucket for storing TF state
    key    = "uptime-monitor/main.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}
