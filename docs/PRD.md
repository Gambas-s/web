# 📄 PRD: 감바쓰 (Gambass) - v1.0 (Web MVP)

## 1. Executive Summary & Context

- **The 'Why'**: 현재 시장의 대화형 AI는 철저히 '생산성'과 '무해함(Helpful & Harmless)'에 초점이 맞춰져 있습니다. 이로 인해 유저는 자신의 날것 그대로의 감정을 해소할 안전하고 즉각적인 디지털 공간을 잃었습니다.
- **Product Vision**: '감바쓰'는 설치나 로그인 없이 링크 클릭 한 번으로 진입하여, 타인의 눈치를 보지 않고 부정적인 감정을 즉각 배설(Venting)하고 완벽히 지워버리는 **휘발성 웹 감정 쓰레기통**입니다. 1020 친구 같은 페르소나를 통해 극강의 공감대와 심리적 안정감을 제공합니다.
- **Platform**: Responsive Web (Mobile First, Desktop Supported)

## 2. Goals & Guardrail Metrics

- **Primary KPI (성공 지표)**
    - **Session Completion Rate**: 세션 시작 대비 `[쓰레기통 비우기]` 버튼 클릭으로 정상 종료된 세션의 비율 (목표: 70% 이상).
- **Counter-metrics (가드레일 지표 - 모니터링 필수)**
    - **API Cost per Session**: 오픈 웹 특성상 악의적인 트래픽 공격에 취약하므로, 세션당 토큰 발생 비용 및 IP당 호출 횟수 모니터링 필수.
    - **Bounce Rate**: 랜딩 페이지 접속 후 대화를 시작하지 않고 이탈하는 비율 (목표: 30% 미만 유지).

## 3. User Stories with Acceptance Criteria (AC)

### Story 1: 날것의 공감대 형성 (Persona)

- **As a** 스트레스받은 유저, **I want to** 내 상황에 욕설과 은어를 섞어 격하게 공감해 주는 봇과 대화하고 싶다. **So that** 내 편이 있다는 위안을 얻고 스트레스를 풀 수 있다.
- **AC 1**: 봇의 응답에는 AI 특유의 정중한 어투(예: "도와드릴 수 있어 기쁩니다")가 **절대** 포함되지 않아야 한다.
- **AC 2**: 봇은 유저의 감정선에 맞춰 적절한 수준의 이모티콘(png, 글자 이모지아님)와 비속어(예: 미친거아니야?, 와 개열받네 등)를 사용한다.

### Story 2: 리얼타임 메신저 UX (Chunking & Responsive UI)

- **As a** 유저, **I want to** 모바일/데스크탑 어디서든 봇이 사람처럼 문장을 끊어 보내고 타이핑 중인 상태를 보고 싶다. **So that** 진짜 친구와 메신저를 하는 듯한 몰입감을 느낄 수 있다.
- **AC 1**: 봇 응답 시 문장 기호(`.`, `?`, `!`, `\n`)를 기준으로 응답을 분할(Chunking)하여 클라이언트에 순차 렌더링해야 한다.
- **AC 2**: 메시지 조각(Chunk) 사이에는 딜레이(예: 0.5초~1.5초)와 함께 `...` 입력 중인 애니메이션이 노출되어야 한다.
- **AC 3**: 뷰포트(Viewport) 크기에 따라 모바일은 Full-screen 챗봇 뷰, 데스크탑은 중앙 정렬된 모바일 컨테이너 뷰(Max-width: 600px)로 렌더링되어야 한다.

### Story 3: 완벽한 휘발과 초기화 (Stateless)

- **As a** 감정 해소를 마친 유저, **I want to** `[쓰레기통 비우기]` 버튼을 눌러 대화를 완전히 삭제하고 싶다. **So that** 내 흑역사가 어디에도 남지 않았다는 안도감을 얻을 수 있다.
- **AC 1**: 해당 버튼 클릭 시 현재 Session 데이터가 DB 및 Browser Storage(SessionStorage 등)에서 영구 삭제(Hard Delete) 되어야 한다.
- **AC 2**: 화면에 쓰레기통 비우기 애니메이션이 실행된 후, '초기 홈 화면'으로 라우팅 되어야 한다.

### Story 4: 브라우저 이탈 대응 (Tab Close/Refresh)

- **As a** 대화 중인 유저, **I want to** 창을 실수로 새로고침 하더라도 대화가 유지되길 원하며, 창을 아예 닫았을 때는 데이터가 안전하게 파기되길 원한다.
- **AC 1**: 브라우저 '새로고침(Refresh)' 시 SessionStorage에 저장된 Session ID를 기반으로 대화 내역을 복구해야 한다.
- **AC 2**: 브라우저 탭을 완전히 닫거나(Unload), 일정 시간(예: 10분) 이상 상호작용이 없으면 서버 단에서 해당 세션 데이터를 자동 파기(TTL Expiration)해야 한다.

