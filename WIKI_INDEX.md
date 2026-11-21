# 감바쓰 엔지니어링 위키

감바쓰는 로그인 없이 AI 친구 ‘감자’에게 감정을 털어놓고, 사용자가 고른 메시지를 소각하면서 대화를 삭제하는 웹 앱이다. 이 문서는 코드 사본이 아니라 현재 구조, 데이터의 책임, 주요 신호와 운영 판단을 찾기 위한 색인이다.

현재 완료된 작업의 승인 범위와 검증 기준은 [001 소각 집계와 기능 점검 요구사항](docs/001-소각-집계와-기능-점검/00-request/requirements.md), 화면 점검과 승인 조건별 증거는 [기능 점검 보고서](docs/001-소각-집계와-기능-점검/03-qa/기능-점검.md)를 기준으로 한다.

## 시스템 구조

| 영역 | 책임 | 시작점 |
| --- | --- | --- |
| 웹 | Next.js App Router 기반의 홈, 채팅, 소각 진행, 완료, 기록 화면과 반응형 레이아웃 | [`apps/web/src/app`](apps/web/src/app) |
| 소각 시도 | 선택한 메시지의 식별자·작성자별 순번과 세션을 브라우저에 임시 보관 | [`burnAttempt.ts`](apps/web/src/lib/burnAttempt.ts) |
| 소각 통계 | 현재 브라우저의 누적값과 이미 반영한 시도 ID를 보관하고 화면에 전파 | [`burnStats.ts`](apps/web/src/lib/burnStats.ts) |
| API 서버 | NestJS로 세션, 채팅 SSE, 상태 확인 API 제공 | [`apps/server/src/app.module.ts`](apps/server/src/app.module.ts) |
| 세션 저장소 | Redis에 대화 세션을 600초 TTL로 저장하고, Lua로 삭제와 완료 기록을 원자 처리 | [`session.service.ts`](apps/server/src/session/session.service.ts) |
| AI 연결 | OpenAI 호환 클라이언트로 Groq 모델을 호출하고 시스템 프롬프트를 적용 | [`openai.provider.ts`](apps/server/src/chat/openai.provider.ts) · [`system.txt`](apps/server/src/chat/prompts/system.txt) |
| 공유 계약 | 서버가 사용하는 채팅 메시지와 세션 데이터 타입 | [`packages/types/src/index.ts`](packages/types/src/index.ts) |

웹은 모바일과 데스크톱 UI를 함께 렌더링한다. 공통 데스크톱 골격은 [`WebLayout`](apps/web/src/components/web/WebLayout.tsx), 누적 소각 수를 표시하는 사이드바는 [`WebSidebar`](apps/web/src/components/web/WebSidebar.tsx)에 있다. 채팅 메시지 영역에는 `mobile`과 `desktop` 레이아웃 식별자가 따로 있으며, 각 말풍선은 작성자, 작성자별 순번, 고유 메시지 ID를 노출한다. 이 메타데이터는 선택 의미를 안정적으로 유지하고 자동 QA가 레이아웃별 요소를 구분하는 계약이다.

## 주요 흐름과 신호

### 채팅

1. 브라우저는 저장된 세션 ID가 있으면 서버에서 대화를 복원하고, 없으면 새 세션을 만든다.
2. 메시지는 `POST /api/chat`으로 전송된다. 서버는 세션 유효성을 확인한 뒤 SSE 헤더를 열고 AI 응답을 문장부호 또는 길이 경계에서 나눠 보낸다.
3. 웹은 `data` 이벤트의 `chunk`, `retry`, `[DONE]` 신호를 해석해 말풍선과 입력 중 상태를 갱신한다.
4. 정상 응답만 사용자·감자 메시지로 Redis 세션에 저장되며, 대화가 추가될 때 세션 TTL이 다시 600초가 된다.

### 선택부터 소각 완료까지

