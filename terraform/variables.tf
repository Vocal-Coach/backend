variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "vocal-coach"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 3000
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "vocal_coach"
} 