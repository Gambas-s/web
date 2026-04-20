# Web Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** md: 이상 화면에서 좌측 사이드바 + 우측 메인 레이아웃을 보여주는 웹 버전을 4개 페이지(/, /chat, /trash, /trash-fin)에 추가한다. 모바일 레이아웃은 변경하지 않는다.

**Architecture:** 공통 `WebSidebar` 컴포넌트와 `WebLayout` 래퍼를 `src/components/web/`에 생성하고, 각 페이지는 이를 조합한다. 사이드바 너비는 270px 고정이며, `hidden md:flex` Tailwind 유틸리티로 모바일/데스크톱을 분기한다. mock 데이터는 각 컴포넌트에 상수로 정의한다.

**Tech Stack:** Next.js 15 App Router, Framer Motion, Tailwind CSS, TypeScript strict

---

## File Map

| 상태 | 파일 | 역할 |
|------|------|------|
| Create | `apps/web/src/components/web/WebSidebar.tsx` | 공통 사이드바 (nav, 쓰레기통 이미지, 타이머, 유저 프로필) |
| Create | `apps/web/src/components/web/WebLayout.tsx` | 반응형 래퍼: 모바일=children만, 데스크톱=사이드바+children |
| Modify | `apps/web/src/app/page.tsx` | 웹 레이아웃 추가 (히어로 → 메시지 입력 형태) |
| Modify | `apps/web/src/app/chat/page.tsx` | 웹 레이아웃 추가, 사이드바에 crumpledCount 전달 |
| Modify | `apps/web/src/app/trash/page.tsx` | 웹 레이아웃 추가 |
| Modify | `apps/web/src/app/trash-fin/page.tsx` | 웹 레이아웃 추가 + 스탯 카드 |

---

## Task 1: WebSidebar 컴포넌트 생성

**Files:**
- Create: `apps/web/src/components/web/WebSidebar.tsx`이슈

디자인 레퍼런스: `web-home-01.png`, `web-chat-01.png`

사이드바 구성:
- 상단: "감바쓰" 로고 (h1, 36px bold)
- 네비: "+ 새 쓰레기통" / "≡ 쓰레기통 내역" / "⏰ 소각 기록" (activeItem prop으로 하이라이트)
- 중앙: 쓰레기통 이미지 + crumpledCount badge (클릭 시 onTrashClick 호출)
- 하단: "다음 자동 소각까지" 타이머 + 유저 프로필

- [ ] **Step 1: WebSidebar 파일 생성**

