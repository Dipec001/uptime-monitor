variable "env" {
  description = "Environment name (prod, staging, etc.)"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for alivechecks.com"
  type        = string
  sensitive   = true
}
