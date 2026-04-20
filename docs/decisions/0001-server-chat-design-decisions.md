# ADR-0001: Server Chat 설계 결정사항

**날짜:** 2026-04-20  
**상태:** Accepted  
**관련 스펙:** `docs/superpowers/specs/2026-04-20-server-chat-design.md`

---

## 결정 1: 세션 ID 발급 방식 — 서버 발급 (Option B)

**선택지:**
- A) 클라이언트가 UUID 생성해서 body에 담아 전송
- B) 서버가 `/api/session` 호출 시 UUID 발급 ✅
- C) httpOnly 쿠키로 세션 관리

**선택 이유:**  
서버가 세션 발급권을 갖기 때문에, AI 사용량이 과도할 때 서버에서 직접 세션을 차단/삭제할 수 있다. Redis에서 `session:{id}` 키를 삭제하거나 `DELETE /api/session`으로 일괄 정리가 가능해 운영자가 완전히 통제할 수 있다.  
C(쿠키)는 Vercel↔Railway 크로스 도메인 환경에서 `SameSite` 이슈가 있어 제외.

---

## 결정 2: Redis 채팅 기록 포맷 — JSON 배열 (Option A)

**선택지:**
- A) `session:{id}` → `{ createdAt, messages: [{role, content, timestamp}] }` JSON ✅
- B) `session:{id}:messages` (List) + `session:{id}:meta` (Hash) 분리 저장
- C) `"user: ...\nai: ...\n"` 직렬화 문자열

**선택 이유:**  
GPT API가 `messages: [{role, content}]` 형태를 그대로 받으므로 변환 코드가 필요 없다. B는 오버엔지니어링, C는 파싱 버그 위험이 있다.

---

## 결정 3: 콘텐츠 검증 — OpenAI Moderation API (Option A)

**선택지:**
- A) OpenAI Moderation API (GPT 호출 전 별도 체크) ✅
- B) 시스템 프롬프트에 위임
- C) 키워드 정규식 필터

**선택 이유:**  
무료이고, GPT 호출 전에 먼저 체크하면 flagged 메시지에 대한 토큰 낭비가 없다.

---

## 결정 4: SSE 청킹 문장 끝 패턴 — 한국어 포함 확장 (Option B)

**선택지:**
- A) `/[.!?\n]/` 영문 기준만
- B) `/[.!?\n。？！]/` 한중일 문장부호 포함 ✅
- C) 50자 강제절단만

**선택 이유:**  
한국어 응답에서 `.`은 잘 쓰이지 않기 때문에 Option A만으로는 청킹이 거의 안 된다. 한중일 문장부호를 추가하면 자연스러운 문장 단위 전송이 가능하다. 50자 강제절단은 보조 수단으로 유지.

---

## 결정 5: 아키텍처 — SessionModule + ChatModule 분리 (Option A)

**선택지:**
- A) SessionModule + ChatModule 두 개로 분리 ✅
- B) ChatModule 하나에 세션 로직 포함
- C) WebSocket Gateway 패턴

**선택 이유:**  
세션과 채팅의 책임을 분리해야 `GET /api/session/check`, `DELETE /api/session` 같은 독립 엔드포인트를 자연스럽게 유지할 수 있다. C(WebSocket)는 이미 SSE로 확정된 스펙이라 오버엔지니어링.
