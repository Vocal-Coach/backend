# SSM Parameters for Database Configuration
resource "aws_ssm_parameter" "db_host" {
  name  = "/${var.project_name}/db/host"
  type  = "String"
  value = aws_db_instance.main.endpoint

  tags = {
    Name = "${var.project_name}-db-host"
  }
}

resource "aws_ssm_parameter" "db_port" {
  name  = "/${var.project_name}/db/port"
  type  = "String"
  value = tostring(aws_db_instance.main.port)

  tags = {
    Name = "${var.project_name}-db-port"
  }
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/${var.project_name}/db/name"
  type  = "String"
  value = aws_db_instance.main.db_name

  tags = {
    Name = "${var.project_name}-db-name"
  }
}

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.project_name}/db/username"
  type  = "String"
  value = aws_db_instance.main.username

  tags = {
    Name = "${var.project_name}-db-username"
  }
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/db/password"
  type  = "SecureString"
  value = var.db_password

  tags = {
    Name = "${var.project_name}-db-password"
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.project_name}/jwt/secret"
  type  = "SecureString"
  value = var.jwt_secret

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
} 