```tsx
// apps/web/src/components/web/WebSidebar.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export type SidebarActiveItem = "new" | "list" | "history";

interface WebSidebarProps {
  activeItem: SidebarActiveItem;
  crumpledCount?: number;
  onTrashClick?: () => void;
}

const MOCK_TIMER = "14 : 23 : 01";
const MOCK_USER = {
  name: "나는야 주인",
  totalBurned: 1234,
  streak: 21,
};

const NAV_ITEMS = [
  { id: "new" as const, icon: "+", label: "새 쓰레기통", href: "/" },
  { id: "list" as const, icon: "≡", label: "쓰레기통 내역", href: "/chat" },
  { id: "history" as const, icon: "⏰", label: "소각 기록", href: "/trash-fin" },
];

export function WebSidebar({ activeItem, crumpledCount = 0, onTrashClick }: WebSidebarProps) {
  const router = useRouter();
  const trashControls = useAnimation();

  useEffect(() => {
    if (crumpledCount === 0) return;
    trashControls.start({
      rotate: [-6, 8, -5, 4, 0],
      scale: [1, 0.82, 1.18, 0.94, 1],
      transition: { duration: 0.42, ease: "easeOut" },
    });
  }, [crumpledCount, trashControls]);

  return (
    <aside
      style={{
        width: 270,
        flexShrink: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        borderRight: "1px solid #E2E2DF",
        padding: "32px 20px 24px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
      }}
    >
      {/* 로고 */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#121211",
          letterSpacing: "-0.03em",
          margin: "0 0 28px 4px",
        }}
      >
        감바쓰
      </h1>

      {/* 네비게이션 */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <motion.button
              key={item.id}
              onClick={() => router.push(item.href)}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: isActive ? "#F4F4F2" : "transparent",
                color: isActive ? "#121211" : "#6E6E6B",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* 쓰레기통 이미지 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <motion.button
          onClick={crumpledCount > 0 ? onTrashClick : undefined}
          animate={trashControls}
          whileTap={crumpledCount > 0 ? { scale: 0.92 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            background: "none",
            border: "none",
            cursor: crumpledCount > 0 ? "pointer" : "default",
            position: "relative",
            display: "inline-flex",
          }}
        >
          <Image
            src="/trash-can.png"
            alt="쓰레기통"
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
          />
          {crumpledCount > 0 && (
            <motion.span
              key={crumpledCount}
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              style={{
                position: "absolute",
                top: -4,
                right: -8,
                minWidth: 24,
                height: 24,
                borderRadius: 9999,
                background: "#121211",
                color: "#FDFDFC",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingInline: 6,
              }}
            >
              {crumpledCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* 하단: 타이머 + 유저 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            paddingTop: 16,
            borderTop: "1px solid #E2E2DF",
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#9E9E9B",
              margin: "0 0 4px",
              letterSpacing: "-0.005em",
            }}
          >
            다음 자동 소각까지
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#121211",
              margin: 0,
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {MOCK_TIMER}
          </p>
        </div>

        {/* 유저 프로필 */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 10px",
            borderRadius: 10,
            border: "none",
            background: "#F4F4F2",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          <Image
            src="/gamza_profile.png"
            alt="프로필"
            width={36}
            height={36}
            style={{ borderRadius: 9999, objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#121211",
                margin: 0,
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {MOCK_USER.name}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#9E9E9B",
                margin: 0,
                letterSpacing: "-0.005em",
              }}
            >
              {MOCK_USER.totalBurned.toLocaleString()}개 태움 | {MOCK_USER.streak}일 째
            </p>
          </div>
        </motion.button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: 파일이 올바르게 생성됐는지 확인**

```bash
cat apps/web/src/components/web/WebSidebar.tsx | head -5
```
Expected: `"use client";` 출력

---

## Task 2: WebLayout 래퍼 컴포넌트 생성

**Files:**
- Create: `apps/web/src/components/web/WebLayout.tsx`

- [ ] **Step 1: WebLayout 파일 생성**

```tsx
// apps/web/src/components/web/WebLayout.tsx
import { ReactNode } from "react";

interface WebLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function WebLayout({ sidebar, children }: WebLayoutProps) {
  return (
    <>
      {/* 모바일: children만 */}
      <div className="flex md:hidden w-full">{children}</div>

      {/* 데스크톱: 사이드바 + children */}
      <div className="hidden md:flex w-full h-dvh overflow-hidden">
        {sidebar}
        <main className="flex-1 min-w-0 h-dvh overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
```

- [ ] **Step 2: 파일 생성 확인**

```bash
cat apps/web/src/components/web/WebLayout.tsx | head -3
```
Expected: `import { ReactNode } from "react";`

---

## Task 3: 홈 페이지(/) 웹 레이아웃 추가

**Files:**
- Modify: `apps/web/src/app/page.tsx`

디자인 레퍼런스: `web-home-01.png`
- 사이드바 activeItem: "new"
- 우측 메인: 중앙에 gamza with-trashcan 이미지, 타이틀, 서브타이틀, 하단 메시지 입력창
- 메시지 입력창 클릭 → `/chat`으로 이동

- [ ] **Step 1: page.tsx에 웹 레이아웃 추가**

기존 모바일 코드는 그대로 유지하고, 웹 버전 콘텐츠를 WebLayout 안에 함께 구성한다.

```tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WebLayout } from "@/components/web/WebLayout";
import { WebSidebar } from "@/components/web/WebSidebar";

// 웹 버전 홈 메인 콘텐츠
function WebHomeContent() {
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#FDFDFC",
        paddingTop: 60,
        paddingBottom: 32,
        boxSizing: "border-box",
      }}
    >
      {/* 중앙 이미지 + 텍스트 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/gamza/with-trashcan.png"
              alt="감바쓰 캐릭터"
              width={260}
              height={260}
              priority
              style={{ objectFit: "contain" }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
          style={{ textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#121211",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: "0 0 8px",
            }}
          >
            나쁜 감정은 바로 쓰레기통으로!
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#6E6E6B",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            판단 없이 받아 주는 AI 쓰레기통
          </p>
        </motion.div>
      </div>

      {/* 하단 메시지 입력창 (클릭 시 /chat 이동) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.25 }}
        style={{ width: "100%", maxWidth: 560, paddingInline: 24, boxSizing: "border-box" }}
      >
        <button
          onClick={() => router.push("/chat")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderRadius: 9999,
            border: "1px solid #E2E2DF",
            background: "#F4F4F2",
            cursor: "pointer",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: 15, color: "#9E9E9B", letterSpacing: "-0.005em" }}>
            메세지 입력..
          </span>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: "#121211",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="#FDFDFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <WebLayout
      sidebar={<WebSidebar activeItem="new" />}
    >
      {/* 모바일용 기존 콘텐츠 */}
      <main
        style={{
          width: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 52,
          paddingBottom: 48,
          background: "#FDFDFC",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ fontSize: 14, fontWeight: 500, color: "#6E6E6B", letterSpacing: "-0.01em" }}
        >
          감바쓰
        </motion.span>

        <motion.div
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src="/trash-can.png" alt="쓰레기통" width={280} height={280} priority style={{ objectFit: "contain" }} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", paddingInline: 32, boxSizing: "border-box" }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#121211", letterSpacing: "-0.03em", lineHeight: 1.2, margin: 0, textAlign: "center" }}>
            나쁜 감정은<br />바로 쓰레기통으로!
          </h1>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#3A3A38", lineHeight: 1.5, margin: 0, textAlign: "center" }}>
            판단 없이 받아 주는<br />AI 쓰레기통
          </p>
          <motion.button
            onClick={() => router.push("/chat")}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{ marginTop: 16, width: "100%", maxWidth: 360, padding: "18px 0", borderRadius: 9999, border: "none", background: "#121211", color: "#FDFDFC", fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 1px 1px rgba(255,255,255,0.12) inset, 0 4px 16px rgba(18,18,17,0.25)" }}
          >
            <span style={{ fontSize: 18 }}>🗑</span>버리러가기
          </motion.button>
        </motion.div>
      </main>

      {/* 데스크톱용 콘텐츠 */}
      <WebHomeContent />
    </WebLayout>
  );
}
```

- [ ] **Step 2: 빌드 오류 확인**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```
Expected: 오류 없음 (또는 기존 오류만)

