resource "aws_ecr_repository" "this" {
  name = "${var.env}-uptimemonitor"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.env}-uptimemonitor-ecr"
    Env  = var.env
  }
}

# Keep only last 10 images
resource "aws_ecr_lifecycle_policy" "cleanup" {
  repository = aws_ecr_repository.this.name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images and expire older ones",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}
