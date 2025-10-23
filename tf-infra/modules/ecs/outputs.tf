output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "ecs_service_name" {
  value = aws_ecs_service.this.name
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_sg.id
}

output "ecs_tasks_security_group_id" {
  value = aws_security_group.ecs_tasks_sg.id
}

output "alb_sg_id" {
  value = aws_security_group.alb_sg.id
}
