# ---------- VPC ----------
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.env}-uptimemonitor-vpc"
    Env  = var.env
  }
}

# ---------- Private Subnet for RDS ----------
resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.env}-private-subnet"
    Env  = var.env
  }
}

# ---------- Public Subnet ----------
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.env}-public-subnet"
    Env  = var.env
  }
}

# ---------- Internet Gateway ----------
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.env}-igw"
    Env  = var.env
  }
}

# ---------- ECS Security Group ----------
resource "aws_security_group" "ecs_sg" {
  name        = "${var.env}-ecs-sg"
  description = "Allow ECS tasks outbound access"
  vpc_id      = aws_vpc.main.id

  # Allow outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.env}-ecs-sg"
    Env  = var.env
  }
}

# ---------- Security Group for RDS ----------
resource "aws_security_group" "db_sg" {
  name        = "${var.env}-rds-sg"
  description = "Allow Postgres access from ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.env}-rds-sg"
    Env  = var.env
  }
}

# ---------- DB Subnet Group ----------
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.env}-rds-subnet-group"
  subnet_ids = [aws_subnet.private.id]

  tags = {
    Name = "${var.env}-rds-subnet-group"
    Env  = var.env
  }
}
