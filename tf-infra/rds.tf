resource "aws_db_instance" "this" {
  count                   = var.env == "prod" ? 1 : 1
  identifier              = "${var.env}-uptimemonitor-db"
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t3.micro"
  name                    = var.db_name
  username                = var.db_username
  password                = var.db_password
  skip_final_snapshot     = var.env != "prod"
  publicly_accessible     = false
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
  db_subnet_group_name    = aws_db_subnet_group.default.name
}
