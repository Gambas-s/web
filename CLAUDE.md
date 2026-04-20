# Project: 감바쓰: 나쁜 감정은 쓰레기통으로!

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 절대 규칙

- 환경변수(`OPENAI_API_KEY`, `REDIS_URL` 등)를 코드에 하드코딩하지 않는다.

## 관련 문서

- 디자인 관련 작업 시 @apps/web/DESIGN.md 를 참고한다.
- 프로그래밍 시 @AGENTS.md 를 항상 읽고 해당 순서대로 진행한다.

## 코딩 컨벤션

- **언어:** TypeScript strict mode (frontend & backend 모두)
- **네이밍:** camelCase (변수/함수), PascalCase (클래스/컴포넌트), UPPER_SNAKE_CASE (환경변수)
- **커밋:** `feat:`, `fix:`, `chore:`, `refactor:` prefix 사용 (Conventional Commits)
- **패턴:**
  - NestJS: 모듈 단위 분리 (`chat`, `session`, `health`), Controller → Service 계층 유지
  - Next.js: App Router 사용, 훅은 `src/hooks/` 에 분리 (`useSession`, `useSSE`, `usePostItState`)
  - 공유 타입은 `packages/types/src/index.ts` 에 정의, `@gambass/types` 로 import

## 아키텍처

### 폴더 구조

```
gambass/
├── apps/
│   ├── web/                      # Next.js 15 (Vercel 배포)
│   │   └── src/
│   │       ├── app/              # App Router (page.tsx, layout.tsx)
│   │       │   └── design-system/  # GET /design-system — 시각적 디자인 레퍼런스
│   │       ├── design/           # tokens.ts (색상·폰트), guidelines.ts (사용 규칙)
│   │       └── hooks/            # useSession, useSSE, usePostItState
│   └── server/                   # NestJS (Railway 배포)
│       └── src/
│           ├── chat/             # POST /api/chat — SSE 스트리밍
│           ├── session/          # GET /api/session/check, DELETE /api/session
│           ├── health/           # GET /api/health
│           └── main.ts
└── packages/
    └── types/                    # @gambass/types — 공유 TypeScript 타입
```

### 기술 스택

| 레이어 | 기술 |
|---|---|
| Frontend | Next.js 15, Framer Motion, Tailwind CSS |
| Backend | NestJS 10, Node.js 20.x |
| Session | Redis (Upstash) — key: `session:{sessionId}`, TTL 600초 |
| AI | OpenAI GPT-4o-mini, SSE 스트리밍 |
| 통신 | Server-Sent Events — 문장 끝(`/[.!?\n]/`) 또는 50자 강제 절단 후 전송 |
| 모노레포 | pnpm workspaces |

## 빌드/테스트

```bash
# 전체 의존성 설치 (루트에서)
pnpm install

# 개발 서버
pnpm --filter server start:dev   # NestJS  → http://localhost:4000/api
pnpm --filter web dev            # Next.js → http://localhost:3000

# 프로덕션 빌드
pnpm --filter server build
pnpm --filter web build

# 헬스체크 (백엔드 동작 확인)
curl http://localhost:4000/api/health

# SSE 스트림 테스트 (OPENAI_API_KEY 필요)
curl -N -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","message":"스트레스 받아"}'
```
