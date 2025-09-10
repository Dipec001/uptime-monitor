# --------------------------
# IAM Role for EC2 to push logs to S3 Glacier
# --------------------------
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

# --------------------------
# Launch Template
# --------------------------
resource "aws_launch_template" "app_lt" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = "ami-0c02fb55956c7d316" # Ubuntu 22.04 LTS
  instance_type = var.instance_type

  key_name = var.key_pair_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_logs_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.ec2_private_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt update -y
              apt install -y docker.io docker-compose
              usermod -aG docker ubuntu
              mkdir -p /app
              # Code copy/deploy handled via CI/CD
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-app"
    }
  }
}

# --------------------------
# Auto Scaling Group
# --------------------------
resource "aws_autoscaling_group" "app_asg" {
  desired_capacity     = 2
  min_size             = 1
  max_size             = 3
  vpc_zone_identifier  = [aws_subnet.private.id]
  health_check_type    = "EC2"
  health_check_grace_period = 60
  force_delete         = true

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }

  target_group_arns = [aws_lb_target_group.app_tg.arn]

  tag {
    key                 = "Name"
    value               = "${var.project_name}-app"
    propagate_at_launch = true
  }
}

# --------------------------
# ALB
# --------------------------
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
