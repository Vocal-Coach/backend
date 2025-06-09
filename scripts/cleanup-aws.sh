#!/bin/bash

# Script to clean up all AWS resources for vocal-coach project
set +e  # Continue on errors to clean up as much as possible

REGION="ap-northeast-2"
PROJECT_NAME="vocal-coach"

echo "🧹 Starting AWS cleanup for vocal-coach project..."
echo "⚠️  This will delete ALL resources related to this project!"

# Ask for confirmation
read -p "Are you sure you want to proceed? Type 'yes' to continue: " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo "🚀 Starting cleanup process..."

# 1. Delete ECS Service and Tasks
echo "🔄 Deleting ECS Service..."
if aws ecs describe-services --cluster "$PROJECT_NAME-cluster" --services "$PROJECT_NAME-app" --region $REGION > /dev/null 2>&1; then
    aws ecs update-service --cluster "$PROJECT_NAME-cluster" --service "$PROJECT_NAME-app" --desired-count 0 --region $REGION
    sleep 30
    aws ecs delete-service --cluster "$PROJECT_NAME-cluster" --service "$PROJECT_NAME-app" --region $REGION
    echo "✅ ECS Service deleted"
else
    echo "ℹ️  ECS Service not found or already deleted"
fi

# 2. Delete ECS Cluster
echo "🔄 Deleting ECS Cluster..."
if aws ecs delete-cluster --cluster "$PROJECT_NAME-cluster" --region $REGION > /dev/null 2>&1; then
    echo "✅ ECS Cluster deleted"
else
    echo "ℹ️  ECS Cluster not found or already deleted"
fi

# 3. Delete Load Balancer
echo "🔄 Deleting Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names "$PROJECT_NAME-alb" --region $REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null)
if [ "$ALB_ARN" != "None" ] && [ "$ALB_ARN" != "" ]; then
    aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $REGION
    echo "✅ Load Balancer deleted"
else
    echo "ℹ️  Load Balancer not found or already deleted"
fi

# 4. Delete Target Group
echo "🔄 Deleting Target Group..."
TG_ARN=$(aws elbv2 describe-target-groups --names "$PROJECT_NAME-app-tg" --region $REGION --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null)
if [ "$TG_ARN" != "None" ] && [ "$TG_ARN" != "" ]; then
    aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $REGION
    echo "✅ Target Group deleted"
else
    echo "ℹ️  Target Group not found or already deleted"
fi

# 5. Delete RDS Instance
echo "🔄 Deleting RDS Instance..."
if aws rds delete-db-instance --db-instance-identifier "$PROJECT_NAME-db" --skip-final-snapshot --region $REGION > /dev/null 2>&1; then
    echo "✅ RDS Instance deletion initiated (this may take several minutes)"
else
    echo "ℹ️  RDS Instance not found or already deleted"
fi

# 6. Delete RDS Subnet Group
echo "🔄 Deleting RDS Subnet Group..."
if aws rds delete-db-subnet-group --db-subnet-group-name "$PROJECT_NAME-db-subnet-group" --region $REGION > /dev/null 2>&1; then
    echo "✅ RDS Subnet Group deleted"
else
    echo "ℹ️  RDS Subnet Group not found or already deleted"
fi

# 7. Delete ECR Repository
echo "🔄 Deleting ECR Repository..."
if aws ecr delete-repository --repository-name "$PROJECT_NAME-app" --force --region $REGION > /dev/null 2>&1; then
    echo "✅ ECR Repository deleted"
else
    echo "ℹ️  ECR Repository not found or already deleted"
fi

# 8. Delete CloudWatch Log Group
echo "🔄 Deleting CloudWatch Log Group..."
if aws logs delete-log-group --log-group-name "/ecs/$PROJECT_NAME-app" --region $REGION > /dev/null 2>&1; then
    echo "✅ CloudWatch Log Group deleted"
else
    echo "ℹ️  CloudWatch Log Group not found or already deleted"
fi

# 9. Delete SSM Parameters
echo "🔄 Deleting SSM Parameters..."
SSM_PARAMS=(
    "/$PROJECT_NAME/db/host"
    "/$PROJECT_NAME/db/port"
    "/$PROJECT_NAME/db/name"
    "/$PROJECT_NAME/db/username"
    "/$PROJECT_NAME/db/password"
    "/$PROJECT_NAME/jwt/secret"
)

for param in "${SSM_PARAMS[@]}"; do
    if aws ssm delete-parameter --name "$param" --region $REGION > /dev/null 2>&1; then
        echo "✅ SSM Parameter $param deleted"
    else
        echo "ℹ️  SSM Parameter $param not found"
    fi
done

# 10. Delete IAM Roles and Policies
echo "🔄 Deleting IAM Roles..."
ROLES=("$PROJECT_NAME-ecs-execution-role" "$PROJECT_NAME-ecs-task-role")

