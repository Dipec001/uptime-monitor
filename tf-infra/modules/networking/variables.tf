variable "env" {
  description = "Environment name (staging or prod)"
  type        = string
}

variable "ecs_sg_id" {
  description = "The ECS security group ID to allow traffic from ECS tasks"
  type        = string
}
