# redis.tf
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${var.env}-redis-subnet-group"
  subnet_ids = [aws_subnet.private.id]
}

resource "aws_elasticache_cluster" "redis" {
  count                = var.use_elasticache ? 1 : 0
  cluster_id           = "${var.env}-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.ecs_sg.id]
}
