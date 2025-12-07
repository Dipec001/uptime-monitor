# =========================
# ECS Cluster
# =========================
resource "aws_ecs_cluster" "this" {
  name = "${var.env}-uptimemonitor-cluster"
}

# =========================
# IAM Role for ECS Tasks
# =========================
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.env}-ecs-task-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
# ========================================
# Access AWS services from your application
# ========================================
resource "aws_iam_role" "django_task_role" {
  name = "${var.env}-django-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_ses" {
  name = "${var.env}-django-task-ses-policy"
  role = aws_iam_role.django_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:GetAccount",
          "ses:GetSendQuota",
          "sesv2:SendEmail",
          "sesv2:GetAccount",
          "sesv2:GetSendQuota"
        ]
        Resource = "*"
      }
    ]
  })
}

# =========================
# ECS Exec Policy for Task Role
# =========================
resource "aws_iam_role_policy" "ecs_exec_task_role" {
  name = "${var.env}-ecs-exec-task-policy"
  role = aws_iam_role.django_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ]
        Resource = "*"
      }
    ]
  })
}

# =========================
# ECS Exec Policy for Task Execution Role
# =========================
resource "aws_iam_role_policy" "ecs_exec_execution_role" {
  name = "${var.env}-ecs-exec-execution-policy"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ]
        Resource = "*"
      }
    ]
  })
}

# =========================
# ECS tasks SG (for awsvpc tasks)
# =========================
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "${var.env}-ecs-tasks-sg"
  description = "Allow ALB to reach ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # allow traffic from ALB
  }

  # Allow Prometheus to scrape metrics
  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.observability_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# =========================
# ECS Security Group
# =========================
resource "aws_security_group" "ecs_sg" {
  name        = "${var.env}-ecs-sg"
  description = "Allow web access"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

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

# =========================
# ECS Task Definition
# =========================
resource "aws_ecs_task_definition" "this" {
  family                   = "${var.env}-uptimemonitor"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.django_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "web"
      image = "${var.ecr_repo_url}:${var.env}-latest"
      essential = true
      portMappings = [{ 
        containerPort = 8000, 
        # Host port not needed with awsvpc mode
        protocol      = "tcp"
      }]
      secrets = [
        {
          name      = "DEFAULT_FROM_EMAIL"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:DEFAULT_FROM_EMAIL::"
        },
        {
          name      = "NOREPLY_EMAIL"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:NOREPLY_EMAIL::"
        },
        {
          name      = "SUPPORT_EMAIL"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:SUPPORT_EMAIL::"
        },
        {
          name      = "GITHUB_OAUTH_CLIENT_ID"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:GITHUB_OAUTH_CLIENT_ID::"
        },
        {
          name      = "GITHUB_OAUTH_CLIENT_SECRET"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:GITHUB_OAUTH_CLIENT_SECRET::"
        },
        {
          name      = "RESEND_API_KEY"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:RESEND_API_KEY::"
        },
      ]
      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url },
        { name = "CELERY_BROKER_URL", value = var.redis_url },
        { name = "ENVIRONMENT", value = var.env },
        { name = "FRONTEND_BASE_URL", value = var.frontend_base_url }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.env}-uptimemonitor"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "web"
        }
      }
    },
    {
      name  = "celery"
      image = "${var.ecr_repo_url}:${var.env}-latest"
      command = ["celery", "-A", "uptimemonitor", "worker", "-l", "info"]
      essential = true
      secrets = [
        {
          name      = "DEFAULT_FROM_EMAIL"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:DEFAULT_FROM_EMAIL::"
        },
        {
          name      = "NOREPLY_EMAIL"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:NOREPLY_EMAIL::"
        },
        {
          name      = "SUPPORT_EMAIL"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:SUPPORT_EMAIL::"
        },
        {
          name      = "RESEND_API_KEY"
          valueFrom = "${data.aws_secretsmanager_secret.app_credentials.arn}:RESEND_API_KEY::"
        }
      ]
      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url },
        { name = "CELERY_BROKER_URL", value = var.redis_url },
        { name = "ENVIRONMENT", value = var.env },
        { name = "FRONTEND_BASE_URL", value = var.frontend_base_url }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.env}-uptimemonitor"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "celery"
        }
      }
    },
    {
      name  = "beat"
      image = "${var.ecr_repo_url}:${var.env}-latest"
      command = ["celery", "-A", "uptimemonitor", "beat", "-l", "info", "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"]
      essential = false
      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url },
        { name = "CELERY_BROKER_URL", value = var.redis_url },
        { name = "ENVIRONMENT", value = var.env },
        { name = "FRONTEND_BASE_URL", value = var.frontend_base_url }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.env}-uptimemonitor"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "beat"
        }
      }
    }
  ])
}

