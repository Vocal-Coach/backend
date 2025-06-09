#!/bin/bash

# Script to set up Terraform S3 backend
set -e

echo "🚀 Setting up Terraform S3 backend..."

# Change to terraform directory
cd terraform

# Initialize and apply backend setup
echo "📦 Creating S3 bucket and DynamoDB table..."
terraform init
terraform apply -target=aws_s3_bucket.terraform_state -target=aws_s3_bucket_versioning.terraform_state -target=aws_s3_bucket_server_side_encryption_configuration.terraform_state -target=aws_s3_bucket_public_access_block.terraform_state -target=aws_dynamodb_table.terraform_locks -target=random_string.bucket_suffix -auto-approve

# Get the bucket name and DynamoDB table name
BUCKET_NAME=$(terraform output -raw s3_bucket_name)
DYNAMODB_TABLE=$(terraform output -raw dynamodb_table_name)

echo "📝 S3 Bucket: $BUCKET_NAME"
echo "📝 DynamoDB Table: $DYNAMODB_TABLE"

# Update backend.tf with the actual bucket name
cat > backend.tf << EOF
terraform {
  backend "s3" {
    bucket         = "$BUCKET_NAME"
    key            = "vocal-coach/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "$DYNAMODB_TABLE"
    encrypt        = true
  }
}
EOF

echo "✅ Backend configuration updated!"
echo "🔄 Migrating existing state to S3..."

# Migrate existing state to S3
terraform init -migrate-state -force-copy

# Remove the backend setup resources from main state
echo "🧹 Cleaning up backend setup resources..."
terraform state rm aws_s3_bucket.terraform_state
terraform state rm aws_s3_bucket_versioning.terraform_state
terraform state rm aws_s3_bucket_server_side_encryption_configuration.terraform_state
terraform state rm aws_s3_bucket_public_access_block.terraform_state
terraform state rm aws_dynamodb_table.terraform_locks
terraform state rm random_string.bucket_suffix

# Remove the backend setup file
rm backend-setup.tf

echo "🎉 S3 backend setup complete!"
echo "💡 Your Terraform state is now stored in S3: $BUCKET_NAME"
echo "🔒 State locking is enabled with DynamoDB table: $DYNAMODB_TABLE" 