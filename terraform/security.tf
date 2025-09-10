resource "aws_security_group" "ec2_private_sg" {
  name        = "${var.project_name}-ec2-sg"
  description = "Minimal access for EC2 in private subnet"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr] # Allow only internal VPC traffic
  }

  tags = { Name = "${var.project_name}-ec2-sg" }
}
