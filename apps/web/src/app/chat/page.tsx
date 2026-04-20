"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useAnimation } from "framer-motion";
import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { useLongPress } from "@/hooks/useLongPress";
import { WebLayout } from "@/components/web/WebLayout";
import WebSidebar from "@/components/web/WebSidebar";

type Role = "ai" | "user";

interface Message {
  id: string;
  role: Role;
  content: string;
  pending?: boolean;
  crumpled?: boolean;
  gamzaImage?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "ai",
  content: "무슨일이야?",
};

const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const GAMZA_IMAGE_MAP: Record<string, string> = {
  기본: "/gamza/normal.png",
  웃음: "/gamza/happy.png",
  슬픔: "/gamza/sad.png",
  놀람: "/gamza/surprise.png",
  화남: "/gamza/upset.png",
};

function parseEmojiTag(content: string): { imageSrc: string | null; text: string } {
  const match = content.match(/^\s*\[([^\]]+)\]\s*/);
  if (match && GAMZA_IMAGE_MAP[match[1]]) {
    return { imageSrc: GAMZA_IMAGE_MAP[match[1]], text: content.slice(match[0].length) };
  }
  return { imageSrc: null, text: content };
}

function splitIntoSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?\n。？！])(?![.!?\n。？！])\s*/);
  return parts.map((s) => s.trim()).filter(Boolean);
}

// ─── 공유 서브컴포넌트 ────────────────────────────────────────

function MessageList({
  messages,
  firstUserMsgId,
  hintVisible,
  onCrumple,
  hint,
}: {
  messages: Message[];
  firstUserMsgId: string | undefined;
  hintVisible: boolean;
  onCrumple: (id: string) => void;
  hint: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {messages.map((msg, i) => {
        const isFirstUserMsg = msg.id === firstUserMsgId;
        const isFirstInGroup = i === 0 || messages[i - 1].role !== msg.role;
        return (
          <React.Fragment key={msg.id}>
            <MessageBubble message={msg} onCrumple={() => onCrumple(msg.id)} showAvatar={isFirstInGroup} />
            {isFirstUserMsg && hintVisible && hint}
          </React.Fragment>
        );
      })}
    </AnimatePresence>
  );
}

