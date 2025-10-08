# =========================
# ECS Cluster
# =========================
resource "aws_ecs_cluster" "uptimemonitor" {
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
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# =========================
# ECS Task Definition
# =========================
resource "aws_ecs_task_definition" "uptimemonitor" {
  family                   = "${var.env}-uptimemonitor"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = "${var.ecr_repo_url}:${var.image_tag}"
      essential = true
      portMappings = [{ containerPort = 8000, hostPort = 8000 }]
      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url }
      ]
    },
    {
      name      = "celery"
      image     = "${var.ecr_repo_url}:${var.image_tag}"
      command   = ["celery", "-A", "uptimemonitor", "worker", "-l", "info"]
      essential = false
      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url }
      ]
    },
    {
      name      = "beat"
      image     = "${var.ecr_repo_url}:${var.image_tag}"
      command   = ["celery", "-A", "uptimemonitor", "beat", "-l", "info", "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"]
      essential = false
      environment = [
        { name = "DATABASE_URL", value = var.database_url },
        { name = "REDIS_URL", value = var.redis_url }
      ]
    }
  ])
}

# =========================
# ECS Security Group
# =========================
resource "aws_security_group" "ecs_sg" {
  name        = "${var.env}-ecs-sg"
  description = "Allow web access"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# =========================
# ECS Service
# =========================
resource "aws_ecs_service" "uptimemonitor" {
  name            = "${var.env}-uptimemonitor-service"
  cluster         = aws_ecs_cluster.uptimemonitor.id
  task_definition = aws_ecs_task_definition.uptimemonitor.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_policy]
}

# =========================
# Optional: Auto Scaling (EC2) - basic example
# =========================
resource "aws_autoscaling_group" "ecs_asg" {
  desired_capacity     = 1
  max_size             = 2
  min_size             = 1
  vpc_zone_identifier  = var.subnet_ids
  launch_configuration = aws_launch_configuration.ecs_launch_config.id
}

resource "aws_launch_configuration" "ecs_launch_config" {
  name_prefix   = "${var.env}-ecs-lc-"
  image_id      = var.ec2_ami
  instance_type = var.ec2_instance_type
  security_groups = [aws_security_group.ecs_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ecs_instance_profile.name
  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.uptimemonitor.name} >> /etc/ecs/ecs.config
              EOF
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.env}-ecs-instance-profile"
  role = aws_iam_role.ec2_instance_role.name
}

resource "aws_iam_role" "ec2_instance_role" {
  name = "${var.env}-ecs-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_ec2_policy" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}
