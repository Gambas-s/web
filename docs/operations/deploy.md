# 배포 가이드

## 아키텍처 요약

| 앱 | 플랫폼 | 트리거 |
|---|---|---|
| `apps/web` | Vercel | main 푸시 시 자동 (Git 연동) |
| `apps/server` | Railway | CI 통과 후 `cd.yml` 자동 실행 |

## 최초 설정 (1회)

### 1. Railway 토큰 발급

1. [railway.app](https://railway.app) → Account Settings → Tokens
2. **New Token** → 이름: `github-actions-gambass`
3. 발급된 토큰 복사

### 2. GitHub Secret 등록

1. GitHub 레포 → Settings → Secrets and variables → Actions
2. **New repository secret**
   - Name: `RAILWAY_TOKEN`
   - Value: 위에서 복사한 토큰

### 3. Railway 서비스 이름 확인

`cd.yml`의 `railway up --service server`에서 `server` 부분이 Railway 대시보드의 서비스 이름과 일치해야 한다.
서비스 이름이 다르면 `cd.yml`의 `--service` 값을 수정한다.

## 배포 흐름

```
PR → develop 머지
  ↓
main 머지
  ↓
CI (lint/test/build) — ci.yml
  ↓ 성공 시
CD (railway up) — cd.yml
  ↓
Vercel (web 자동 배포) — Git 연동
```

## 배포 확인

- **server**: GitHub Actions 탭 → CD 워크플로우 실행 결과
- **web**: Vercel 대시보드 또는 PR Preview URL