- [ ] **Step 3: 커밋**

```bash
git add apps/web/src/components/web/ apps/web/src/app/page.tsx
git commit -m "feat(web): 홈 페이지 웹 레이아웃 추가 (사이드바 + 히어로)"
```

---

## Task 4: /chat 페이지 웹 레이아웃 추가

**Files:**
- Modify: `apps/web/src/app/chat/page.tsx`

디자인 레퍼런스: `web-chat-01.png`, `web-chat-02.png`
- 사이드바 activeItem: "list", crumpledCount 전달
- 사이드바 쓰레기통 클릭 → 기존 확인 모달 열기
- 데스크톱 우측 메인: 상단 "감바쓰" 타이틀 + 구분선, 메시지 영역, 하단 입력창
- 데스크톱에서 모바일 헤더(뒤로가기 버튼) 숨기기

- [ ] **Step 1: chat/page.tsx 최상단에 import 추가**

기존 import 블록 끝에 추가:
```tsx
import { WebLayout } from "@/components/web/WebLayout";
import { WebSidebar } from "@/components/web/WebSidebar";
```

- [ ] **Step 2: WebChatContent 컴포넌트 추출 — 데스크톱 우측 메인**

ChatPage 함수 내부에서 JSX return 직전, WebChatContent 인라인 변수를 정의한다 (별도 컴포넌트 아님 — state 공유 필요).

return문을 아래처럼 WebLayout으로 감싼다:

```tsx
return (
  <WebLayout
    sidebar={
      <WebSidebar
        activeItem="list"
        crumpledCount={crumpledCount}
        onTrashClick={() => setShowTrashModal(true)}
      />
    }
  >
    {/* ---- 모바일 레이아웃 (기존 코드 전체) ---- */}
    <main
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#FDFDFC",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 기존 헤더, 메시지 영역, 입력바, 모달 코드 그대로 */}
      {/* ... existing mobile JSX ... */}
    </main>

    {/* ---- 데스크톱 레이아웃 ---- */}
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#FDFDFC",
        overflow: "hidden",
      }}
    >
      {/* 데스크톱 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 56,
          flexShrink: 0,
          borderBottom: "1px solid #E2E2DF",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#121211", letterSpacing: "-0.02em" }}>
          감바쓰
        </span>
      </div>

      {/* 메시지 영역 (기존과 동일한 구조) */}
      <section
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* 날짜 구분자 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#E2E2DF" }} />
          <span style={{ fontSize: 12, color: "#9E9E9B", letterSpacing: "-0.005em", whiteSpace: "nowrap" }}>
            오늘 {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(".", "")}
          </span>
          <div style={{ flex: 1, height: 1, background: "#E2E2DF" }} />
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isFirstUserMsg = msg.id === firstUserMsgId;
            return (
              <React.Fragment key={msg.id}>
                <MessageBubble message={msg} onCrumple={() => crumpleMessage(msg.id)} />
                {isFirstUserMsg && hintVisible && (
                  <motion.div
                    data-testid="longpress-hint-desktop"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    style={{ display: "flex", justifyContent: "flex-end", paddingRight: 12, marginTop: -4 }}
                  >
                    <span style={{ fontSize: 12, color: "#9E9E9B", letterSpacing: "-0.01em" }}>
                      꾹 눌러봐 👆
                    </span>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </section>

      {/* 데스크톱 입력창 */}
      <div
        style={{
          flexShrink: 0,
          padding: "16px 40px 24px",
          background: "#FDFDFC",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "#F4F4F2",
            borderRadius: 9999,
            padding: "10px 10px 10px 20px",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메세지 입력.."
            rows={1}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 15,
              color: "#121211",
              outline: "none",
              fontFamily: "inherit",
              letterSpacing: "-0.005em",
              resize: "none",
              overflowY: "auto",
              lineHeight: 1.5,
              maxHeight: 120,
              padding: "4px 0",
            }}
          />
          <motion.button
            aria-label="전송"
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            whileTap={input.trim() && !isStreaming ? { scale: 0.92 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              border: "none",
              background: "#121211",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() && !isStreaming ? "pointer" : "default",
              opacity: input.trim() && !isStreaming ? 1 : 0.4,
              transition: "opacity 0.15s ease",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="#FDFDFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>

    {/* 모달 — 모바일/데스크톱 공통 */}
    <AnimatePresence>
      {showTrashModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowTrashModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100 }}
          />
          <motion.div
            data-testid="trash-confirm-modal"
            role="dialog" aria-modal="true"
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 101,
              background: "#FDFDFC", borderRadius: "24px 24px 0 0",
              padding: "32px 24px", paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <p style={{ fontSize: 17, fontWeight: 700, color: "#121211", lineHeight: 1.5, letterSpacing: "-0.02em", textAlign: "center", margin: 0 }}>
              쓰레기를 버릴까요?<br />
              <span style={{ fontWeight: 400, fontSize: 14, color: "#6E6E6B" }}>감정과 함께 채팅이 전부 사라져요!</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <motion.button
                aria-label="다 불태울게요" data-testid="trash-confirm-burn"
                whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => router.push(`/trash?count=${crumpledCount}`)}
                style={{ width: "100%", height: 52, borderRadius: 9999, border: "none", background: "#121211", color: "#FDFDFC", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", cursor: "pointer", fontFamily: "inherit" }}
              >
                네, 다 불태울게요.
              </motion.button>
              <motion.button
                aria-label="아니요"
                whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setShowTrashModal(false)}
                style={{ width: "100%", height: 52, borderRadius: 9999, border: "none", background: "#F4F4F2", color: "#121211", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", cursor: "pointer", fontFamily: "inherit" }}
              >
                아니요, 아직 감정이 남았어요.
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </WebLayout>
);
```

**주의:** 기존 모달 JSX는 `<main>` 안에 있었음 — WebLayout 바깥(형제)으로 이동하되, `<WebLayout>` 마지막 child로 넣는다. 기존 `<main>` 안의 모달은 제거.

- [ ] **Step 3: 타입 체크**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```
Expected: 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add apps/web/src/app/chat/page.tsx
git commit -m "feat(web): /chat 페이지 웹 레이아웃 추가 (사이드바 연동)"
```

---

## Task 5: /trash 페이지 웹 레이아웃 추가

**Files:**
- Modify: `apps/web/src/app/trash/page.tsx`

디자인 레퍼런스: `web-burn-01.png`
- 사이드바 activeItem: "list"
- 우측: 기존 소각 애니메이션 + 프로그레스 (중앙 정렬)