### Story 5: 시각적 카타르시스와 직관적 진입 (Interactive Landing)

- **As a** 감정을 해소하러 온 유저, **I want to** 흩어진 포스트잇을 쓰레기통에 직접 드래그해서 버리는 행동으로 대화를 시작하고 싶다. **So that** 내 복잡한 마음을 버린다는 느낌을 직관적으로 받고, 종료 후 포스트잇이 사라진 빈 자리를 보며 확실한 후련함을 느낄 수 있다.
- **AC 1**: 랜딩 화면은 Top-down(180도 항공샷) 시점이며, 중앙의 쓰레기통과 주변을 덮고 있는 포스트잇들로 구성되어야 한다.
- **AC 2**: 유저가 포스트잇을 쓰레기통 영역으로 드래그 앤 드롭(Drag & Drop)하면, "여기에 버릴까요?"라는 확인 모달/툴팁이 노출되어야 한다.
- **AC 3**: 채팅 세션 종료([쓰레기통 비우기] 클릭) 후 랜딩 페이지로 돌아오면, 유저가 선택했던 포스트잇이 종이처럼 꾸깃꾸깃 구겨져 쓰레기통 안으로 통통 튕겨 들어가는 애니메이션이 실행되어야 한다.
- **AC 4**: 애니메이션 완료 후, 해당 포스트잇이 있던 자리는 빈 공간으로 남아있어야 한다. (재접속 전까지 빈 공간 유지)

## 4. Functional & Data Requirements

### Architecture & Logic

- **Client**: React / Next.js (가벼운 뷰 렌더링 및 SSE 스트리밍 수신).
- **Gateway/Proxy API (Server)**: Node.js 또는 Python 기반의 BFF(Backend for Frontend). 클라이언트가 LLM API 키를 직접 알지 못하게 은닉하고, 프롬프트 주입을 방어하며, SSE(Server-Sent Events) 스트림을 클라이언트로 쏴주는 역할을 수행한다.
- **Database**: **Redis** (In-Memory DB). 완벽한 휘발성과 빠른 I/O를 위해 RDBMS 대신 Redis를 채택하여 Session ID 기반으로 대화 컨텍스트를 임시 캐싱한다.

### MoSCoW Prioritization

- **Must Have**:
    - 1020 친구 페르소나 (System Prompt Tuning)
    - Proxy Server 연동 및 SSE 기반 메시지 청킹(Chunking)
    - `[쓰레기통 비우기]` 및 TTL 기반 Redis Hard Delete 로직
    - IP 또는 Fingerprint 기반 Rate Limiting (Abuse 방지)
- **Should Have**:
    - 반응형 웹 UI (Mobile / Desktop)
    - T&S 필터링 로직 (프롬프트 내 제약 조건으로 1차 방어)
- **Could Have**:
    - PWA(Progressive Web App) 세팅 (홈 화면 추가 유도)
- **Won't Have (v1.0)**:
    - 회원가입/로그인(완전 익명 보장), 다중 페르소나 선택.

## 5. User Experience & Edge Cases

### Landing & Session Flow (랜딩 및 상호작용 흐름)

1. **Desk View (초기 진입)**:
    - 화면 가득 무작위로 흩어져 있는 포스트잇들. 복잡하고 스트레스받는 유저의 현재 감정 상태를 은유한다.
    - 정중앙에는 비워낼 준비가 된 '쓰레기통'이 위치한다.

2. **Drag & Drop (의도 확인)**:
    - 마우스(또는 터치)로 포스트잇 하나를 집어 쓰레기통으로 끌어다 놓는다.
    - 드롭 시 쓰레기통이 살짝 반응(Hover 애니메이션)하며, [여기에 버릴까요? - 버리겠습니다] 팝업이 뜬다.

3. **Chat Transition (대화 몰입)**:
    - 버리겠습니다 클릭 시, 쓰레기통으로 카메라가 줌인(Zoom-in) 되거나 부드러운 화면 전환을 통해 리얼타임 메신저 뷰(Chat UI)로 진입한다.

4. **Closing Animation (영구 삭제와 카타르시스)**:
    - 대화 종료 후 [쓰레기통 비우기] 버튼 클릭 시, 서버의 데이터는 즉각 파기되며 화면은 다시 랜딩 페이지(180도 Desk View)로 라우팅 된다.
    - 핵심 연출: 방금 유저가 대화 진입 시 선택했던 그 포스트잇이 꾸깃꾸깃 구겨지는 효과와 함께 쓰레기통 안으로 쏙 들어간다.

