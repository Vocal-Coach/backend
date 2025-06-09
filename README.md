# Vocal Coach Server - 배포 가이드

이 문서는 AWS ECS Fargate와 RDS를 사용한 Vocal Coach 서버의 배포 과정을 설명합니다.

## 🏗️ 인프라 아키텍처

```
Internet → ALB → ECS Fargate → RDS PostgreSQL
              ↓
           CloudWatch Logs
```

- **VPC**: 격리된 네트워크 환경
- **ALB**: Application Load Balancer로 트래픽 분산
- **ECS Fargate**: 서버리스 컨테이너 서비스
- **RDS**: 관리형 PostgreSQL 데이터베이스
- **ECR**: Docker 이미지 저장소

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
```

### 3. 필요한 IAM 권한

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ec2:*", "ecs:*", "ecr:*", "rds:*", "elasticloadbalancing:*", "iam:*", "ssm:*", "logs:*"],
      "Resource": "*"
    }
  ]
}
```

## 📦 배포 과정

### 자동 배포 (권장)

1. `main` 또는 `master` 브랜치에 코드를 푸시합니다
2. GitHub Actions가 자동으로 실행됩니다:
   - 코드 테스트 및 린팅
   - Docker 이미지 빌드
   - Terraform 인프라 배포
   - ECS 서비스 업데이트

### 수동 배포

```bash
# 1. Terraform 초기화
cd terraform
terraform init

# 2. 인프라 배포
terraform plan -var="db_password=your_secure_password"
terraform apply -var="db_password=your_secure_password"

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

## 📊 모니터링

- **CloudWatch Logs**: 애플리케이션 로그 확인
- **ECS Console**: 서비스 상태 모니터링
- **RDS Console**: 데이터베이스 성능 모니터링

## 🐛 트러블슈팅

### 일반적인 문제들

1. **ECS 태스크가 시작되지 않는 경우**

   - CloudWatch 로그에서 에러 확인
   - 보안 그룹 설정 확인
   - IAM 역할 권한 확인

2. **데이터베이스 연결 실패**

   - RDS 보안 그룹 설정 확인
   - SSM Parameter Store 값 확인
   - VPC 설정 확인

3. **ALB Health Check 실패**
   - 애플리케이션이 포트 3000에서 실행되는지 확인
   - Health check 경로 확인 (`/`)

### 로그 확인

```bash
# ECS 로그 확인
aws logs get-log-events --log-group-name /ecs/vocal-coach-app --log-stream-name <stream-name>

# RDS 로그 확인
aws rds describe-db-log-files --db-instance-identifier vocal-coach-db
```

## 🔄 롤백

문제가 발생한 경우 이전 버전으로 롤백할 수 있습니다:

```bash
# 이전 태스크 정의로 롤백
aws ecs update-service --cluster vocal-coach-cluster --service vocal-coach-app --task-definition vocal-coach-app:<previous-revision>
```

## 💰 비용 최적화

- **db.t3.micro**: 개발/테스트용 최소 비용
- **Fargate**: 사용한 만큼만 과금
- **NAT Gateway**: 필요한 경우에만 사용

예상 월 비용:

- RDS (db.t3.micro): ~$15
- Fargate (24/7 실행): ~$15
- NAT Gateway: ~$45
- 기타 (ALB, CloudWatch 등): ~$15

**총 예상 비용: ~$90/월**

## 🔒 보안 고려사항

- 모든 민감한 정보는 SSM Parameter Store에 암호화 저장
- RDS는 프라이빗 서브넷에 위치
- 보안 그룹으로 네트워크 접근 제한
- IAM 역할을 통한 최소 권한 원칙 적용

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. GitHub Actions 로그
2. CloudWatch 로그
3. ECS 서비스 이벤트
4. RDS 상태

더 자세한 도움이 필요하면 AWS 문서를 참조하거나 이슈를 생성해 주세요.
