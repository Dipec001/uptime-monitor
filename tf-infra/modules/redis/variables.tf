variable "env" {
  description = "Environment name (staging or prod)"
  type        = string
}

variable "use_elasticache" {
  description = "Whether to provision Elasticache or not"
  type        = bool
  default     = true
}

variable "subnet_ids" {
  description = "List of subnet IDs for Redis"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups allowed to access Redis"
  type        = list(string)
}

variable "node_type" {
  description = "Instance type for Redis"
  type        = string
  default     = "cache.t3.micro"
}
