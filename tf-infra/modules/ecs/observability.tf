# =======================
# EFS for Persistent Storage
# =======================
resource "aws_efs_file_system" "observability" {
  creation_token = "${var.env}-observability-efs"
  encrypted      = true

  tags = {
    Name = "${var.env}-observability-efs"
    Env  = var.env
  }
}

resource "aws_efs_mount_target" "observability" {
  count           = length(var.private_subnets)
  file_system_id  = aws_efs_file_system.observability.id
  subnet_id       = var.private_subnets[count.index]
  security_groups = [aws_security_group.efs_sg.id]
}

# =====================================
# EFS security group
# =====================================
resource "aws_security_group" "efs_sg" {
  name        = "${var.env}-efs-sg"
  description = "Security group for EFS"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.observability_sg.id]  # only Prometheus & Grafana
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.env}-efs-sg"
    Env  = var.env
  }
}

# ==================================
# Create Access Points
# ===================================
resource "aws_efs_access_point" "prometheus" {
  file_system_id = aws_efs_file_system.observability.id

  root_directory {
    path = "/prometheus"
    creation_info {
      owner_gid   = 65534  # nobody group
      owner_uid   = 65534  # nobody user
      permissions = "755"
    }
  }

  tags = {
    Name = "${var.env}-prometheus-ap"
  }
}

# Create Access Point for Grafana
resource "aws_efs_access_point" "grafana" {
  file_system_id = aws_efs_file_system.observability.id

  root_directory {
    path = "/grafana"
    creation_info {
      owner_gid   = 472    # grafana group
      owner_uid   = 472    # grafana user
      permissions = "755"
    }
  }

  tags = {
    Name = "${var.env}-grafana-ap"
  }
}

# =======================
# Prometheus Task Definition
# =======================
resource "aws_ecs_task_definition" "prometheus" {
  family                   = "${var.env}-prometheus"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  # For task permissions:
  task_role_arn            = aws_iam_role.ecs_task_execution.arn

  # Mount EFS for persistent storage
  volume {
    name = "prometheus-data"
    
    efs_volume_configuration {
      file_system_id          = aws_efs_file_system.observability.id
      transit_encryption      = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.prometheus.id
        iam             = "DISABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "prometheus"
      image     = "prom/prometheus:latest"
      essential = true
      
      portMappings = [{
        containerPort = 9090
      }]
      
      mountPoints = [{
        sourceVolume  = "prometheus-data"
        containerPath = "/prometheus"
      }]
      
      command = [
        "--config.file=/etc/prometheus/prometheus.yml",
        "--storage.tsdb.path=/prometheus",
        "--storage.tsdb.retention.time=30d"
      ]
      
      # You'll need to provide config via S3 or build custom image
      environment = [
        { name = "ENVIRONMENT", value = var.env }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.env}-prometheus"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "prometheus"
        }
      }
    }
  ])
}

# -- dynamic grafana url -----
locals {
  grafana_root_url = var.env == "prod" ? "https://grafana.${var.domain}" : "http://${aws_lb.this.dns_name}/grafana"
  grafana_serve_from_subpath = var.env == "prod" ? "false" : "true"
}

# =======================
# Grafana Task Definition
# =======================
resource "aws_ecs_task_definition" "grafana" {
  family                   = "${var.env}-grafana"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  # For task permissions:
  task_role_arn            = aws_iam_role.ecs_task_execution.arn

  volume {
    name = "grafana-data"
    
    efs_volume_configuration {
      file_system_id          = aws_efs_file_system.observability.id
      transit_encryption      = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.grafana.id
        iam             = "DISABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "grafana"
      image     = "grafana/grafana:latest"
      essential = true
      
      portMappings = [{
        containerPort = 3000
      }]
      
      mountPoints = [{
        sourceVolume  = "grafana-data"
        containerPath = "/var/lib/grafana"
      }]
            
      environment = [
        { name = "GF_SECURITY_ADMIN_PASSWORD", value = var.grafana_admin_password },
        { name = "GF_SERVER_ROOT_URL", value = local.grafana_root_url },
        { name = "GF_SERVER_SERVE_FROM_SUB_PATH", value = local.grafana_serve_from_subpath },
        { name = "GF_INSTALL_PLUGINS", value = "grafana-clock-panel,grafana-simple-json-datasource" }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.env}-grafana"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "grafana"
        }
      }
    }
  ])
}

# =======================
# ECS Services (Prom and Grafana)
# =======================
resource "aws_ecs_service" "prometheus" {
  name            = "${var.env}-prometheus-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.prometheus.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  platform_version = "LATEST"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.observability_sg.id]
    assign_public_ip = false  # false for private subnets
  }

  # Service discovery for internal access
  service_registries {
    registry_arn = aws_service_discovery_service.prometheus.arn
  }

  force_new_deployment = true

  lifecycle {
    create_before_destroy = false
  }
}

resource "aws_ecs_service" "grafana" {
  name            = "${var.env}-grafana-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.grafana.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  platform_version = "LATEST"

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = [aws_security_group.observability_sg.id]
    assign_public_ip = false  # false for private subnets
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.grafana_tg.arn
    container_name   = "grafana"
    container_port   = 3000
  }

  force_new_deployment = true

  lifecycle {
    create_before_destroy = false
  }
}

# =======================
# Security Group for Observability
# =======================
resource "aws_security_group" "observability_sg" {
  name        = "${var.env}-observability-sg"
  description = "Security group for Prometheus and Grafana"
  vpc_id      = var.vpc_id

  # Prometheus port (internal only)
  ingress {
    from_port       = 9090
    to_port         = 9090
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  # Grafana port (from ALB)
  ingress {
    from_port       = 3000
    to_port         = 3000
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
    Name = "${var.env}-observability-sg"
    Env  = var.env
  }
}

# =======================
# Service Discovery for Prometheus
# =======================
resource "aws_service_discovery_private_dns_namespace" "internal" {
  name = "${var.env}.local"
  vpc  = var.vpc_id
}

resource "aws_service_discovery_service" "prometheus" {
  name = "prometheus"

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

# =======================
# ALB Target Group for Grafana
# =======================
resource "aws_lb_target_group" "grafana_tg" {
  name        = "${var.env}-grafana-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  lifecycle {
    create_before_destroy = true
  }
}

# =======================
# ALB Listener Rule for Grafana
# =======================
resource "aws_lb_listener_rule" "grafana" {
  # Match your existing ALB listener logic
  listener_arn = var.env == "prod" ? aws_lb_listener.https_listener[0].arn : aws_lb_listener.http_listener.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.grafana_tg.arn
  }

  # Dynamic condition: subdomain for prod, path for staging
  dynamic "condition" {
    for_each = var.env == "prod" ? [1] : []
    content {
      host_header {
        values = ["grafana.${var.domain}"]
      }
    }
  }

  dynamic "condition" {
    for_each = var.env == "prod" ? [] : [1]
    content {
      path_pattern {
        values = ["/grafana*"]
      }
    }
  }
}

# =======================
# CloudWatch Log Groups
# =======================
resource "aws_cloudwatch_log_group" "prometheus" {
  name              = "/ecs/${var.env}-prometheus"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "grafana" {
  name              = "/ecs/${var.env}-grafana"
  retention_in_days = 7
}