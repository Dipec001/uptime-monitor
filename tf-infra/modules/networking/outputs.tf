output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
  description = "List of private subnet IDs"
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
  description = "List of public subnet IDs"
}

output "db_sg_id" {
  value = aws_security_group.db_sg.id
}

output "rds_subnet_group_name" {
  value = aws_db_subnet_group.rds_subnet_group.name
}