# =========================
# ECS Service
# =========================
resource "aws_ecs_service" "this" {
  name            = "${var.env}-uptimemonitor-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = 1
  launch_type     = "EC2"

  enable_execute_command = true

  # DEPLOYMENT SETTINGS
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100
  force_new_deployment              = true

  # DEPLOYMENT CIRCUIT BREAKER (Optional but recommended)
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # NETWORK CONFIGURATION (Required for awsvpc mode!)
  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    # can't assign public ip for ec2 type ecs
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    container_name   = "web"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.http_listener,
    aws_iam_role_policy_attachment.ecs_task_execution_policy
  ]

  service_registries {
    registry_arn = aws_service_discovery_service.django.arn
  }

  # LIFECYCLE RULE (Prevents unnecessary replacements)
  lifecycle {
    ignore_changes = [desired_count]
  }
}

# ===============================
# Service discovery for Django
# ===============================
resource "aws_service_discovery_service" "django" {
  name = "django"  # This becomes "django.{namespace}"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    
    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

# =========================
# EC2 Role & Instance Profile
# =========================
resource "aws_iam_role" "ec2_instance_role" {
  name = "${var.env}-ecs-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_ec2_policy" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecs_ssm_policy" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}


# =========================
# This policy allows the ECS task to read specific Secrets Manager secrets
# =========================
resource "aws_iam_policy" "ecs_read_secrets" {
  name        = "${var.env}-ecs-read-secrets"
  description = "Allow ECS task to read specific secrets from Secrets Manager"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:us-east-1:790814117525:secret:uptimemonitor/production/credentials-WNQLM4*"
      }
    ]
  })
}

# Attach the custom secret-read policy to the ECS task role
resource "aws_iam_role_policy_attachment" "ecs_task_secrets" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_read_secrets.arn
}


# ========================================================
# ensures ECS can create log streams and push logs to CloudWatch.
# ========================================================
resource "aws_iam_role_policy_attachment" "ecs_logs" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.env}-ecs-instance-profile"
  role = aws_iam_role.ec2_instance_role.name
}

# =========================
# Create Log Group
# =========================
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.env}-uptimemonitor"
  retention_in_days = 14
}

# =========================
# Launch Template (replaces Launch Configuration)
# =========================

data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_launch_template" "ecs_launch_template" {
  name_prefix   = "${var.env}-ecs-lt-"
  image_id      = data.aws_ssm_parameter.ecs_ami.value
  instance_type = var.ec2_instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_instance_profile.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ecs_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.this.name} >> /etc/ecs/ecs.config
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.env}-ecs-instance"
      Env  = var.env
    }
  }
}

# =========================
# Auto Scaling Group
# =========================
resource "aws_autoscaling_group" "ecs_asg" {
  name                 = "${var.env}-ecs-asg"
  desired_capacity     = 1
  max_size             = 2
  min_size             = 1
  vpc_zone_identifier  = var.public_subnets
  launch_template {
    id      = aws_launch_template.ecs_launch_template.id
    version = "$Latest"
  }

  # HIGHLY RECOMMENDED: Add health checks
  health_check_type         = "ELB"  # Use ALB health checks instead of asg 
  health_check_grace_period = 300    # Wait 5 min before checking

}