for role in "${ROLES[@]}"; do
    # Detach managed policies
    aws iam list-attached-role-policies --role-name $role --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null | tr '\t' '\n' | while read policy_arn; do
        if [ "$policy_arn" != "" ]; then
            aws iam detach-role-policy --role-name $role --policy-arn $policy_arn 2>/dev/null
        fi
    done
    
    # Delete inline policies
    aws iam list-role-policies --role-name $role --query 'PolicyNames[]' --output text 2>/dev/null | tr '\t' '\n' | while read policy_name; do
        if [ "$policy_name" != "" ]; then
            aws iam delete-role-policy --role-name $role --policy-name $policy_name 2>/dev/null
        fi
    done
    
    # Delete role
    if aws iam delete-role --role-name $role > /dev/null 2>&1; then
        echo "✅ IAM Role $role deleted"
    else
        echo "ℹ️  IAM Role $role not found"
    fi
done

# 11. Delete NAT Gateway
echo "🔄 Deleting NAT Gateway..."
NAT_GW_IDS=$(aws ec2 describe-nat-gateways --filter "Name=tag:Name,Values=$PROJECT_NAME-nat-gw" --region $REGION --query 'NatGateways[?State==`available`].NatGatewayId' --output text 2>/dev/null)
if [ "$NAT_GW_IDS" != "" ]; then
    for nat_gw_id in $NAT_GW_IDS; do
        aws ec2 delete-nat-gateway --nat-gateway-id $nat_gw_id --region $REGION
        echo "✅ NAT Gateway $nat_gw_id deletion initiated"
    done
else
    echo "ℹ️  NAT Gateway not found"
fi

# 12. Release Elastic IPs
echo "🔄 Releasing Elastic IPs..."
EIP_ALLOCS=$(aws ec2 describe-addresses --filters "Name=tag:Name,Values=$PROJECT_NAME-nat-eip" --region $REGION --query 'Addresses[].AllocationId' --output text 2>/dev/null)
if [ "$EIP_ALLOCS" != "" ]; then
    for eip_alloc in $EIP_ALLOCS; do
        aws ec2 release-address --allocation-id $eip_alloc --region $REGION
        echo "✅ Elastic IP $eip_alloc released"
    done
else
    echo "ℹ️  Elastic IPs not found"
fi

# 13. Delete VPC and related resources
echo "🔄 Deleting VPC resources..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$PROJECT_NAME-vpc" --region $REGION --query 'Vpcs[0].VpcId' --output text 2>/dev/null)
if [ "$VPC_ID" != "None" ] && [ "$VPC_ID" != "" ]; then
    # Delete Security Groups (except default)
    SG_IDS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text)
    for sg_id in $SG_IDS; do
        if aws ec2 delete-security-group --group-id $sg_id --region $REGION > /dev/null 2>&1; then
            echo "✅ Security Group $sg_id deleted"
        else
            echo "⚠️  Could not delete Security Group $sg_id"
        fi
    done
    
    # Delete Subnets
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'Subnets[].SubnetId' --output text)
    for subnet_id in $SUBNET_IDS; do
        aws ec2 delete-subnet --subnet-id $subnet_id --region $REGION
        echo "✅ Subnet $subnet_id deleted"
    done
    
    # Delete Route Tables (except main)
    RT_IDS=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text)
    for rt_id in $RT_IDS; do
        aws ec2 delete-route-table --route-table-id $rt_id --region $REGION
        echo "✅ Route Table $rt_id deleted"
    done
    
    # Delete Internet Gateway
    IGW_IDS=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --region $REGION --query 'InternetGateways[].InternetGatewayId' --output text)
    for igw_id in $IGW_IDS; do
        aws ec2 detach-internet-gateway --internet-gateway-id $igw_id --vpc-id $VPC_ID --region $REGION
        aws ec2 delete-internet-gateway --internet-gateway-id $igw_id --region $REGION
        echo "✅ Internet Gateway $igw_id deleted"
    done
    
    # Delete VPC
    aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION
    echo "✅ VPC $VPC_ID deleted"
else
    echo "ℹ️  VPC resources not found or already deleted"
fi

# 14. Delete S3 Bucket
echo "🔄 Deleting S3 Bucket..."
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?starts_with(Name, '$PROJECT_NAME-terraform-state-')].Name" --output text)
if [ "$BUCKET_NAME" != "" ]; then
    # Empty bucket first
    aws s3 rm "s3://$BUCKET_NAME" --recursive
    aws s3api delete-bucket --bucket $BUCKET_NAME --region $REGION
    echo "✅ S3 Bucket $BUCKET_NAME deleted"
else
    echo "ℹ️  S3 Bucket not found"
fi

# 15. Delete DynamoDB Table
echo "🔄 Deleting DynamoDB Table..."
if aws dynamodb delete-table --table-name "$PROJECT_NAME-terraform-locks" --region $REGION > /dev/null 2>&1; then
    echo "✅ DynamoDB Table deleted"
else
    echo "ℹ️  DynamoDB Table not found"
fi

echo "🎉 Cleanup completed!"
echo "ℹ️  Some resources (like RDS) may take several minutes to fully delete."
echo "💡 You can now run the setup scripts to start fresh." 