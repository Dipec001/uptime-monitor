resource "aws_s3_bucket" "tf_state" {
  bucket = var.state_bucket_name

  versioning {
    enabled = true  # Keeps old state versions
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Environment = "Terraform"
    Name        = "Terraform State Bucket"
  }
}
