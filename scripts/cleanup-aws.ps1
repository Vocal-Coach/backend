# PowerShell script to clean up all AWS resources for vocal-coach project
$ErrorActionPreference = "Continue"  # Continue on errors to clean up as much as possible

$Region = "ap-northeast-2"
$ProjectName = "vocal-coach"

Write-Host "🧹 Starting AWS cleanup for vocal-coach project..." -ForegroundColor Yellow
Write-Host "⚠️  This will delete ALL resources related to this project!" -ForegroundColor Red

# Ask for confirmation
$confirmation = Read-Host "Are you sure you want to proceed? Type 'yes' to continue"
if ($confirmation -ne "yes") {
    Write-Host "❌ Cleanup cancelled." -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting cleanup process..." -ForegroundColor Green

# 1. Delete ECS Service and Tasks
Write-Host "🔄 Deleting ECS Service..." -ForegroundColor Cyan
try {
    $service = aws ecs describe-services --cluster "$ProjectName-cluster" --services "$ProjectName-app" --region $Region 2>$null | ConvertFrom-Json
    if ($service.services.Count -gt 0) {
        aws ecs update-service --cluster "$ProjectName-cluster" --service "$ProjectName-app" --desired-count 0 --region $Region
        Start-Sleep 30
        aws ecs delete-service --cluster "$ProjectName-cluster" --service "$ProjectName-app" --region $Region
        Write-Host "✅ ECS Service deleted" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  ECS Service not found or already deleted" -ForegroundColor Gray
}

# 2. Delete ECS Cluster
Write-Host "🔄 Deleting ECS Cluster..." -ForegroundColor Cyan
try {
    aws ecs delete-cluster --cluster "$ProjectName-cluster" --region $Region
    Write-Host "✅ ECS Cluster deleted" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  ECS Cluster not found or already deleted" -ForegroundColor Gray
}

# 3. Delete Load Balancer
Write-Host "🔄 Deleting Load Balancer..." -ForegroundColor Cyan
try {
    $albs = aws elbv2 describe-load-balancers --names "$ProjectName-alb" --region $Region 2>$null | ConvertFrom-Json
    if ($albs.LoadBalancers.Count -gt 0) {
        $albArn = $albs.LoadBalancers[0].LoadBalancerArn
        aws elbv2 delete-load-balancer --load-balancer-arn $albArn --region $Region
        Write-Host "✅ Load Balancer deleted" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  Load Balancer not found or already deleted" -ForegroundColor Gray
}

# 4. Delete Target Group
Write-Host "🔄 Deleting Target Group..." -ForegroundColor Cyan
try {
    $tgs = aws elbv2 describe-target-groups --names "$ProjectName-app-tg" --region $Region 2>$null | ConvertFrom-Json
    if ($tgs.TargetGroups.Count -gt 0) {
        $tgArn = $tgs.TargetGroups[0].TargetGroupArn
        aws elbv2 delete-target-group --target-group-arn $tgArn --region $Region
        Write-Host "✅ Target Group deleted" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  Target Group not found or already deleted" -ForegroundColor Gray
}

# 5. Delete RDS Instance
Write-Host "🔄 Deleting RDS Instance..." -ForegroundColor Cyan
try {
    aws rds delete-db-instance --db-instance-identifier "$ProjectName-db" --skip-final-snapshot --region $Region
    Write-Host "✅ RDS Instance deletion initiated (this may take several minutes)" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  RDS Instance not found or already deleted" -ForegroundColor Gray
}

# 6. Delete RDS Subnet Group
Write-Host "🔄 Deleting RDS Subnet Group..." -ForegroundColor Cyan
try {
    aws rds delete-db-subnet-group --db-subnet-group-name "$ProjectName-db-subnet-group" --region $Region
    Write-Host "✅ RDS Subnet Group deleted" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  RDS Subnet Group not found or already deleted" -ForegroundColor Gray
}

# 7. Delete ECR Repository
Write-Host "🔄 Deleting ECR Repository..." -ForegroundColor Cyan
try {
    aws ecr delete-repository --repository-name "$ProjectName-app" --force --region $Region
    Write-Host "✅ ECR Repository deleted" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  ECR Repository not found or already deleted" -ForegroundColor Gray
}

# 8. Delete CloudWatch Log Group
Write-Host "🔄 Deleting CloudWatch Log Group..." -ForegroundColor Cyan
try {
    aws logs delete-log-group --log-group-name "/ecs/$ProjectName-app" --region $Region
    Write-Host "✅ CloudWatch Log Group deleted" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  CloudWatch Log Group not found or already deleted" -ForegroundColor Gray
}

# 9. Delete SSM Parameters
Write-Host "🔄 Deleting SSM Parameters..." -ForegroundColor Cyan
$ssmParams = @(
    "/$ProjectName/db/host",
    "/$ProjectName/db/port", 
    "/$ProjectName/db/name",
    "/$ProjectName/db/username",
    "/$ProjectName/db/password",
    "/$ProjectName/jwt/secret"
)

foreach ($param in $ssmParams) {
    try {
        aws ssm delete-parameter --name $param --region $Region
        Write-Host "✅ SSM Parameter $param deleted" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️  SSM Parameter $param not found" -ForegroundColor Gray
    }
}

# 10. Delete IAM Roles and Policies
Write-Host "🔄 Deleting IAM Roles..." -ForegroundColor Cyan
$roles = @("$ProjectName-ecs-execution-role", "$ProjectName-ecs-task-role")

foreach ($role in $roles) {
    try {
        # Detach managed policies
        $attachedPolicies = aws iam list-attached-role-policies --role-name $role 2>$null | ConvertFrom-Json
        if ($attachedPolicies) {
            foreach ($policy in $attachedPolicies.AttachedPolicies) {
                aws iam detach-role-policy --role-name $role --policy-arn $policy.PolicyArn
            }
        }
        
        # Delete inline policies
        $inlinePolicies = aws iam list-role-policies --role-name $role 2>$null | ConvertFrom-Json
        if ($inlinePolicies) {
            foreach ($policyName in $inlinePolicies.PolicyNames) {
                aws iam delete-role-policy --role-name $role --policy-name $policyName
            }
        }
        
        # Delete role
        aws iam delete-role --role-name $role
        Write-Host "✅ IAM Role $role deleted" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️  IAM Role $role not found" -ForegroundColor Gray
    }
}

# 11. Delete NAT Gateway (this costs money!)
Write-Host "🔄 Deleting NAT Gateway..." -ForegroundColor Cyan
try {
    $natGateways = aws ec2 describe-nat-gateways --filter "Name=tag:Name,Values=$ProjectName-nat-gw" --region $Region 2>$null | ConvertFrom-Json
    if ($natGateways.NatGateways.Count -gt 0) {
        foreach ($natGw in $natGateways.NatGateways) {
            if ($natGw.State -eq "available") {
                aws ec2 delete-nat-gateway --nat-gateway-id $natGw.NatGatewayId --region $Region
                Write-Host "✅ NAT Gateway $($natGw.NatGatewayId) deletion initiated" -ForegroundColor Green
            }
        }
    }
} catch {
    Write-Host "ℹ️  NAT Gateway not found" -ForegroundColor Gray
}

# 12. Release Elastic IPs
Write-Host "🔄 Releasing Elastic IPs..." -ForegroundColor Cyan
try {
    $eips = aws ec2 describe-addresses --filters "Name=tag:Name,Values=$ProjectName-nat-eip" --region $Region 2>$null | ConvertFrom-Json
    if ($eips.Addresses.Count -gt 0) {
        foreach ($eip in $eips.Addresses) {
            aws ec2 release-address --allocation-id $eip.AllocationId --region $Region
            Write-Host "✅ Elastic IP $($eip.AllocationId) released" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "ℹ️  Elastic IPs not found" -ForegroundColor Gray
}

# 13. Delete VPC and related resources
Write-Host "🔄 Deleting VPC resources..." -ForegroundColor Cyan
try {
    $vpcs = aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$ProjectName-vpc" --region $Region 2>$null | ConvertFrom-Json
    if ($vpcs.Vpcs.Count -gt 0) {
        $vpcId = $vpcs.Vpcs[0].VpcId
        
        # Delete Security Groups (except default)
        $securityGroups = aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$vpcId" --region $Region | ConvertFrom-Json
        foreach ($sg in $securityGroups.SecurityGroups) {
            if ($sg.GroupName -ne "default") {
                try {
                    aws ec2 delete-security-group --group-id $sg.GroupId --region $Region
                    Write-Host "✅ Security Group $($sg.GroupId) deleted" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️  Could not delete Security Group $($sg.GroupId)" -ForegroundColor Yellow
                }
            }
        }
        
        # Delete Subnets
        $subnets = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpcId" --region $Region | ConvertFrom-Json
        foreach ($subnet in $subnets.Subnets) {
            aws ec2 delete-subnet --subnet-id $subnet.SubnetId --region $Region
            Write-Host "✅ Subnet $($subnet.SubnetId) deleted" -ForegroundColor Green
        }
        
        # Delete Route Tables (except main)
        $routeTables = aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpcId" --region $Region | ConvertFrom-Json
        foreach ($rt in $routeTables.RouteTables) {
            if ($rt.Associations.Count -eq 0 -or $rt.Associations[0].Main -eq $false) {
                aws ec2 delete-route-table --route-table-id $rt.RouteTableId --region $Region
                Write-Host "✅ Route Table $($rt.RouteTableId) deleted" -ForegroundColor Green
            }
        }
        
        # Delete Internet Gateway
        $igws = aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$vpcId" --region $Region | ConvertFrom-Json
        foreach ($igw in $igws.InternetGateways) {
            aws ec2 detach-internet-gateway --internet-gateway-id $igw.InternetGatewayId --vpc-id $vpcId --region $Region
            aws ec2 delete-internet-gateway --internet-gateway-id $igw.InternetGatewayId --region $Region
            Write-Host "✅ Internet Gateway $($igw.InternetGatewayId) deleted" -ForegroundColor Green
        }
        
        # Delete VPC
        aws ec2 delete-vpc --vpc-id $vpcId --region $Region
        Write-Host "✅ VPC $vpcId deleted" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  VPC resources not found or already deleted" -ForegroundColor Gray
}

# 14. Delete S3 Bucket (if exists)
Write-Host "🔄 Deleting S3 Bucket..." -ForegroundColor Cyan
try {
    $buckets = aws s3api list-buckets | ConvertFrom-Json
    $targetBucket = $buckets.Buckets | Where-Object { $_.Name -like "$ProjectName-terraform-state-*" }
    if ($targetBucket) {
        # Empty bucket first
        aws s3 rm "s3://$($targetBucket.Name)" --recursive
        aws s3api delete-bucket --bucket $targetBucket.Name --region $Region
        Write-Host "✅ S3 Bucket $($targetBucket.Name) deleted" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  S3 Bucket not found" -ForegroundColor Gray
}

# 15. Delete DynamoDB Table
Write-Host "🔄 Deleting DynamoDB Table..." -ForegroundColor Cyan
try {
    aws dynamodb delete-table --table-name "$ProjectName-terraform-locks" --region $Region
    Write-Host "✅ DynamoDB Table deleted" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  DynamoDB Table not found" -ForegroundColor Gray
}

Write-Host "🎉 Cleanup completed!" -ForegroundColor Green
Write-Host "ℹ️  Some resources (like RDS) may take several minutes to fully delete." -ForegroundColor Cyan
Write-Host "💡 You can now run the setup scripts to start fresh." -ForegroundColor Yellow 