1. 사용자 또는 감자의 완료된 말풍선을 길게 누르거나 Enter/Space로 구기면 해당 메시지가 선택된다. 대기 중인 감자 답장은 선택할 수 없다.
2. 확인 시 웹은 새 `burnAttemptId`를 만들고 세션 ID 및 선택 메시지 목록을 `gambass_burn_attempt`에 저장한 뒤 `/trash?burnAttemptId=…`로 이동한다. URL의 ID, 저장된 시도 ID, 현재 세션 ID가 모두 맞아야 소각을 시작한다.
3. 선택한 수만큼 화면 소각이 끝나도 누적값은 아직 바뀌지 않는다. 웹이 `DELETE /api/session`에 `sessionId`와 같은 `burnAttemptId`를 보내고 성공 결과를 기다린다.
4. 서버의 Redis Lua 스크립트는 세션 삭제와 시도 완료 기록을 한 원자 작업으로 처리한다. 결과 신호는 최초 성공 `deleted`, 같은 시도의 재확인 `already_deleted`, 없는 세션 `not_found`, 다른 세션에서 시도 ID를 재사용한 경우 `attempt_conflict`다. 누락된 입력은 컨트롤러에서 `invalid_request`가 된다.
5. 웹은 `deleted` 또는 `already_deleted`만 완료로 인정한다. 그때 선택 수를 한 번만 합산하고 세션 ID와 소각 시도를 정리한 뒤 완료 화면으로 이동한다.
6. 네트워크 오류나 실패 결과에서는 누적값, 세션 ID, 소각 시도를 유지하고 재시도 버튼을 노출한다. 응답만 유실된 경우에도 같은 시도 ID로 재요청하므로 서버와 브라우저 양쪽에서 중복 처리를 막는다.

### 브라우저 통계 전파

누적값은 `gambass_burn_stats`에 `{누적 수, 반영 완료 시도 ID 목록}`의 의미로 저장된다. 저장값이 없거나 JSON이 손상됐거나 누적값이 음수이면 0으로 읽는다. 동일 탭의 완료 처리는 전용 `gambass:burn-stats-changed` 이벤트로, 다른 탭이나 사이트 데이터 변경은 브라우저 `storage` 이벤트로 구독 화면에 전달된다. 사이드바와 소각 완료 화면은 같은 구독 훅을 사용한다.

## 데이터 소유권과 수명

| 데이터 | 저장 위치 | 수명과 삭제 의미 |
| --- | --- | --- |
| 대화 세션 | Redis `session:{sessionId}` | 생성·대화 추가 시 600초 TTL. 승인된 소각 성공 시 즉시 삭제 |
| 삭제 완료 표식 | Redis `session-delete-attempt:{burnAttemptId}` | 값은 세션 ID뿐이며 대화 원문을 담지 않는다. 현재 만료 정책은 없음 |
| 현재 세션 ID | 브라우저 로컬 저장소 | 대화 복원에 사용. 삭제 성공 확인 뒤 제거 |
| 진행 중 소각 시도 | 브라우저 로컬 저장소 | 하나의 시도와 선택 메타데이터를 보관. 삭제 성공 확인 뒤 제거하고 실패 시 유지 |
| 누적 소각 수 | 브라우저 로컬 저장소 | 같은 브라우저 재방문에도 유지. 사이트 데이터를 삭제하면 0으로 초기화 |

누적값은 로그인 계정, 서버 전역 통계, 다른 브라우저나 기기 사이에서 동기화되지 않는다. 직접 구기지 않은 메시지는 집계하지 않는다.

## 핵심 결정과 안전장치

