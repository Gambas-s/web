# 감바쓰 TODO

## DAY 1 (금 4/17) — 백엔드
- [ ] CLAUDE.md 작성
- [ ] GitHub 저장소 생성 및 초기 push
- [ ] pnpm monorepo 구조 초기화 (apps/web, apps/server, packages/types)
- [ ] NestJS 초기화 + 의존성 설치 (@nestjs/config, ioredis, openai, @nestjs/throttler, helmet)
- [ ] Upstash Redis 계정 생성 + REDIS_URL 획득
- [ ] SessionService 구현 (SETEX/DEL/GET/EXISTS + TTL 10분)
- [ ] ChatService SSE + 청킹 구현 (문장 끝 감지 `/[.!?\n]/` + 50자 강제 절단)
- [ ] API 엔드포인트 구현 (POST /api/chat, DELETE /api/session, GET /api/session/check)
- [ ] Rate Limiting 설정 (IP당 분당 20회)
- [ ] CORS 설정 (ALLOWED_ORIGINS 환경변수 기반)
- [ ] curl로 백엔드 SSE 스트림 동작 확인

## DAY 2 (토 4/18) — 프론트엔드
- [ ] Next.js 15 초기화 + 의존성 설치 (framer-motion, uuid)
- [ ] useSession 훅 구현 (SessionStorage + /api/session/check 유효성 검증)
- [ ] useSSE 훅 구현 (청크 수신 + done 처리 + 에러 핸들링)
- [ ] usePostItState 훅 구현 (LocalStorage 포스트잇 상태 관리)
- [ ] DeskScene + PostIt 드래그&드롭 (Framer Motion, 쓰레기통 드롭 감지)
- [ ] TrashCan 드롭 타겟 + hover 애니메이션 + 확인 모달
- [ ] ChatContainer + MessageBubble (유저/어시스턴트 말풍선)
- [ ] TypingIndicator 애니메이션 (청크 사이 딜레이 500ms~1500ms)
- [ ] InputBar (1000자 제한, Enter 전송, Shift+Enter 줄바꿈)
- [ ] TrashButton + 세션 삭제 로직 + 랜딩 복귀
- [ ] 포스트잇 구겨짐 + 쓰레기통 투입 애니메이션 (세션 종료 시)
- [ ] 이모지 토큰 PNG 치환 (Twemoji CDN 임시 사용)
- [ ] 에지 케이스 처리 (네트워크 에러 Toast, LLM 에러 Fallback, Rate Limit 메시지)
- [ ] 반응형 확인 (모바일 Full-screen / 데스크탑 max-w-[600px])

## DAY 3 (일 4/19) — 배포
- [ ] Upstash Redis 계정 확인 + Railway 계정 생성
- [ ] GitHub Secrets 설정 (OPENAI_API_KEY, REDIS_URL, RAILWAY_TOKEN)
- [ ] GitHub Actions CI/CD 파이프라인 작성 (deploy-server.yml, ci.yml)
- [ ] apps/server Dockerfile 작성 (node:20-alpine 멀티스테이지)
- [ ] Railway 백엔드 배포 + 헬스체크 확인 (GET /health)
- [ ] Vercel 프론트엔드 배포 (GitHub 통합)
- [ ] next.config.ts API rewrite 설정 (NEXT_PUBLIC_API_URL)
- [ ] CORS 최종 설정 (Vercel URL → Railway ALLOWED_ORIGINS)
- [ ] 프로덕션 E2E 검증 (전체 플로우, 모바일/데스크탑)
- [ ] README + CLAUDE.md 최종 업데이트 (배포 URL, 실행법)

## v1.1 (추후)
- [ ] PWA 설정 (홈 화면 추가)
- [ ] Google Analytics / Amplitude 이벤트 트래킹 (page_view, session_start, message_sent, trash_emptied, share_clicked)
- [ ] 포스트잇 구겨짐 3D 효과 고도화
- [ ] 커스텀 디자인 에셋 교체 (포스트잇, 쓰레기통, 이모지 PNG)
- [ ] Web Share API + [링크 복사] 바이럴 버튼