- [ ] **Step 1: trash/page.tsx 수정**

기존 `TrashContent` 함수의 return을 WebLayout으로 감싼다. 파일 상단에 import 추가.

```tsx
// 파일 상단 import에 추가:
import { WebLayout } from "@/components/web/WebLayout";
import { WebSidebar } from "@/components/web/WebSidebar";
```

`TrashContent`의 return을 아래로 교체:

```tsx
return (
  <WebLayout sidebar={<WebSidebar activeItem="list" />}>
    {/* 모바일 */}
    <main
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#FDFDFC",
        position: "relative",
      }}
    >
      <header style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", height: 56, flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#121211", letterSpacing: "-0.02em" }}>감바쓰</span>
      </header>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, paddingInline: 24, paddingBottom: 60 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
          감정이 모두 불타는 중입니다..
        </p>
        <motion.div
          animate={{ scaleX: [1, 0.93, 1.07, 0.96, 1.03, 1], scaleY: [1, 1.07, 0.94, 1.03, 0.98, 1], y: [0, 2, -4, 1, -1, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.1 }}
        >
          <Image src="/bruning-trash-can.png" alt="불타는 쓰레기통" width={260} height={260} style={{ objectFit: "contain" }} priority />
        </motion.div>
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ width: "100%", height: 8, borderRadius: 9999, background: "#E2E2DF", overflow: "hidden" }}>
            <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} style={{ height: "100%", borderRadius: 9999, background: "#121211", width: 0 }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
            {burned} / {total} 소각됨
          </p>
        </div>
      </div>
    </main>

    {/* 데스크톱 */}
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FDFDFC",
        gap: 40,
      }}
    >
      <p style={{ fontSize: 18, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0 }}>
        감정이 모두 불타는 중입니다..
      </p>
      <motion.div
        animate={{ scaleX: [1, 0.93, 1.07, 0.96, 1.03, 1], scaleY: [1, 1.07, 0.94, 1.03, 0.98, 1], y: [0, 2, -4, 1, -1, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.1 }}
      >
        <Image src="/bruning-trash-can.png" alt="불타는 쓰레기통" width={300} height={300} style={{ objectFit: "contain" }} priority />
      </motion.div>
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 12, paddingInline: 40, boxSizing: "border-box" }}>
        <div style={{ width: "100%", height: 8, borderRadius: 9999, background: "#E2E2DF", overflow: "hidden" }}>
          <motion.div animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} style={{ height: "100%", borderRadius: 9999, background: "#121211", width: 0 }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
          {burned} / {total} 소각됨
        </p>
      </div>
    </div>
  </WebLayout>
);
```

- [ ] **Step 2: 타입 체크**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```
Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add apps/web/src/app/trash/page.tsx
git commit -m "feat(web): /trash 페이지 웹 레이아웃 추가"
```

---

## Task 6: /trash-fin 페이지 웹 레이아웃 추가

**Files:**
- Modify: `apps/web/src/app/trash-fin/page.tsx`

디자인 레퍼런스: `web-fin-01.png`
- 사이드바 activeItem: "new" (소각 완료 → 새 세션 유도)
- 우측: 빈 쓰레기통 이미지 + "깨끗해졌어요!!" + 스탯 카드 (누적 쓰레기 수 / 스트릭 / 평균)
- 스탯 mock: { totalBurned: 320, streak: 21, avgPerDay: 12.3 }

- [ ] **Step 1: trash-fin/page.tsx 수정**

파일 상단 import에 추가:
```tsx
import { WebLayout } from "@/components/web/WebLayout";
import { WebSidebar } from "@/components/web/WebSidebar";
```

기존 return을 WebLayout으로 감싸고 데스크톱 콘텐츠 추가:

```tsx
const MOCK_STATS = { totalBurned: 320, streak: 21, avgPerDay: 12.3 };

export default function TrashFinPage() {
  const router = useRouter();

  return (
    <WebLayout sidebar={<WebSidebar activeItem="new" />}>
      {/* 모바일 (기존 코드 그대로) */}
      <main style={{ width: "100%", height: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", background: "#FDFDFC" }}>
        <header style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", height: 56, flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#121211", letterSpacing: "-0.02em" }}>감바쓰</span>
        </header>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, paddingInline: 24, paddingBottom: 40 }}>
          <motion.div initial={{ scale: 0.4, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}>
            <Image src="/trash-can.png" alt="빈 쓰레기통" width={240} height={240} style={{ objectFit: "contain" }} priority />
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.3 }} style={{ fontSize: 22, fontWeight: 700, color: "#121211", letterSpacing: "-0.03em", margin: 0 }}>
            깨끗해졌어요!!
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.45 }} style={{ width: "100%", padding: "0 24px", paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12 }}>
          <button aria-label="한번 더" onClick={() => router.push("/chat")} style={{ width: "100%", height: 56, borderRadius: 9999, border: "none", background: "#121211", color: "#FDFDFC", fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", cursor: "pointer", fontFamily: "inherit" }}>한번 더</button>
          <button aria-label="홈으로" onClick={() => router.push("/")} style={{ width: "100%", height: 56, borderRadius: 9999, border: "none", background: "#F4F4F2", color: "#121211", fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", cursor: "pointer", fontFamily: "inherit" }}>홈으로</button>
        </motion.div>
      </main>

      {/* 데스크톱 */}
      <div
        style={{
          width: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFDFC",
          gap: 32,
          paddingInline: 40,
          boxSizing: "border-box",
        }}
      >
        <motion.div initial={{ scale: 0.4, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}>
          <Image src="/trash-can.png" alt="빈 쓰레기통" width={260} height={260} style={{ objectFit: "contain" }} priority />
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.3 }} style={{ fontSize: 28, fontWeight: 700, color: "#121211", letterSpacing: "-0.03em", margin: 0 }}>
          깨끗해졌어요!!
        </motion.p>

        {/* 스탯 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.45 }}
          style={{
            width: "100%",
            maxWidth: 480,
            background: "#F4F4F2",
            borderRadius: 20,
            padding: "24px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0,
            boxSizing: "border-box",
          }}
        >
          {[
            { label: "누적 쓰레기 수", value: MOCK_STATS.totalBurned.toLocaleString(), unit: "개" },
            { label: "스트릭", value: MOCK_STATS.streak, unit: "일" },
            { label: "평균", value: MOCK_STATS.avgPerDay, unit: "개/일" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center", padding: "0 8px", borderRight: i < 2 ? "1px solid #E2E2DF" : "none" }}>
              <p style={{ fontSize: 12, color: "#6E6E6B", margin: "0 0 6px", letterSpacing: "-0.005em" }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#121211", margin: 0, letterSpacing: "-0.03em" }}>
                {stat.value}<span style={{ fontSize: 14, fontWeight: 500 }}>{stat.unit}</span>
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </WebLayout>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -20
```
Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add apps/web/src/app/trash-fin/page.tsx
git commit -m "feat(web): /trash-fin 페이지 웹 레이아웃 추가 (스탯 카드)"
```

---

## Self-Review

### Spec 커버리지 체크
- [x] 모바일 화면과 별도 컴포넌트로 분리 → WebLayout으로 모바일/데스크톱 분기
- [x] mock 데이터 도입 → MOCK_TIMER, MOCK_USER, MOCK_STATS 상수로 정의
- [x] public 이미지만 사용 → `/trash-can.png`, `/bruning-trash-can.png`, `/gamza/with-trashcan.png`, `/gamza_profile.png`
- [x] 사이드바 공통 컴포넌트 → WebSidebar.tsx
- [x] /home 웹 레이아웃 → Task 3
- [x] /chat 웹 레이아웃 → Task 4
- [x] /trash 웹 레이아웃 → Task 5
- [x] /trash-fin 웹 레이아웃 + 스탯 카드 → Task 6

### Placeholder 스캔
- Task 4에 `{/* ... existing mobile JSX ... */}` 플레이스홀더 있음 → 실행 시 실제 기존 JSX를 그대로 유지할 것. 이 플랜에서는 기존 mobile JSX가 길어서 "기존 코드 그대로" 지시로 표현했으나, 실제 구현 시 기존 chat/page.tsx의 `<main>...</main>` 블록 전체를 WebLayout 첫 번째 child로 유지해야 함.

### 타입 일관성
- `SidebarActiveItem`: "new" | "list" | "history" → 모든 페이지에서 일관 사용
- `WebSidebar` props: `activeItem`, `crumpledCount?`, `onTrashClick?` → Task 4에서 모두 전달
- `WebLayout` props: `sidebar`, `children` (ReactNode) → 모든 태스크에서 동일하게 사용
