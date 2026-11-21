# 독립 QA 계획

## 근거

I checked the actual markup in apps/web/src/app/chat/page.tsx, trash/page.tsx, trash-fin/page.tsx, components/web/WebSidebar.tsx and WebLayout.tsx. The selectors in the approved scenarios do not match the implemented desktop controls (1440x900), so I fixed them throughout:
(1) The attributes data-message-role, data-message-kind and data-message-sequence do not exist. The real ones are data-message-author, data-message-order and data-message-id. The initial message '무슨일이야?' is ai order 1, so the first 감자 reply is ai order 2.
(2) The header button[aria-label="버리러가기"] and [data-testid="crumple-badge"] exist only in the mobile (md:hidden) markup. On desktop the control is the sidebar button aside:visible button[aria-label="쓰레기 버리기"]; its aria-label is '쓰레기통' when nothing is selected.
(3) WebLayout renders children twice (mobile and desktop wrappers), and so does the modal. Every selector therefore uses :visible and scopes to section[data-layout="desktop"]:visible or [data-testid="trash-confirm-modal-desktop"]:visible.
(4) The failure copy is '소각을 마치지 못했어요. 다시 시도해 주세요.' in [role="alert"]. '소각을 완료하지 못했어요' and '대화는 그대로 보관되어 있어요' do not exist in the markup. The retry button has no aria-label, so I use [data-testid="retry-burn"]:visible.
(5) The desktop '홈으로' and '한번 더' buttons on the finish screen have no aria-label, so I use :has-text.
(6) /trash has a query string, so instead of expect_url I check the visible progress text.

Waiting and timing rules:
- Pending 감자 bubbles carry aria-disabled="true". I wait with :not([aria-disabled="true"]).
- After the last send I fill the textarea and wait for the send button to become enabled. That confirms isStreaming, including sentence-split replies, has ended. Then I clear the input before crumpling.
- Crumpling uses Space on the [role="button"] bubble (handleKeyboardCrumple). The crumpled ball has no role, so a second press cannot match it.
- The finish screen auto-redirects to / after 5 seconds, so its checks come right after arrival or right after reload, and reload resets the countdown.

Coverage added:
- Unchanged count during selection, during burning and on failure (sidebar profile stays at '소각 0개').
- Cancel ('아직 남았어요').
- Zero selection.
- Direct /trash?count=3 entry with no stored attempt.
- Special characters/HTML/emoji rendered as text and burned.
- Accumulation across two burns in the same browser (new session via '한번 더').
- Failure scenarios, each with its one-shot DELETE mode stated in the ID and title:
  - Failure before delete, then retry succeeds.
  - Response lost after delete, recovered on retry via already_deleted.
  - Failure before delete, then return to chat: the conversation is restored from the server and burning again counts once.

## QA-N-001 · 사용자 메시지 2개와 감자 답장(ai 순번 2) 1개를 데스크톱에서 직접 구겨 소각하고 정확히 3개를 한 번만 집계 (normal)

시작 경로: `/chat`

