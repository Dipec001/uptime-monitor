resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = [aws_subnet.private.id]
}

resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.medium"
  name                 = "uptimemonitordb"
  username             = var.db_username
  password             = var.db_password
  vpc_security_group_ids = [aws_security_group.ec2_private_sg.id]
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
  skip_final_snapshot  = true
}
