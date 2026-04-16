# Project: 감바쓰: 나쁜 감정은 쓰레기통으로!

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 절대 규칙

- 환경변수(`OPENAI_API_KEY`, `REDIS_URL` 등)를 코드에 하드코딩하지 않는다.

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

**환경변수**

`apps/server/.env` (`.env.example` 참고):
```
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000
PORT=4000
```

`apps/web/.env.local` (`.env.local.example` 참고):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 도메인 컨텍스트

- **감바쓰:** "감정 배설" 서비스. 로그인 없이 익명으로 AI 친구에게 스트레스를 털어놓는 서비스.
- **포스트잇:** 채팅창 UI 단위. Framer Motion으로 드래그 가능, 쓰레기통에 드롭하면 세션 삭제.
- **쓰레기통 비우기:** 세션 완전 삭제 액션 → `DELETE /api/session` → Redis hard delete → 랜딩 복귀.
- **이모지 토큰:** AI 응답 내 `:angry:` 형식 토큰을 `public/images/emojis/*.png` 로 클라이언트에서 치환.
- **페르소나:** 거친 말투의 친구. 부적절한 요청엔 "나 바쁘니까 나중에 해"로 거절.
- **세션 복구:** 탭 재접속 시 `sessionStorage` 저장값 + `GET /api/session/check` 로 유효성 검증 후 복구.
- **슬라이딩 세션:** 메시지 전송마다 Redis TTL 600초 갱신 (`SessionService.appendMessage`).
