resource "aws_elasticache_subnet_group" "redis_sg" {
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = [aws_subnet.private.id]
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.project_name}-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  subnet_group_name    = aws_elasticache_subnet_group.redis_sg.name
  parameter_group_name = "default.redis7"
  port                 = 6379
}
