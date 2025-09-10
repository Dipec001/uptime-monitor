# IAM role for EC2 to push logs to S3 Glacier
resource "aws_iam_role" "ec2_logs_role" {
  name = "${var.project_name}-ec2-logs-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ec2_logs_policy" {
  name = "${var.project_name}-logs-policy"
  role = aws_iam_role.ec2_logs_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:ListBucket"]
        Resource = [
          "arn:aws:s3:::uptime-monitor-logs",
          "arn:aws:s3:::uptime-monitor-logs/*"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_logs_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_logs_role.name
}

resource "aws_instance" "app" {
  ami                    = "ami-0c02fb55956c7d316" # Ubuntu 22.04 LTS (us-east-1)
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.ec2_private_sg.id]
  key_name               = var.key_pair_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_logs_profile.name
  associate_public_ip_address = false

  user_data = <<-EOF
              #!/bin/bash
              apt update -y
              apt install -y docker.io docker-compose
              usermod -aG docker ubuntu
              mkdir -p /app
              # Code copy/deploy handled via CI/CD
              EOF

  tags = { Name = "${var.project_name}-app" }
}

# ALB
resource "aws_lb" "alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ec2_private_sg.id]
  subnets            = [aws_subnet.public.id]
}

resource "aws_lb_target_group" "app_tg" {
  name     = "${var.project_name}-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  health_check {
    path                = "/health/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}
