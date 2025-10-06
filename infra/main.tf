provider "aws" {
  region = var.aws_region
}

resource "aws_db_subnet_group" "uptime_monitor" {
  name       = "uptime-monitor-subnets"
  subnet_ids = var.subnet_ids
  description = "Subnet group for RDS"
}

resource "aws_db_instance" "uptime_monitor" {
  allocated_storage    = var.db_storage
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.db_instance_class
  name                 = var.db_name
  username             = var.db_username
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.uptime_monitor.name
  skip_final_snapshot  = true
  publicly_accessible  = false
  multi_az             = false
}
