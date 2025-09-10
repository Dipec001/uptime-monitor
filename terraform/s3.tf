resource "aws_s3_bucket" "logs" {
  bucket = "uptime-monitor-logs"   # realistic project-specific bucket name
  acl    = "private"

  lifecycle_rule {
    id      = "glacier-archive"
    enabled = true
    prefix  = "logs/"
    transition {
      days          = 30
      storage_class = "GLACIER"
    }
    expiration {
      days = 365
    }
  }
}
