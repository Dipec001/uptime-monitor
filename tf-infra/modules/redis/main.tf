# ---------- Redis Subnet Group ----------
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${var.env}-redis-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.env}-redis-subnet-group"
    Env  = var.env
  }
}

# ---------- Redis Cluster ----------
resource "aws_elasticache_cluster" "redis" {
  count                = var.use_elasticache ? 1 : 0
  cluster_id           = "${var.env}-redis"
  engine               = "redis"
  node_type            = var.node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = var.security_group_ids

  tags = {
    Name = "${var.env}-redis"
    Env  = var.env
  }
}