1. `action=goto · path=/chat · name=저장 데이터 없는 새 컨텍스트에서 채팅 열기`
2. `action=expect_text · selector=section[data-layout="desktop"]:visible · value=무슨일이야? · name=선택하지 않을 초기 감자 메시지 확인`
3. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=초기 누적값 0 확인`
4. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=첫 번째 이야기 · name=첫 사용자 메시지 입력`
5. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=첫 메시지 전송(세션 발급 후 활성화)`
6. `action=expect_visible · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · name=첫 사용자 메시지 표시`
7. `action=expect_visible · selector=section[data-layout="desktop"]:visible [data-message-author="ai"][data-message-order="2"][role="button"]:not([aria-disabled="true"]) · name=첫 감자 답장 수신 완료 대기`
8. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=두 번째 이야기 · name=두 번째 사용자 메시지 입력`
9. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=첫 응답 스트리밍 종료 후 두 번째 메시지 전송`
10. `action=expect_visible · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="2"][role="button"] · name=두 번째 사용자 메시지 표시`
11. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=스트리밍 종료 확인용 임시 입력`
12. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=두 번째 감자 응답까지 모두 정착 대기`
13. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
14. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=첫 사용자 메시지 구기기`
15. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="2"][role="button"] · value=Space · name=두 번째 사용자 메시지 구기기`
16. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="ai"][data-message-order="2"][role="button"]:not([aria-disabled="true"]) · value=Space · name=감자 답장(ai 순번 2)만 구기기`
17. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=3 · name=사이드바 선택 배지 3 확인`
18. `action=expect_visible · selector=section[data-layout="desktop"]:visible [data-message-author="ai"][data-message-order="1"][role="button"] · name=초기 감자 메시지는 구겨지지 않고 남음`
19. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=선택만으로는 누적값 불변`
20. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=소각 확인 다이얼로그 열기`
21. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=세 메시지 소각 시작`
22. `action=expect_text · selector=p:has-text("소각됨"):visible · value=/ 3 소각됨 · name=소각 화면 진입(총 3개) 확인`
23. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=소각 진행 중 누적값 불변`
24. `action=expect_text · selector=p:has-text("소각됨"):visible · value=3 / 3 소각됨 · name=모든 선택 메시지 소각 완료`
25. `action=expect_url · path=/trash-fin · name=삭제 성공 후 완료 화면 진입`
26. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=3개 · name=완료 화면 누적값 3`
27. `action=reload · name=완료 화면 재처리`
28. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=3개 · name=재처리 후 중복 증가 없음`
29. `action=click · selector=button:has-text("홈으로"):visible · name=홈으로 이동`
30. `action=expect_url · path=/ · name=홈 도착`
31. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 3개 · name=사이드바 누적값 3`
32. `action=reload · name=홈 새로고침`
33. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 3개 · name=새로고침 후 누적값 유지`
34. `action=screenshot · path=evidence/qa/QA-N-001-success-count.png · name=정상 소각과 유지 증거`

## QA-N-002 · 저장값이 없는 새 브라우저의 홈·완료 화면 초기 누적값 0 (normal)

시작 경로: `/`

1. `action=goto · path=/ · name=새 컨텍스트에서 홈 열기`
2. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=사이드바 초기값 0`
3. `action=goto · path=/trash-fin · name=완료 화면 직접 열기`
4. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=0개 · name=완료 화면 초기값 0`
5. `action=screenshot · path=evidence/qa/QA-N-002-empty-storage.png · name=초기 0 증거`

## QA-N-003 · 전체 사용자 화면 점검: 홈·채팅·취소·소각·완료·기록 화면 (normal)

시작 경로: `/`

1. `action=goto · path=/ · name=홈 열기`
2. `action=expect_text · selector=body · value=나쁜 감정은 · name=홈 핵심 문구`
3. `action=screenshot · path=evidence/qa/QA-N-003-home.png · name=홈 증거`
4. `action=goto · path=/chat · name=채팅 열기`
5. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=화면 점검용 대화 · name=메시지 입력`
6. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=메시지 전송`
7. `action=expect_text · selector=section[data-layout="desktop"]:visible · value=화면 점검용 대화 · name=사용자 메시지 표시`
8. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=스트리밍 종료 확인용 임시 입력`
9. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=감자 응답 정착 대기`
10. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
11. `action=screenshot · path=evidence/qa/QA-N-003-chat.png · name=채팅 증거`
12. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=사용자 메시지 구기기`
13. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=1 · name=선택 배지 1`
14. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=확인 다이얼로그 열기`
15. `action=expect_text · selector=[data-testid="trash-confirm-modal-desktop"]:visible · value=쓰레기를 버릴까요? · name=다이얼로그 문구`
16. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="아직 남았어요"] · name=취소`
17. `action=expect_url · path=/chat · name=취소 시 채팅에 머묾`
18. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=1 · name=취소 후 선택 유지`
19. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=취소 후 누적값 불변`
20. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 다시 열기`
21. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=소각 시작`
22. `action=expect_text · selector=p:has-text("소각됨"):visible · value=/ 1 소각됨 · name=소각 화면 표시`
23. `action=screenshot · path=evidence/qa/QA-N-003-trash.png · name=소각 화면 증거`
24. `action=expect_url · path=/trash-fin · name=완료 화면 진입`
25. `action=expect_text · selector=body · value=깨끗해졌어요!! · name=완료 문구`
26. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=1개 · name=누적 1`
27. `action=screenshot · path=evidence/qa/QA-N-003-trash-fin.png · name=완료 화면 증거`
28. `action=goto · path=/log · name=소각 기록 화면 열기`
29. `action=expect_text · selector=body · value=소각 기록 · name=기록 화면 확인`
30. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 1개 · name=기록 화면 사이드바 누적 1`
31. `action=screenshot · path=evidence/qa/QA-N-003-log.png · name=기록 화면 증거`

## QA-N-004 · 경계: 선택 없음 상태의 쓰레기통과 저장된 시도 없이 /trash?count=3 직접 진입 시 소각·집계 미발생 (normal)

시작 경로: `/chat`

1. `action=goto · path=/chat · name=채팅 열기`
2. `action=expect_visible · selector=aside:visible button[aria-label="쓰레기통"] · name=선택 없음 상태 쓰레기통 라벨`
3. `action=click · selector=aside:visible button[aria-label="쓰레기통"] · name=선택 없이 쓰레기통 클릭`
4. `action=expect_url · path=/chat · name=이동 없이 채팅 유지`
5. `action=expect_visible · selector=textarea[placeholder="메세지 입력.."]:visible · name=다이얼로그 없이 입력창 사용 가능`
6. `action=goto · path=/trash?count=3 · name=이전 형식 count 쿼리로 직접 진입`
7. `action=expect_text · selector=[role="alert"]:visible · value=선택한 메시지를 확인할 수 없어요. · name=소각 미시작 안내`
8. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=누적값 불변`
9. `action=screenshot · path=evidence/qa/QA-N-004-invalid-entry.png · name=직접 진입 차단 증거`
10. `action=click · selector=button:has-text("채팅으로 돌아가기"):visible · name=채팅으로 복귀`
11. `action=expect_url · path=/chat · name=채팅 복귀 확인`

