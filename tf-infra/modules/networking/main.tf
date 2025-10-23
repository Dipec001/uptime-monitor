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

# ---------- Private Subnets for RDS ----------
resource "aws_subnet" "private" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = cidrsubnet("10.0.0.0/16", 8, count.index) # creates 10.0.0.0/24 and 10.0.1.0/24
  map_public_ip_on_launch = false
  availability_zone       = ["us-east-1a", "us-east-1b"][count.index]

  tags = {
    Name = "${var.env}-private-subnet-${count.index}"
    Env  = var.env
  }
}

# ---------- Public Subnet ----------
resource "aws_subnet" "public" {
  count = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet("10.0.0.0/16", 8, count.index + 2) # avoids overlap with private subnets
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.env}-public-subnet-${count.index}"
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

# ---------- Elastic IP for NAT Gateway ----------
resource "aws_eip" "nat" {
  domain = "vpc"
  
  depends_on = [aws_internet_gateway.igw]
  
  tags = {
    Name = "${var.env}-nat-eip"
    Env  = var.env
  }
}

# ---------- NAT Gateway (in PUBLIC subnet) ----------
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id  # NAT goes in public subnet!
  
  depends_on = [aws_internet_gateway.igw]
  
  tags = {
    Name = "${var.env}-nat-gateway"
    Env  = var.env
  }
}

# ---------- Private Route Table (NEW!) ----------
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  
  # Route to internet via NAT Gateway
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
  
  tags = {
    Name = "${var.env}-private-rt"
    Env  = var.env
  }
}

# Associate private route table with private subnets
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# ------- Public Route Table ----------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
 
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.env}-public-rt"
  }
}

# Associate route table with public subnets
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
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
    security_groups = [var.ecs_tasks_sg_id]
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
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.env}-rds-subnet-group"
    Env  = var.env
  }
}