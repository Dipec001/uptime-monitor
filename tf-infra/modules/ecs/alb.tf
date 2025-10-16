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
  from_port         = 0
  to_port           = 0
  ip_protocol       = "-1"
  cidr_ipv4       = "0.0.0.0/0"
}

# ---------- ALB ---------
resource "aws_lb" "this" {
  name               = "${var.env}-uptimemonitor-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [var.public_subnets]

  enable_deletion_protection = var.env == "prod" ? true : false

  # Add access logs later

  tags = {
    Name = "${var.env}-alb"
    Environment = var.env
  }
}

# ---------- Target group -------------
resource "aws_lb_target_group" "ecs_tg" {
  name     = "${var.env}-uptimemonitor-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path                = "/healthz/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# --------- Listener --------------
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
  }
}
