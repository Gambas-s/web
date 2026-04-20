# CD 파이프라인 설계

**날짜:** 2026-04-20
**범위:** GitHub Actions CD 워크플로우 (`cd.yml`) 추가

---

## 목표

`main` 브랜치 머지 시, CI 통과 후 자동으로 프로덕션 배포가 이루어지도록 한다.

---

## 아키텍처

### 트리거

- `workflow_run` 이벤트 — `CI` 워크플로우가 `main` 브랜치에서 `completed` 상태가 되면 실행
- CI가 실패한 경우 CD는 실행하지 않음 (`conclusion == 'success'` 조건)

### 배포 대상

| 앱 | 플랫폼 | 방식 |
|---|---|---|
| `apps/web` | Vercel | Git 자동 연동 (Actions 불필요) |
| `apps/server` | Railway | GitHub Actions에서 Railway CLI 실행 |

### 워크플로우 구조

```
cd.yml
└── on: workflow_run (CI / main / completed)
    └── job: deploy-server
        ├── if: github.event.workflow_run.conclusion == 'success'
        ├── actions/checkout@v4
        ├── pnpm/action-setup@v4
        ├── setup-node@v4
        ├── pnpm install --frozen-lockfile
        └── railway up (RAILWAY_TOKEN secret)
```

---

## GitHub Secrets 요구사항

| Secret | 용도 |
|---|---|
| `RAILWAY_TOKEN` | Railway 프로젝트 배포 인증 |

Railway 대시보드 → Account Settings → Tokens에서 발급.

---

## 제외 범위

- 스테이징 환경 없음 (프로덕션만)
- Vercel 배포 상태 확인 없음 (Vercel 대시보드에서 직접 확인)
- 슬랙/Discord 알림 없음

---

## 결정 사항

1. **CI 선행 필수** — `workflow_run`으로 CI 성공 후에만 CD 실행. 테스트 실패한 코드가 배포되는 것을 방지.
2. **Vercel은 Git 연동** — Actions에서 Vercel CLI를 쓰지 않음. Vercel의 자동 배포가 더 안정적이고 Preview URL 등 부가 기능 활용 가능.
3. **별도 `cd.yml`** — `ci.yml`과 관심사 분리. CI 수정이 CD에 영향 없음.
