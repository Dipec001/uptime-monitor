variable "env" {
  description = "Environment name (staging or prod)"
  type        = string
}

variable "ecs_tasks_sg_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}
