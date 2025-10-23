# ------------- aws sg -----------------
resource "aws_security_group" "alb_sg" {
  name        = "${var.env}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.env}-alb-sg"
    Env  = var.env
  }
}

# ---------------- HTTP IPv4 ---------------------------
resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb_sg.id
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4       = "0.0.0.0/0"
}

# ------------------ HTTPS IPv4 ----------------------------
resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb_sg.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4       = "0.0.0.0/0"
}

# ---------------- Outbound: allow all IPv4 --------------------
resource "aws_vpc_security_group_egress_rule" "alb_all_egress" {
  security_group_id = aws_security_group.alb_sg.id
  ip_protocol       = "-1"
  cidr_ipv4       = "0.0.0.0/0"
}

# ---------- ALB ---------
resource "aws_lb" "this" {
  name               = "${var.env}-uptimemonitor-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.public_subnets

  enable_deletion_protection = var.env == "prod" ? true : false

  # Add access logs later

  tags = {
    Name = "${var.env}-alb"
    Environment = var.env
  }
}

resource "random_string" "tg_suffix" {
  length  = 4
  special = false
  upper   = false

  keepers = {
    # Force new suffix when target_type changes
    target_type = "ip"
  }
}

# ---------- Target group -------------
resource "aws_lb_target_group" "ecs_tg" {
  name     = "${var.env}-uptimemonitor-tg-${random_string.tg_suffix.result}"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  target_type = "ip"  # <- IMPORTANT for awsvpc mode

  lifecycle {
    create_before_destroy = true
  }
  
  health_check {
    path                = "/healthz/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# ===========================
# HTTP Listener (Always created for prod and staging)
# ===========================
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    # In staging: forward directly to target group
    # In prod: redirect to HTTPS
    type = var.env == "prod" ? "redirect" : "forward"
    
    # Redirect config (only used in prod)
    dynamic "redirect" {
      for_each = var.env == "prod" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
    
    # Forward config (only used in staging)
    target_group_arn = var.env == "prod" ? null : aws_lb_target_group.ecs_tg.arn
  }
}

# ===========================
# HTTPS Listener (Prod only)
# ===========================
resource "aws_lb_listener" "https_listener" {
  count             = var.env == "prod" ? 1 : 0
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  
  # Attach ACM certificate
  certificate_arn   = var.certificate_arn
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"  # Modern TLS only
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
  }
  
  # Wait for certificate validation
  # depends_on = [aws_acm_certificate_validation.alivechecks]
}