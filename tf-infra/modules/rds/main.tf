resource "aws_db_instance" "this" {
  identifier              = "${var.env}-uptimemonitor-db"
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t3.micro"

  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password

  # Keep DB private
  publicly_accessible     = false
  skip_final_snapshot     = var.env != "prod"

  # Connect to networking module outputs
  vpc_security_group_ids  = var.vpc_security_group_ids
  db_subnet_group_name    = var.db_subnet_group_name

  # configure lifecycle later

  tags = {
    Name = "${var.env}-uptimemonitor-db"
    Env  = var.env
  }
}