5. **Visual Relief (비워짐의 확인)**:
    - 애니메이션이 끝난 후 전체 책상을 다시 보면, 내가 버린 포스트잇의 자리만 텅 비어있다. 시각적으로 '내 감정을 성공적으로 비워냈다'는 완결성을 제공한다.

### Edge Cases & Handling
    - **네트워크 단절**: 스트리밍 중 오프라인 전환 시, `[네트워크 연결이 불안정합니다. 다시 시도 중...]` 토스트 띄우고, 재연결 시 마지막 세션 상태 복구.
    - **LLM API Timeout/에러**: "아 쏘리 나 잠깐 딴 생각함. 다시 말해줄래?"와 같은 Fallback 텍스트 렌더링으로 에러 마스킹.
    - **Rate Limit 초과 (어뷰징 감지)**: "헉 나 잠깐 일 있어서 nn분만 잇다가 다시 답장할게!" 전송 후 안 읽음 표시가 나타난다. 실제 채팅처럼

## 6. Technical Considerations
- **Prompt Tuning & Max Tokens**: 봇의 답변이 길어지면 '설교'처럼 느껴지고 비용이 낭비된다. System Prompt에 `"반드시 2~3문장 이내로 짧게 대답할 것"`을 강제하고, API 호출 시 `max_tokens`를 150 내외로 제한하여 리소스 효율성을 극대화한다.
- **Chunking Algorithm (SSE)**: 서버에서 LLM 응답을 스트리밍으로 받으면서 정규식(`/[.!?\n]/`) 매칭을 검사한다. 문장이 완성될 때마다 버퍼를 비워 클라이언트로 Chunk Event를 Emit 한다.
- **보안 (CORS & Rate Limit)**: 허용된 도메인(웹 클라이언트 URL)에서만 Proxy API를 호출할 수 있도록 CORS 정책을 엄격하게 설정한다. Nginx 또는 API Gateway 단에서 IP 당 분당 요청 수를 제한하여 요금 폭탄(DDoS, 크롤링)을 방어한다.
- **Animation Library**: 포스트잇의 자연스러운 드래그 앤 드롭, 종이가 구겨지는 3D/2D 모션, 쓰레기통으로 튕겨 들어가는 물리 효과(Bouncing)를 매끄럽게 구현하기 위해 Framer Motion (React 환경) 또는 GSAP 같은 인터랙션 전문 라이브러리 도입을 적극 권장한다.
- **Local State Management**: 유저가 버린 포스트잇의 '빈자리'를 유지하기 위해, 어떤 포스트잇(ID 또는 인덱스)이 버려졌는지 브라우저의 LocalStorage에 임시 저장하여 화면을 다시 렌더링할 때 해당 요소를 숨김 처리(display: none) 해야 한다.

## 7. Go-To-Market (GTM) & Analytics

- **Acquisition Loop (바이럴)**:
    - 심플한 링크 공유: 복잡한 외부 SNS API 연동은 배제하고, 모바일 브라우저의 기본 공유 창을 띄우는 Web Share API와 직관적인 [링크 복사] 버튼만 제공한다.
    - 공유 텍스트는 가볍고 직관적으로 구성한다. (예: "무조건 욕해드립니다. 감바쓰 [링크]")
    - 블라인드, 에브리타임, 트위터(X) 등 익명 커뮤니티에 초기 시딩(Seeding)하여 자연스러운 오가닉 유입을 유도한다.
- **Event Tracking (Google Analytics / Amplitude)**:
    - `page_view` (랜딩)
    - `session_start` (대화 시작)
    - `message_sent` (유저 입력 횟수)
    - `trash_emptied` (정상 종료)
    - `share_clicked` (바이럴 버튼 클릭)

## 8. Open Questions & Risks

- **비용(Cost) 통제 방안**: 완전 오픈 웹이므로 바이럴이 터졌을 때 트래픽이 폭발할 수 있다. 무료 크레딧을 소진한 이후, 트래픽을 감당하기 위한 초기 서버/API 비용 예산 상한선(Billing Alert) 설정이 필수적이다.
- **컨텍스트 길이 제한 (Context Window)**: 유저가 텍스트를 너무 길게 복사/붙여넣기 할 경우를 대비해, 프론트엔드 입력창(Textarea)에 최대 글자 수(예: 1000자) 제한을 두어 불필요한 토큰 낭비를 막아야 한다.