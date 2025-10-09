output "redis_endpoint" {
  value       = try(aws_elasticache_cluster.redis[0].cache_nodes[0].address, null)
  description = "Redis cluster endpoint"
}

output "redis_port" {
  value       = try(aws_elasticache_cluster.redis[0].cache_nodes[0].port, null)
  description = "Redis cluster port"
}
