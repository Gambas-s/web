# ADR-0002: CD 파이프라인 설계 결정사항

**날짜:** 2026-04-20
**상태:** Accepted
**관련 스펙:** `docs/superpowers/specs/2026-04-20-cd-pipeline-design.md`
**관련 이슈:** #17

---

## 결정 1: 트리거 방식 — `workflow_run` (CI 선행 필수)

`main` 머지 시 CD는 CI 워크플로우가 성공한 경우에만 실행한다.

**선택지:**
- A) `ci.yml`에 deploy job 추가 (`needs: ci` + branch 조건)
- **B) 별도 `cd.yml` + `workflow_run` 트리거** ← 채택
- C) main push 직접 트리거 (CI와 독립)

**이유:** CI/CD 관심사 분리. CI 수정이 CD에 영향 없음. 테스트 실패 코드가 프로덕션에 배포되는 것 방지.

---

## 결정 2: Railway 배포 방식 — GitHub Actions에서 Railway CLI

GitHub Actions 워크플로우에서 Railway CLI(`railway up`)로 직접 배포한다.

**선택지:**
- A) Railway GitHub 자동 연동 (push 감지)
- **B) GitHub Actions에서 Railway CLI 실행** ← 채택
- C) Railway 공식 GitHub Action (`railwayapp/railway-deploy`)

**이유:** 배포 성공/실패를 CI 파이프라인 안에서 확인 가능. Railway 자동 연동은 배포 결과를 GitHub에서 볼 수 없음.

---

## 결정 3: Vercel 배포 방식 — Git 자동 연동 유지

web(`apps/web`)은 Vercel Git 연동으로 `main` push 시 자동 배포한다. GitHub Actions에서 별도 처리 없음.

**이유:** Vercel Git 연동이 더 안정적이고, PR마다 Preview URL 자동 생성 등 부가 기능 활용 가능. Actions에서 Vercel CLI를 쓰는 것은 이점 없음.

---

## 결정 4: 환경 — 프로덕션 단일

스테이징 환경 없이 프로덕션만 운영한다.

**이유:** 현재 규모에서 스테이징 환경 관리 비용 대비 효용이 낮음.
