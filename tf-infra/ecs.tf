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
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# =========================
# ECS Security Group
# =========================
resource "aws_security_group" "ecs_sg" {
  name        = "${var.env}-ecs-sg"
  description = "Allow web access"
  vpc_id      = aws_vpc.main.id

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

  tags = {
    Name = "${var.env}-ecs-sg"
    Env  = var.env
  }
}

# =========================
# ECS Task Definition
# =========================
resource "aws_ecs_task_definition" "uptimemonitor" {
  family                   = "${var.env}-uptimemonitor"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name  = "web"
      image = "${var.ecr_repo_url}:${var.image_tag}"
      essential = true
      portMappings = [{ containerPort = 8000, hostPort = 8000 }]
      environment = [
        { name = "DATABASE_URL", value = "postgres://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:5432/${var.db_name}" },
        {
          name = "REDIS_URL"
          value = var.use_elasticache ? "redis://${aws_elasticache_cluster.redis[0].configuration_endpoint_address}:6379/0" : "redis://redis:6379/0"
        }
      ]
    },
    {
      name  = "celery"
      image = "${var.ecr_repo_url}:${var.image_tag}"
      command = ["celery", "-A", "uptimemonitor", "worker", "-l", "info"]
      essential = false
      environment = [
        { name = "DATABASE_URL", value = "postgres://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:5432/${var.db_name}" },
        {
          name = "REDIS_URL"
          value = var.use_elasticache ? "redis://${aws_elasticache_cluster.redis[0].configuration_endpoint_address}:6379/0" : "redis://redis:6379/0"
        }
      ]
    },
    {
      name  = "beat"
      image = "${var.ecr_repo_url}:${var.image_tag}"
      command = ["celery", "-A", "uptimemonitor", "beat", "-l", "info", "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"]
      essential = false
      environment = [
        { name = "DATABASE_URL", value = "postgres://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:5432/${var.db_name}" },
        {
          name = "REDIS_URL"
          value = var.use_elasticache ? "redis://${aws_elasticache_cluster.redis[0].configuration_endpoint_address}:6379/0" : "redis://redis:6379/0"
        }
      ]
    },
    # Redis container only for staging
    {
      name      = "redis"
      image     = "redis:7-alpine"
      essential = true
      portMappings = [
        { containerPort = 6379, hostPort = 6379 }
      ]
    }
  ])
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
    subnets          = [aws_subnet.public.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_policy]
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

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.env}-ecs-instance-profile"
  role = aws_iam_role.ec2_instance_role.name
}

# =========================
# Launch Configuration
# =========================
data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_launch_configuration" "ecs_launch_config" {
  name_prefix          = "${var.env}-ecs-lc-"
  image_id             = data.aws_ssm_parameter.ecs_ami.value
  instance_type        = var.ec2_instance_type
  security_groups      = [aws_security_group.ecs_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ecs_instance_profile.name
  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.uptimemonitor.name} >> /etc/ecs/ecs.config
              EOF
}

# =========================
# Auto Scaling Group
# =========================
resource "aws_autoscaling_group" "ecs_asg" {
  desired_capacity     = 1
  max_size             = 2
  min_size             = 1
  vpc_zone_identifier  = [aws_subnet.public.id]
  launch_configuration = aws_launch_configuration.ecs_launch_config.id
}
