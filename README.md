# Vocal Coach Server - 배포 가이드

이 문서는 AWS ECS Fargate와 RDS를 사용한 Vocal Coach 서버의 배포 과정을 설명합니다.

## 🏗️ 인프라 아키텍처

```
Internet → ALB → ECS Fargate → RDS PostgreSQL
              ↓
           CloudWatch Logs
              ↓
        S3 (Terraform State)
```

- **VPC**: 격리된 네트워크 환경
- **ALB**: Application Load Balancer로 트래픽 분산
- **ECS Fargate**: 서버리스 컨테이너 서비스
- **RDS**: 관리형 PostgreSQL 데이터베이스
- **ECR**: Docker 이미지 저장소
- **S3**: Terraform state 저장소
- **DynamoDB**: Terraform state lock

## 🚀 배포 전 준비사항

### 1. AWS 계정 설정

- AWS 계정이 필요합니다
- IAM 사용자 생성 및 필요한 권한 부여

### 2. GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 다음 시크릿을 추가하세요:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_jwt_secret_key
```

### 3. 필요한 IAM 권한

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ec2:*", "ecs:*", "ecr:*", "rds:*", "elasticloadbalancing:*", "iam:*", "ssm:*", "logs:*", "s3:*", "dynamodb:*"],
      "Resource": "*"
    }
  ]
}
```

## 📦 배포 과정

### ⚠️ 중요: 최초 배포 시 S3 백엔드 설정

**첫 번째 배포를 하기 전에** 반드시 S3 백엔드를 설정해야 합니다:

```bash
# 1. 리포지토리 클론
git clone <your-repo-url>
cd vocal-coach-server

# 2. AWS CLI 설정
aws configure

# 3. S3 백엔드 설정 실행
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh
```

이 스크립트는 다음을 수행합니다:

- S3 버킷 생성 (Terraform state 저장용)
- DynamoDB 테이블 생성 (state lock용)
- backend.tf 파일 자동 생성
- 기존 state를 S3로 마이그레이션

### 자동 배포 (권장)

1. S3 백엔드 설정 완료 후 `main` 또는 `master` 브랜치에 코드를 푸시합니다
2. GitHub Actions가 자동으로 실행됩니다:
   - **Pull Request**: Terraform plan 실행 및 PR에 코멘트
   - **Main 브랜치**: 전체 배포 프로세스 실행
     - 코드 린팅
     - Terraform 인프라 배포
     - Docker 이미지 빌드 및 ECR 푸시
     - ECS 서비스 업데이트
     - 헬스체크 및 배포 완료 확인

### 수동 배포

```bash
# 1. Terraform 초기화 (S3 백엔드 사용)
cd terraform
terraform init

# 2. 인프라 배포
terraform plan -var="db_password=your_secure_password" -var="jwt_secret=your_jwt_secret"
terraform apply -var="db_password=your_secure_password" -var="jwt_secret=your_jwt_secret"

# 3. Docker 이미지 빌드 및 푸시
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <ECR_URI>
docker build -t vocal-coach-app .
docker tag vocal-coach-app:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# 4. ECS 서비스 업데이트
aws ecs update-service --cluster vocal-coach-cluster --service vocal-coach-app --force-new-deployment
```

## 🔧 환경 변수

애플리케이션에서 사용하는 환경 변수들은 AWS SSM Parameter Store에 안전하게 저장됩니다:

- `DB_HOST`: RDS 엔드포인트
- `DB_PORT`: 데이터베이스 포트 (5432)
- `DB_NAME`: 데이터베이스 이름
- `DB_USERNAME`: 데이터베이스 사용자명
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `JWT_SECRET`: JWT 토큰 시크릿

## 📊 모니터링

- **CloudWatch Logs**: 애플리케이션 로그 확인
- **ECS Console**: 서비스 상태 모니터링
- **RDS Console**: 데이터베이스 성능 모니터링
- **S3 Console**: Terraform state 파일 확인

## 🔄 CI/CD 파이프라인

### Pull Request 시

- 코드 린팅 실행
- Terraform plan 실행
- Plan 결과를 PR에 코멘트로 표시

### Main 브랜치 푸시 시

- 전체 테스트 및 배포 실행
- 실패 시 자동 롤백
- 성공 시 헬스체크 수행

## 🐛 트러블슈팅

### S3 백엔드 관련 문제

1. **"bucket does not exist" 오류**

   ```bash
   # S3 백엔드 재설정
   ./scripts/setup-backend.sh
   ```

2. **State lock 오류**

   ```bash
   # DynamoDB 테이블 확인
   aws dynamodb describe-table --table-name vocal-coach-terraform-locks

   # 필요시 강제 unlock
   terraform force-unlock <lock-id>
   ```

### 일반적인 문제들

1. **ECS 태스크가 시작되지 않는 경우**

   - CloudWatch 로그에서 에러 확인
   - 보안 그룹 설정 확인
   - IAM 역할 권한 확인

2. **데이터베이스 연결 실패**

   - RDS 보안 그룹 설정 확인
   - SSM Parameter Store 값 확인
   - VPC 설정 확인

3. **GitHub Actions 실패**
   - Secrets 설정 확인
   - AWS 권한 확인
   - Terraform state 상태 확인

### 로그 확인

```bash
# ECS 로그 확인
aws logs get-log-events --log-group-name /ecs/vocal-coach-app --log-stream-name <stream-name>

# Terraform state 확인
terraform state list
terraform state show <resource-name>
```

## 🔄 롤백

문제가 발생한 경우 이전 버전으로 롤백할 수 있습니다:

```bash
# ECS 서비스 롤백
aws ecs update-service --cluster vocal-coach-cluster --service vocal-coach-app --task-definition vocal-coach-app:<previous-revision>

# Terraform 롤백
git checkout <previous-commit>
terraform plan
terraform apply
```

## 💰 비용 최적화

- **db.t3.micro**: 개발/테스트용 최소 비용
- **Fargate**: 사용한 만큼만 과금
- **NAT Gateway**: 필요한 경우에만 사용
- **S3**: state 파일 저장 (최소 비용)

예상 월 비용:

- RDS (db.t3.micro): ~$15
- Fargate (24/7 실행): ~$15
- NAT Gateway: ~$45
- S3 + DynamoDB: ~$5
- 기타 (ALB, CloudWatch 등): ~$15

**총 예상 비용: ~$95/월**

## 🔒 보안 고려사항

- 모든 민감한 정보는 SSM Parameter Store에 암호화 저장
- Terraform state는 S3에 암호화 저장
- RDS는 프라이빗 서브넷에 위치
- 보안 그룹으로 네트워크 접근 제한
- IAM 역할을 통한 최소 권한 원칙 적용

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. GitHub Actions 로그
2. CloudWatch 로그
3. ECS 서비스 이벤트
4. RDS 상태
5. Terraform state 상태

더 자세한 도움이 필요하면 AWS 문서를 참조하거나 이슈를 생성해 주세요.