- 집계 단위는 작성자와 관계없이 사용자가 직접 구긴 메시지 한 개다. 화면 애니메이션 완료가 아니라 서버 대화 삭제 성공을 커밋 지점으로 삼는다.
- 멱등성은 두 층이다. Redis 완료 표식은 삭제 성공 응답 유실을 복구하고, 브라우저의 반영 완료 시도 목록은 같은 성공 결과의 UI 재처리를 막는다.
- Redis의 삭제와 완료 표식 기록은 Lua 한 번으로 실행해 중간 상태를 만들지 않는다. 같은 시도 ID가 다른 세션을 삭제하는 것도 거부한다.
- 실패는 복구 가능한 상태다. 삭제 성공을 확인하기 전에는 세션과 소각 시도를 지우거나 누적값을 올리지 않는다.
- 완료 표식에는 대화 원문을 저장하지 않는다. 다만 승인된 보존 기간이 정해지지 않아 현재는 만료 없이 남는 것이 알려진 운영 위험이다.
- 전체 화면 점검에서 찾은 세션 만료·생성 실패 복구, 구긴 선택의 새로고침 정책, 소각 기록, 연속 일수·평균, 자동 소각 시계, 새 쓰레기통, 프로필, 개발 도구 겹침은 후속 후보다. [점검 보고서의 발견 사항](docs/001-소각-집계와-기능-점검/03-qa/기능-점검.md#발견-사항)에 기록돼 있으며 별도 승인 전에는 구현 범위가 아니다.

## 운영과 검증

로컬에서는 저장소 루트에서 고정 잠금 파일로 의존성을 설치하고 Redis를 실행한 뒤 `pnpm dev`로 웹과 API를 함께 시작한다. 웹은 기본 `http://localhost:3000`, API는 `http://localhost:4000/api`, 상태 확인은 `/api/health`다. 서버 환경 변수 예시는 [`apps/server/.env.example`](apps/server/.env.example)에 있으며, 채팅과 소각 요약에는 `OPENAI_API_KEY`와 Groq 호환 주소를 담은 `OPENAI_BASE_URL`이 필요하다. CORS 허용 출처는 `ALLOWED_ORIGINS`, Redis 연결은 `REDIS_URL`로 제어한다.

주요 검증 명령은 다음과 같다.

| 대상 | 명령 | 현재 근거 |
| --- | --- | --- |
| 웹 회귀 | `pnpm --filter web test` | 8개 파일, 69개 테스트 통과 |
| 웹 정적 검사 | `pnpm --filter web lint` | 오류 0개, 기존 경고 122개 |
| 서버 회귀 | `pnpm --filter server test --runInBand` | 5개 스위트, 26개 테스트 통과 |
| 웹 빌드 | `pnpm build:web` | Next.js 정적 페이지 9개 생성 포함 통과 |
| 서버 빌드 | `pnpm build:server` | 통과 |
| 화면 점검 구조 | `node docs/001-소각-집계와-기능-점검/03-qa/validate-report.mjs --mode audit docs/001-소각-집계와-기능-점검/03-qa/기능-점검.md` | 필수 화면 5개, 발견 사항 11개, 링크 검증 통과 |
| 승인 조건 추적 | 위 검증기에 `--mode trace` 사용 | AC-001~AC-010과 증거 링크 검증 통과 |

GitHub Actions는 Redis 7 서비스를 띄우고 `RUN_REDIS_INTEGRATION_TESTS=true`와 `REDIS_TEST_URL`을 설정해 실제 Redis에서 삭제 Lua 통합 테스트를 실행한다. 로컬 환경에 이 플래그가 없으면 해당 스위트는 건너뛴다. CI 구성은 [`.github/workflows/ci.yml`](.github/workflows/ci.yml), Railway 서버 빌드·시작 설정은 [`railway.json`](railway.json)에 있다.

실제 브라우저 QA는 정상 소각, 초기 0, 필수 화면, 직접 진입 차단, 특수문자 누적, 삭제 전 실패 복구, 삭제 성공 응답 유실 복구, 채팅 복귀 후 재소각을 통과했다. 스크린샷과 실행 한계는 [QA 증거](docs/001-소각-집계와-기능-점검/03-qa/evidence/attempt-001)와 [소각 브라우저 검증 기록](docs/001-소각-집계와-기능-점검/03-qa/소각-브라우저-검증.md)에서 확인한다. 모바일 증거는 390 × 844 Chrome 환경이며 실제 휴대전화 검증은 아직 없다.

## 변경 시 찾아볼 곳

- 제품 요구사항·검증 기준: [`requirements.md`](docs/001-소각-집계와-기능-점검/00-request/requirements.md)
- 채팅 선택과 소각 시도 생성: [`chat/page.tsx`](apps/web/src/app/chat/page.tsx)
- 소각 진행, 삭제 대기와 재시도: [`trash/page.tsx`](apps/web/src/app/trash/page.tsx)
- 누적 표시: [`trash-fin/page.tsx`](apps/web/src/app/trash-fin/page.tsx) · [`WebSidebar.tsx`](apps/web/src/components/web/WebSidebar.tsx)
- 서버 삭제 계약과 원자성: [`session.controller.ts`](apps/server/src/session/session.controller.ts) · [`session.service.ts`](apps/server/src/session/session.service.ts)
- Redis 실제 동작 검증: [`session.service.integration.spec.ts`](apps/server/src/session/session.service.integration.spec.ts)
- 디자인 토큰과 사용 규칙: [`tokens.ts`](apps/web/src/design/tokens.ts) · [`guidelines.ts`](apps/web/src/design/guidelines.ts) · 실행 중 `/design-system`
- 승인 조건 추적과 화면 감사: [`기능-점검.md`](docs/001-소각-집계와-기능-점검/03-qa/기능-점검.md)
