# AWS 리소스 정리 가이드

기존 AWS 리소스들이 충돌하는 경우 이 스크립트를 사용하여 모든 리소스를 안전하게 정리할 수 있습니다.

## 🚨 주의사항

- **이 스크립트는 vocal-coach 프로젝트의 모든 AWS 리소스를 삭제합니다**
- 실행하기 전에 AWS 계정에 다른 중요한 리소스가 없는지 확인하세요
- RDS 인스턴스는 삭제하는 데 시간이 걸릴 수 있습니다 (최대 10-15분)

## 📋 사전 준비

1. AWS CLI가 설치되어 있어야 합니다
2. AWS 자격 증명이 설정되어 있어야 합니다
3. 적절한 권한이 있어야 합니다 (Admin 권한 권장)

## 🏃‍♂️ 실행 방법

### Windows (PowerShell)

```powershell
# PowerShell 실행 정책 설정 (필요한 경우)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 스크립트 실행
.\scripts\cleanup-aws.ps1
```

### Linux/macOS (Bash)

```bash
# 실행 권한 부여
chmod +x scripts/cleanup-aws.sh

# 스크립트 실행
./scripts/cleanup-aws.sh
```

## 🔄 정리 후 다시 시작

모든 리소스가 정리된 후:

1. **Terraform 상태 파일 정리**:

   ```bash
   rm -rf terraform/.terraform*
   rm -f terraform/terraform.tfstate*
   ```

2. **백엔드 설정 및 배포**:

   ```bash
   # Windows
   .\scripts\setup-backend.ps1

   # Linux/macOS
   ./scripts/setup-backend.sh
   ```

## 📊 정리되는 리소스 목록

- ✅ ECS 서비스 및 클러스터
- ✅ Application Load Balancer
- ✅ Target Group
- ✅ RDS 인스턴스 및 서브넷 그룹
- ✅ ECR 리포지토리
- ✅ CloudWatch 로그 그룹
- ✅ SSM 파라미터들
- ✅ IAM 역할 및 정책
- ✅ NAT Gateway
- ✅ Elastic IP
- ✅ VPC 및 관련 네트워킹 리소스
- ✅ S3 버킷 (Terraform state)
- ✅ DynamoDB 테이블 (Terraform locks)

## 🔍 문제 해결

### 스크립트가 실행되지 않는 경우

1. AWS CLI가 올바르게 설치되어 있는지 확인
2. AWS 자격 증명이 올바르게 설정되어 있는지 확인
3. 필요한 권한이 있는지 확인

### 일부 리소스가 삭제되지 않는 경우

1. AWS 콘솔에서 수동으로 확인
2. 의존성 때문에 삭제되지 않은 리소스는 수동으로 삭제
3. 몇 분 후 다시 스크립트 실행

### 비용 절약 팁

- NAT Gateway와 Elastic IP는 비용이 발생하므로 빠르게 정리됩니다
- RDS 인스턴스 삭제 시 final snapshot을 생성하지 않습니다 (개발 환경용)

## 💡 추가 정보

- 스크립트는 에러가 발생해도 계속 진행됩니다
- 찾을 수 없는 리소스는 안전하게 무시됩니다
- 모든 삭제 작업은 롤백할 수 없으니 신중하게 진행하세요