function SendButton({
  onClick,
  disabled,
  size = 44,
}: {
  onClick: () => void;
  disabled: boolean;
  size?: number;
}) {
  const active = !disabled;
  const svgSize = size >= 44 ? 16 : 14;
  return (
    <motion.button
      aria-label="전송"
      onClick={onClick}
      disabled={disabled}
      whileTap={active ? { scale: 0.92 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        border: "none",
        background: "#121211",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: active ? "pointer" : "default",
        opacity: active ? 1 : 0.4,
        transition: "opacity 0.15s ease",
        flexShrink: 0,
      }}
    >
      <svg width={svgSize} height={svgSize} viewBox="0 0 16 16" fill="none">
        <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="#FDFDFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter();
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(true);
  useEffect(() => {
    setHintShown(!!localStorage.getItem("gambass_hint_shown"));
  }, []);
  const [hintVisible, setHintVisible] = useState(false);
  const [inputMultiline, setInputMultiline] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const desktopBottomRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLElement>(null);
  const isMounted = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const desktopTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("gambass_session_id");
    if (stored) {
      fetch(`${API_URL}/api/session?sessionId=${stored}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.messages) {
            setSessionId(stored);
            if (data.messages.length > 0) {
              setMessages([
                INITIAL_MESSAGE,
                ...data.messages.flatMap((m: { role: string; content: string }) => {
                  if (m.role === "assistant") {
                    const { imageSrc, text } = parseEmojiTag(m.content);
                    const sentences = splitIntoSentences(text || m.content);
                    if (sentences.length === 0) sentences.push(text || m.content);
                    return sentences.map((s, i) => ({
                      id: generateId(),
                      role: "ai" as Role,
                      content: s,
                      gamzaImage: i === 0 ? (imageSrc ?? undefined) : undefined,
                    }));
                  }
                  return [{ id: generateId(), role: "user" as Role, content: m.content }];
                }),
              ]);
            }
          } else {
            createNewSession();
          }
        })
        .catch(() => createNewSession());
    } else {
      createNewSession();
    }

    function createNewSession() {
      fetch(`${API_URL}/api/session`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
              setSessionId(d.sessionId);
          localStorage.setItem("gambass_session_id", d.sessionId);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const hintTimer = hintTimerRef.current;
    return () => {
      if (hintTimer) clearTimeout(hintTimer);
    };
  }, []);

  const hasUserMessage = messages.some((m) => m.role === "user");
  useEffect(() => {
    if (hintShown || !hasUserMessage) return;
    setHintVisible(true);
    hintTimerRef.current = setTimeout(() => setHintVisible(false), 10000);
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [hasUserMessage, hintShown]);

  useEffect(() => {
    const smooth = isMounted.current;
    isMounted.current = true;
    const container = mobileScrollRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    }
    desktopBottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    const el = desktopTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    setInputMultiline(el.scrollHeight > 44);
  }, [input]);

  const streamResponse = useCallback(async (aiId: string, message: string): Promise<void> => {
    for (let attempt = 0; attempt <= 2; attempt++) {
      let fullResponse = "";
      let shouldRetry = false;

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message }),
        });

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.retry) {
                shouldRetry = true;
              } else if (parsed.chunk) {
                fullResponse += parsed.chunk;
                const { text } = parseEmojiTag(fullResponse);
                const sentences = splitIntoSentences(text || fullResponse);
                const displayText = sentences[0] ?? text ?? fullResponse;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, content: displayText, pending: false } : m
                  )
                );
              }
            } catch { /* ignore parse errors */ }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: "연결이 끊겼어. 다시 말해줄래?", pending: false } : m
          )
        );
        return;
      }

      if (!shouldRetry) {
        const { imageSrc, text: cleanText } = parseEmojiTag(fullResponse);
        const sentences = splitIntoSentences(cleanText || fullResponse);
        const first = sentences[0] ?? fullResponse;

        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: first, pending: false, gamzaImage: imageSrc ?? undefined } : m))
        );

        for (let i = 1; i < sentences.length; i++) {
          await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
          const newId = generateId();
          setMessages((prev) => [...prev, { id: newId, role: "ai", content: "", pending: true }]);
          await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
          setMessages((prev) =>
            prev.map((m) => (m.id === newId ? { ...m, content: sentences[i], pending: false } : m))
          );
        }
        return;
      }
    }

    // 재시도 모두 실패
    setMessages((prev) =>
      prev.map((m) =>
        m.id === aiId ? { ...m, content: "아 나 지금 좀 이상한가봐. 다시 말해줄래?", pending: false } : m
      )
    );
  }, [sessionId]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || !sessionId) return;

    const userMsg: Message = { id: generateId(), role: "user", content: trimmed };
    const aiId = generateId();
    const aiMsg: Message = { id: aiId, role: "ai", content: "", pending: true };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      await streamResponse(aiId, trimmed);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, sessionId, streamResponse]);

  const crumpledCount = messages.filter((m) => m.crumpled).length;
  const firstUserMsgId = messages.find((m) => m.role === "user")?.id;
  const trashControls = useAnimation();

  useEffect(() => {
    if (crumpledCount === 0) return;
    trashControls.start({
      rotate: [-6, 8, -5, 4, 0],
      scale: [1, 0.82, 1.18, 0.94, 1],
      transition: { duration: 0.42, ease: "easeOut" },
    });
  }, [crumpledCount, trashControls]);

  const crumpleMessage = useCallback((id: string) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, crumpled: true } : m))
    );
    if (!hintShown) {
      setHintShown(true);
      setHintVisible(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      localStorage.setItem("gambass_hint_shown", "1");
    }
  }, [hintShown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 모바일 힌트: testid + 애니메이션 포함
  const mobileHint = (
    <motion.div
      data-testid="longpress-hint"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: "flex", justifyContent: "flex-end", paddingRight: 12, marginTop: -4 }}
    >
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 12, color: "#9E9E9B", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 4 }}
      >
        꾹 눌러봐
        <motion.span
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          👆
        </motion.span>
      </motion.span>
    </motion.div>
  );

  // 데스크톱 힌트: 심플 텍스트
  const desktopHint = (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: "flex", justifyContent: "flex-end", paddingRight: 12, marginTop: -4 }}
    >
      <span style={{ fontSize: 12, color: "#9E9E9B" }}>꾹 눌러봐 👆</span>
    </motion.div>
  );

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
      {/* Mobile: 기존 레이아웃 */}
      <main
        className="md:hidden"
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
        {/* 헤더 */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 56,
            flexShrink: 0,
            paddingInline: 16,
            background: "#FDFDFC",
          }}
        >
          <motion.button
            aria-label="뒤로가기"
            onClick={() => router.push("/")}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              position: "absolute",
              left: 16,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#121211",
              borderRadius: 9999,
            }}
          >
            <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
              <path d="M9 1L1 9L9 17" stroke="#121211" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>

          <span style={{ fontSize: 17, fontWeight: 700, color: "#121211", letterSpacing: "-0.02em" }}>
            gamza
          </span>

          <AnimatePresence>
            {crumpledCount > 0 && (
              <motion.button
                aria-label="버리러가기"
                onClick={() => setShowTrashModal(true)}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  position: "absolute",
                  right: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <motion.div
                  animate={trashControls}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Image src="/trash-can.png" alt="쓰레기통" width={28} height={28} style={{ objectFit: "contain" }} />
                </motion.div>
                <motion.span
                  key={crumpledCount}
                  initial={{ scale: 1.8, opacity: 0, y: -4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  data-testid="crumple-badge"
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 9999,
                    background: "#121211",
                    color: "#FDFDFC",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingInline: 5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {crumpledCount}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.header>

        {/* 메시지 영역 */}
        <section
          ref={mobileScrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "16px 20px",
            paddingBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <MessageList
            messages={messages}
            firstUserMsgId={firstUserMsgId}
            hintVisible={hintVisible}
            onCrumple={crumpleMessage}
            hint={mobileHint}
          />
          <div ref={bottomRef} />
        </section>

        {/* 입력바 */}
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            background: "#FFFFFF",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="메세지 입력.."
            rows={1}
            style={{
              flex: 1,
              minHeight: 44,
              maxHeight: 120,
              borderRadius: 22,
              border: "none",
              background: "#F4F4F2",
              padding: "11px 16px",
              fontSize: 15,
              color: "#121211",
              outline: "none",
              fontFamily: "inherit",
              letterSpacing: "-0.005em",
              resize: "none",
              overflowY: "auto",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
          <SendButton onClick={sendMessage} disabled={!input.trim() || isStreaming || !sessionId} size={44} />
        </div>
      </main>

      {/* Desktop: 웹 레이아웃 */}
      <motion.div
        className="hidden md:flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        style={{ width: "100%", height: "100%", background: "#FDFDFC", overflow: "hidden" }}
      >
        {/* 데스크톱 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 56,
            flexShrink: 0,
            borderBottom: "1px solid #E2E2DF",
            padding: "0 24px",
            gap: 12,
          }}
        >
          <motion.button
            aria-label="뒤로가기"
            onClick={() => router.push("/")}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "none", border: "none", cursor: "pointer", borderRadius: 9999, flexShrink: 0 }}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="#121211" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
          <Image src="/gamza_profile.png" alt="감자" width={32} height={32} style={{ borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#121211", letterSpacing: "-0.01em" }}>감자</span>
        </div>

        {/* 데스크톱 메시지 영역 */}
        <section
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "24px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* 날짜 구분선 — suppressHydrationWarning: SSR/CSR 날짜 불일치 방지 */}
          <div style={{ margin: "8px 0 16px", width: "100%", maxWidth: 480, textAlign: "center" }}>
            <span suppressHydrationWarning style={{ fontSize: 12, color: "#9E9E9B" }}>
              오늘{" "}
              {new Date()
                .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
                .replace(/\.\s/g, ".")
                .replace(/\.$/, "")}
            </span>
          </div>

          <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 12 }}>
            <MessageList
              messages={messages}
              firstUserMsgId={firstUserMsgId}
              hintVisible={hintVisible}
              onCrumple={crumpleMessage}
              hint={desktopHint}
            />
          </div>
          <div ref={desktopBottomRef} />
        </section>

        {/* 데스크톱 입력바 — 홈화면과 동일한 스타일 */}
        <div style={{ flexShrink: 0, padding: "16px 40px 24px", background: "#FDFDFC" }}>
          <div
            style={{
              display: "flex",
              alignItems: inputMultiline ? "flex-end" : "center",
              gap: 8,
              background: "#FFFFFF",
              borderRadius: inputMultiline ? 20 : 9999,
              padding: "10px 10px 10px 20px",
              boxShadow: "0 0 0 1px #E2E2DF, 0 2px 8px rgba(18,18,17,0.06)",
              maxWidth: 480,
              width: "100%",
              margin: "0 auto",
              boxSizing: "border-box",
              transition: "border-radius 150ms ease",
            }}
          >
            <textarea
              ref={desktopTextareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
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
            <SendButton onClick={sendMessage} disabled={!input.trim() || isStreaming || !sessionId} size={36} />
          </div>
        </div>
      </motion.div>

      {/* 모달 — 딤드 배경 공용 */}
      <AnimatePresence>
        {showTrashModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowTrashModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100 }}
            />

            {/* 모바일: 바텀시트 */}
            <motion.div
              data-testid="trash-confirm-modal"
              role="dialog"
              aria-modal="true"
              className="flex flex-col md:hidden"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 101,
                background: "#FDFDFC", borderRadius: "24px 24px 0 0",
                padding: "32px 24px",
                paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
                gap: 16,
              }}
            >
              <ModalContent
                onConfirm={() => router.push(`/trash?count=${crumpledCount}`)}
                onCancel={() => setShowTrashModal(false)}
              />
            </motion.div>

            {/* 데스크톱: 중앙 다이얼로그 */}
            <motion.div
              data-testid="trash-confirm-modal-desktop"
              role="dialog"
              aria-modal="true"
              className="hidden md:flex"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{
                position: "fixed",
                inset: 0,
                margin: "auto",
                zIndex: 101,
                background: "#FDFDFC",
                borderRadius: 24,
                padding: "32px 28px",
                width: 360,
                height: "fit-content",
                flexDirection: "column",
                gap: 20,
                boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <ModalContent
                onConfirm={() => router.push(`/trash?count=${crumpledCount}`)}
                onCancel={() => setShowTrashModal(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </WebLayout>
  );
}

function ModalContent({ onConfirm, onCancel, row = false }: { onConfirm: () => void; onCancel: () => void; row?: boolean }) {
  return (
    <>
      <p style={{ fontSize: 17, fontWeight: 700, color: "#121211", lineHeight: 1.5, letterSpacing: "-0.02em", textAlign: "center", margin: 0 }}>
        쓰레기를 버릴까요?
        <br />
        <span style={{ fontWeight: 400, fontSize: 14, color: "#6E6E6B" }}>감정과 함께 채팅이 전부 사라져요!</span>
      </p>
      <div style={{ display: "flex", flexDirection: row ? "row" : "column", gap: row ? 8 : 10 }}>
        <motion.button
          aria-label="아직 남았어요"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={onCancel}
          style={{ flex: row ? 1 : undefined, width: row ? undefined : "100%", height: 52, borderRadius: 9999, border: "none", background: "#F4F4F2", color: "#121211", fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", cursor: "pointer", fontFamily: "inherit" }}
        >
          아직 남았어요
        </motion.button>
        <motion.button
          aria-label="다 불태울게요"
          data-testid="trash-confirm-burn"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={onConfirm}
          style={{ flex: row ? 1 : undefined, width: row ? undefined : "100%", height: 52, borderRadius: 9999, border: "none", background: "#121211", color: "#FDFDFC", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", cursor: "pointer", fontFamily: "inherit" }}
        >
          다 불태울게요
        </motion.button>
      </div>
    </>
  );
}

function Avatar() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: 9999, flexShrink: 0, overflow: "hidden" }}>
      <Image src="/gamza_profile.png" alt="gamza" width={40} height={40} style={{ objectFit: "cover" }} />
    </div>
  );
}

// Design system motion tokens
const SQUISH: [number, number, number, number] = [0.87, 0, 0.13, 1];
const BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

function MessageBubble({
  message,
  onCrumple,
  showAvatar = true,
}: {
  message: Message;
  onCrumple: () => void;
  showAvatar?: boolean;
}) {
  const isAI = message.role === "ai";
  const filterId = useId().replace(/:/g, "");
  const dispMapRef = useRef<SVGFEDisplacementMapElement>(null);

  const pressProgress = useMotionValue(0);

  useEffect(() => {
    return pressProgress.on("change", (v) => {
      if (dispMapRef.current) {
        dispMapRef.current.setAttribute("scale", String(v * 52));
      }
    });
  }, [pressProgress]);

  const bubbleScale = useTransform(pressProgress, [0, 0.7, 1], [1, 0.78, 0.38]);
  const bubbleRadius = useTransform(pressProgress, [0, 0.5, 1], [
    isAI ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
    "28px",
    "50%",
  ]);
  const bubbleSkewX = useTransform(pressProgress, [0, 0.3, 0.6, 1], [0, -4, 3, 0]);
  const bubbleSkewY = useTransform(pressProgress, [0, 0.4, 0.7, 1], [0, 2, -3, 0]);

  const isCrumpling = useRef(false);

  const handleLongPress = useCallback(async () => {
    isCrumpling.current = true;
    await animate(pressProgress, 1, { duration: 0.32, ease: SQUISH });
    onCrumple();
  }, [pressProgress, onCrumple]);

  const { isPressing, ...longPressHandlers } = useLongPress({
    onLongPress: handleLongPress,
    duration: 500,
    disabled: !!message.crumpled || !!message.pending,
  });

  useEffect(() => {
    if (isPressing) {
      animate(pressProgress, 0.82, { duration: 0.5, ease: "linear" });
    } else if (!message.crumpled && !isCrumpling.current) {
      animate(pressProgress, 0, { duration: 0.28, ease: BOUNCE });
    }
  }, [isPressing, pressProgress, message.crumpled]);

  if (message.crumpled) {
    return (
      <motion.div
        layout
        initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: BOUNCE }}
        data-testid="crumpled-ball"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: isAI ? "flex-start" : "flex-end",
          gap: 10,
          paddingRight: isAI ? 0 : 8,
        }}
      >
        {isAI && (showAvatar ? <Avatar /> : <div style={{ width: 40, flexShrink: 0 }} />)}
        <Image
          src={isAI ? "/trash-paper-white.png" : "/trash-paper-black.png"}
          alt="구겨진 종이"
          width={64}
          height={64}
          style={{ objectFit: "contain" }}
        />
      </motion.div>
    );
  }

  const { imageSrc, text: displayText } = isAI
    ? parseEmojiTag(message.content)
    : { imageSrc: null, text: message.content };

  const bubbleStyle = {
    padding: message.pending ? "14px 18px" : "12px 16px",
    borderRadius: bubbleRadius,
    scale: bubbleScale,
    skewX: bubbleSkewX,
    skewY: bubbleSkewY,
    filter: `url(#crumple-${filterId})`,
    fontSize: 15,
    lineHeight: 1.6,
    letterSpacing: "-0.005em",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    touchAction: "pan-y" as const,
    cursor: isAI ? "default" : "pointer",
    ...(isAI
      ? { background: "#FFFFFF", color: "#3A3A38", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" }
      : { background: "#121211", color: "#FDFDFC" }),
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { duration: 0.3, ease: BOUNCE }, opacity: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: isAI ? "flex-start" : "flex-end",
        justifyContent: isAI ? "flex-start" : "flex-end",
        gap: 10,
      }}
    >
      {isAI && (showAvatar ? <Avatar /> : <div style={{ width: 40, flexShrink: 0 }} />)}

      {/* SVG 변위 필터 (구기기 텍스처) */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={`crumple-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.05" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap
              ref={dispMapRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {isAI ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "72%", alignItems: "flex-start" }}>
          {message.gamzaImage && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.1 }}
            >
              <Image src={message.gamzaImage} alt="감자 반응" width={80} height={80} style={{ objectFit: "contain" }} />
            </motion.div>
          )}
          <motion.div {...longPressHandlers} style={bubbleStyle}>
            {message.pending ? <DotsIndicator /> : displayText}
          </motion.div>
        </div>
      ) : (
        <motion.div {...longPressHandlers} style={{ maxWidth: "72%", ...bubbleStyle }}>
          {displayText}
        </motion.div>
      )}
    </motion.div>
  );
}

function DotsIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          style={{ width: 6, height: 6, borderRadius: 9999, background: "#9E9E9B" }}
        />
      ))}
    </div>
  );
}
