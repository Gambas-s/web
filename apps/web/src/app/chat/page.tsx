"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useAnimation } from "framer-motion";
import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { useLongPress } from "@/hooks/useLongPress";

type Role = "ai" | "user";

interface Message {
  id: string;
  role: Role;
  content: string;
  pending?: boolean;
  crumpled?: boolean;
}

const MOCK_RESPONSES = [
  "ㅁㅊㅋㅋㅋ\n잼컨 발생 빨리 말해줘",
  "어우 진짜? 더 말해봐",
  "그래서 어떻게 됐어?",
  "아 진짜 그건 너무하네",
  "맞아, 그럴 수 있어. 계속해봐",
  "헐 진짜?? 그 사람 왜 그래",
  "ㅋㅋㅋ 맞아 그건 빡치지",
  "다 털어놔, 여기 다 받아줄게",
];

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "ai",
  content: "무슨일이야?",
};

export default function ChatPage() {
  const router = useRouter();
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hintShown, setHintShown] = useState(true);
  useEffect(() => {
    setHintShown(!!localStorage.getItem("gambass_hint_shown"));
  }, []);
  const [hintVisible, setHintVisible] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRefs = useRef<{ timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});

  useEffect(() => {
    return () => {
      clearTimeout(timerRefs.current.timeout);
      clearInterval(timerRefs.current.interval);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 입력 내용에 따라 textarea 높이 자동 조절
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const aiId = crypto.randomUUID();
    const aiMsg: Message = { id: aiId, role: "ai", content: "", pending: true };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setIsStreaming(true);

    const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

    timerRefs.current.timeout = setTimeout(() => {
      let i = 0;
      timerRefs.current.interval = setInterval(() => {
        i++;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: response.slice(0, i), pending: false } : m
          )
        );
        if (i >= response.length) {
          clearInterval(timerRefs.current.interval);
          setIsStreaming(false);
        }
      }, 35);
    }, 600);
  }, [input, isStreaming]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
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

        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#121211",
            letterSpacing: "-0.02em",
          }}
        >
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
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          paddingBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isFirstUserMsg = msg.id === firstUserMsgId;
            return (
              <React.Fragment key={msg.id}>
                <MessageBubble
                  message={msg}
                  onCrumple={() => crumpleMessage(msg.id)}
                />
                {isFirstUserMsg && hintVisible && (
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
                      style={{
                        fontSize: 12,
                        color: "#9E9E9B",
                        letterSpacing: "-0.01em",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
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
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>

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
        <motion.button
          aria-label="전송"
          onClick={sendMessage}
          disabled={!input.trim() || isStreaming}
          whileTap={input.trim() && !isStreaming ? { scale: 0.92 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            width: 44,
            height: 44,
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="#FDFDFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      {/* 쓰레기 버리기 확인 모달 */}
      <AnimatePresence>
        {showTrashModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowTrashModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 100,
              }}
            />
            <motion.div
              data-testid="trash-confirm-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 101,
                background: "#FDFDFC",
                borderRadius: "24px 24px 0 0",
                padding: "32px 24px",
                paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#121211",
                  lineHeight: 1.5,
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                쓰레기를 버릴까요?
                <br />
                <span style={{ fontWeight: 400, fontSize: 14, color: "#6E6E6B" }}>
                  감정과 함께 채팅이 전부 사라져요!
                </span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <motion.button
                  aria-label="다 불태울겡요"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => router.push(`/trash?count=${crumpledCount}`)}
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 9999,
                    border: "none",
                    background: "#121211",
                    color: "#FDFDFC",
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  네 다 불태울겡요
                </motion.button>
                <motion.button
                  aria-label="아니요"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => setShowTrashModal(false)}
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 9999,
                    border: "none",
                    background: "#F4F4F2",
                    color: "#121211",
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  아니요 아직 감정이 남았어요
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
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
}: {
  message: Message;
  onCrumple: () => void;
}) {
  const isAI = message.role === "ai";
  const filterId = useId().replace(/:/g, "");
  const dispMapRef = useRef<SVGFEDisplacementMapElement>(null);

  // pressProgress: 0 = 정상, 1 = 완전히 구겨짐
  const pressProgress = useMotionValue(0);

  // SVG 변위 필터를 pressProgress에 동기화
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
        {isAI && <Avatar />}
        <Image
          src={isAI ? "/trash-paper-white.png" : "/trash-paper.png"}
          alt="구겨진 종이"
          width={64}
          height={64}
          style={{ objectFit: "contain" }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { duration: 0.3, ease: BOUNCE }, opacity: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: isAI ? "flex-start" : "flex-end",
        gap: 10,
      }}
    >
      {isAI && <Avatar />}

      {/* SVG 변위 필터 (꾸기기 텍스처) */}
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

      <motion.div
        {...longPressHandlers}
        style={{
          maxWidth: "72%",
          padding: message.pending ? "14px 18px" : "12px 16px",
          borderRadius: bubbleRadius,
          scale: bubbleScale,
          skewX: bubbleSkewX,
          skewY: bubbleSkewY,
          filter: `url(#crumple-${filterId})`,
          fontSize: 15,
          lineHeight: 1.6,
          letterSpacing: "-0.005em",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "pan-y",
          cursor: isAI ? "default" : "pointer",
          ...(isAI
            ? {
                background: "#FFFFFF",
                color: "#3A3A38",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
              }
            : {
                background: "#121211",
                color: "#FDFDFC",
              }),
        }}
      >
        {message.pending ? <DotsIndicator /> : message.content}
      </motion.div>
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