## QA-N-005 · 특수문자·HTML·이모지 메시지 소각과 '한번 더' 이후 두 번째 소각의 누적 합산(1→2) (normal)

시작 경로: `/chat`

1. `action=goto · path=/chat · name=채팅 열기`
2. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=<script>alert('x')</script> "따옴표" & 😡 #%?/ · name=특수문자 메시지 입력`
3. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=전송`
4. `action=expect_text · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=<script>alert('x')</script> "따옴표" & 😡 #%?/ · name=원문 그대로 텍스트로 표시`
5. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=임시 입력`
6. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=응답 정착 대기`
7. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
8. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=특수문자 메시지 구기기`
9. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=1 · name=선택 1`
10. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 열기`
11. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=소각`
12. `action=expect_url · path=/trash-fin · name=완료 화면`
13. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=1개 · name=첫 소각 누적 1`
14. `action=click · selector=button:has-text("한번 더"):visible · name=한번 더`
15. `action=expect_url · path=/chat · name=새 채팅 진입`
16. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=두 번째 대화 · name=새 세션 메시지 입력`
17. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=새 세션 발급 후 전송`
18. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=임시 입력`
19. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=응답 정착 대기`
20. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
21. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=새 메시지 구기기`
22. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 열기`
23. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=두 번째 소각`
24. `action=expect_url · path=/trash-fin · name=완료 화면`
25. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=2개 · name=누적 2로 합산`
26. `action=screenshot · path=evidence/qa/QA-N-005-special-chars-accumulate.png · name=특수문자·누적 증거`

## QA-F-001-before-delete · DELETE 1회 삭제 전 실패(세션 미삭제) 주입: 실패 시 누적 불변, 동일 시도 재시도 성공 후 한 번만 2개 집계 (failure)

시작 경로: `/chat`

1. `action=goto · path=/chat · name=첫 DELETE가 삭제 전에 실패하도록 주입된 환경에서 채팅 열기`
2. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=지우기 전까지 남아야 하는 대화 · name=메시지 입력`
3. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=전송`
4. `action=expect_visible · selector=section[data-layout="desktop"]:visible [data-message-author="ai"][data-message-order="2"][role="button"]:not([aria-disabled="true"]) · name=감자 답장 수신`
5. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=임시 입력`
6. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=응답 정착 대기`
7. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
8. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=사용자 메시지 구기기`
9. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="ai"][data-message-order="2"][role="button"]:not([aria-disabled="true"]) · value=Space · name=감자 답장 구기기`
10. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=2 · name=선택 2`
11. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 열기`
12. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=소각과 첫 DELETE 시작`
13. `action=expect_text · selector=p:has-text("소각됨"):visible · value=2 / 2 소각됨 · name=애니메이션 소각 완료`
14. `action=expect_text · selector=[role="alert"]:visible · value=소각을 마치지 못했어요 · name=삭제 실패 안내`
15. `action=expect_url · path=/trash · name=실패 시 완료 화면으로 이동하지 않음`
16. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=실패 시 누적값 불변`
17. `action=screenshot · path=evidence/qa/QA-F-001-before-delete-failed.png · name=실패 상태 증거`
18. `action=click · selector=[data-testid="retry-burn"]:visible · name=동일 시도로 다시 시도`
19. `action=expect_url · path=/trash-fin · name=재시도 성공 후 완료 화면`
20. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=2개 · name=정확히 2 집계`
21. `action=reload · name=완료 결과 재처리`
22. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=2개 · name=중복 증가 없음`
23. `action=screenshot · path=evidence/qa/QA-F-001-before-delete-retry.png · name=재시도 복구 증거`

## QA-F-002-lost-response-after-delete · DELETE 1회 삭제 후 응답 유실(서버 삭제 완료) 주입: 실패 표시 후 동일 시도 재시도가 already_deleted로 복구되어 1개만 집계 (failure)

시작 경로: `/chat`

1. `action=goto · path=/chat · name=첫 DELETE가 삭제 후 응답 유실되도록 주입된 환경에서 채팅 열기`
2. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=응답 유실 복구 확인 · name=메시지 입력`
3. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=전송`
4. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=임시 입력`
5. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=응답 정착 대기`
6. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
7. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=사용자 메시지 구기기`
8. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=1 · name=선택 1`
9. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 열기`
10. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=소각 시작(삭제는 되지만 응답 유실)`
11. `action=expect_text · selector=[role="alert"]:visible · value=소각을 마치지 못했어요 · name=응답 유실을 실패로 표시`
12. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=유실 시 누적값 불변`
13. `action=click · selector=[data-testid="retry-burn"]:visible · name=같은 시도 식별자로 재시도`
14. `action=expect_url · path=/trash-fin · name=기존 성공 결과로 완료 화면`
15. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=1개 · name=1 집계`
16. `action=reload · name=재처리`
17. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=1개 · name=중복 증가 없음`
18. `action=click · selector=button:has-text("홈으로"):visible · name=홈으로`
19. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 1개 · name=사이드바에도 1만 반영`
20. `action=screenshot · path=evidence/qa/QA-F-002-lost-response.png · name=응답 유실 복구 증거`

## QA-F-003-before-delete-return-to-chat · DELETE 1회 삭제 전 실패 주입 후 재시도 대신 채팅으로 복귀: 기존 대화가 서버에서 복원되고 다시 소각 시 1개만 집계 (failure)

시작 경로: `/chat`

1. `action=goto · path=/chat · name=첫 DELETE가 삭제 전에 실패하도록 주입된 환경에서 채팅 열기`
2. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=실패 후에도 남는 대화 · name=메시지 입력`
3. `action=click · selector=button[aria-label="전송"]:not([disabled]):visible · name=전송`
4. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value=대기 · name=임시 입력`
5. `action=expect_visible · selector=button[aria-label="전송"]:not([disabled]):visible · name=응답 정착(서버 저장) 대기`
6. `action=fill · selector=textarea[placeholder="메세지 입력.."]:visible · value= · name=임시 입력 지우기`
7. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=사용자 메시지 구기기`
8. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 열기`
9. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=소각 시작(첫 DELETE 실패)`
10. `action=expect_text · selector=[role="alert"]:visible · value=소각을 마치지 못했어요 · name=실패 안내`
11. `action=goto · path=/chat · name=재시도하지 않고 채팅으로 복귀`
12. `action=expect_text · selector=section[data-layout="desktop"]:visible · value=실패 후에도 남는 대화 · name=기존 대화가 서버 세션에서 복원됨`
13. `action=expect_text · selector=aside:visible button[aria-label="사용자 프로필"] · value=소각 0개 · name=누적값 불변`
14. `action=press · selector=section[data-layout="desktop"]:visible [data-message-author="user"][data-message-order="1"][role="button"] · value=Space · name=복원된 메시지 다시 구기기`
15. `action=expect_text · selector=aside:visible button[aria-label="쓰레기 버리기"] · value=1 · name=선택 1`
16. `action=click · selector=aside:visible button[aria-label="쓰레기 버리기"] · name=다이얼로그 열기`
17. `action=click · selector=[data-testid="trash-confirm-modal-desktop"]:visible button[aria-label="다 불태울게요"] · name=다시 소각(주입 소진, 성공)`
18. `action=expect_url · path=/trash-fin · name=완료 화면`
19. `action=expect_text · selector=p:has-text("누적 쓰레기 수"):visible + p · value=1개 · name=실패분 미합산, 성공분 1만 집계`
20. `action=screenshot · path=evidence/qa/QA-F-003-return-to-chat.png · name=대화 보존·재소각 증거`
