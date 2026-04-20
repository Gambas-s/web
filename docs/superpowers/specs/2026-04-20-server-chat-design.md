# Server Chat 설계 문서

**날짜:** 2026-04-20  
**범위:** NestJS 서버 — SessionModule + ChatModule 구현

---

## 1. 개요

감바쓰 백엔드에 실시간 LLM 채팅 기능을 추가한다. 서버가 세션을 발급하고, SSE(Server-Sent Events)로 GPT-4o-mini 응답을 문장 단위로 스트리밍한다.

---

## 2. 모듈 구조

```
apps/server/src/
├── session/
│   ├── session.module.ts
│   ├── session.controller.ts   POST /session, GET /session/check, DELETE /session
│   └── session.service.ts      Redis CRUD, TTL 600s
├── chat/
│   ├── chat.module.ts
│   ├── chat.controller.ts      POST /chat (SSE)
│   ├── chat.service.ts         Moderation → OpenAI → Chunking → SSE emit
│   └── chat.dto.ts             ChatRequestDto { sessionId, message }
└── app.module.ts               SessionModule, ChatModule 등록
```

### 공유 타입 (packages/types/src/index.ts)

```ts
export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  role: MessageRole
  content: string
  timestamp: number
}

export interface SessionData {
  createdAt: number
  messages: ChatMessage[]
}
```

---

## 3. API 엔드포인트

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/api/session` | 세션 발급 → `{ sessionId }` 반환 |
| `GET` | `/api/session/check` | 세션 유효성 확인 → `{ valid: boolean }` |
| `DELETE` | `/api/session` | 소각: 요약 로그 후 Redis 삭제 |
| `POST` | `/api/chat` | SSE 스트리밍 채팅 |

---

## 4. 세션 설계

- 서버가 UUID v4 발급
- Redis key: `session:{sessionId}`
- Value: `SessionData` JSON 직렬화
- TTL: 600초 (요청마다 갱신)
- 발급 시점에 Redis에 빈 messages 배열로 초기화

---

## 5. 채팅 데이터 흐름

```
POST /api/chat { sessionId, message }
  1. SessionService.validate(sessionId)       → 없으면 401
  2. OpenAI Moderation API (message)          → flagged면 경고 SSE emit 후 종료
  3. Redis에서 SessionData 로드
  4. OpenAI ChatCompletion (stream: true, max_tokens: 150)
       system prompt: "거칠고 재치있는 친구처럼 2~3문장 이내로 짧게 대답"
  5. 스트림 수신 → 버퍼링
       → /[.!?\n。？！]/ 매칭 OR 버퍼 50자 이상 → SSE data: {chunk} emit
  6. 완료 후 user/assistant 메시지 Redis 저장, TTL 600s 갱신
  7. SSE done 이벤트 emit
```

### SSE 이벤트 포맷

```
data: {"chunk": "야 그거 진짜 힘들었겠다."}

data: {"chunk": " 근데 솔직히 말하면"}

data: [DONE]
```

---

## 6. 소각 (DELETE /api/session)

```
1. Redis에서 messages 로드
2. OpenAI로 한 줄 요약 생성 → 서버 로그에만 기록
3. Redis DEL session:{sessionId}
```

---

## 7. 에러 처리

| 상황 | 처리 |
|---|---|
| sessionId 없음/만료 | 401 반환, SSE 미진입 |
| Moderation flagged | SSE로 경고 메시지 전송 후 종료, Redis 저장 안 함 |
| OpenAI timeout/에러 | SSE로 fallback 메시지 전송 |
| Rate limit 초과 (Throttler 429) | SSE 미진입 |
| Redis 연결 실패 | 500, 서버 로그 |

### Fallback 메시지 예시

- Moderation: `"야 그런 말은 좀..."`
- OpenAI 에러: `"아 쏘리 나 잠깐 딴 생각함. 다시 말해줄래?"`

---

## 8. 테스트 전략

- **SessionService 유닛**: Redis mock — 생성/조회/삭제/만료 시나리오
- **ChatService 유닛**: OpenAI SDK mock, Moderation mock
  - 정상 스트림 → 청킹 검증
  - Moderation flagged → 경고 메시지 확인
  - OpenAI 에러 → fallback 메시지 확인
- **ChatController e2e**: SSE 응답 헤더(`text/event-stream`) + 이벤트 포맷 확인

---

## 9. 환경변수

```
OPENAI_API_KEY=
REDIS_URL=
ALLOWED_ORIGINS=http://localhost:3000
```
