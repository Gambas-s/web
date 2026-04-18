"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useRef, useEffect, useCallback, useId } from "react";
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
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRefs = useRef<{ timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});

  useEffect(() => {
    return () => {
      clearTimeout(timerRefs.current.timeout);
      clearInterval(timerRefs.current.interval);
    };
  }, []);

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

  const crumpleMessage = useCallback((id: string) => {
    if (navigator.vibrate) navigator.vibrate(30);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, crumpled: true } : m))
    );
  }, []);

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
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onCrumple={() => crumpleMessage(msg.id)}
            />
          ))}
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

  const handleLongPress = useCallback(async () => {
    await animate(pressProgress, 1, { duration: 0.32, ease: SQUISH });
    onCrumple();
  }, [pressProgress, onCrumple]);

  const longPress = useLongPress({
    onLongPress: handleLongPress,
    duration: 500,
    disabled: isAI || !!message.crumpled || !!message.pending,
  });

  useEffect(() => {
    if (longPress.isPressing) {
      animate(pressProgress, 0.82, { duration: 0.5, ease: "linear" });
    } else if (!message.crumpled) {
      animate(pressProgress, 0, { duration: 0.28, ease: BOUNCE });
    }
  }, [longPress.isPressing, pressProgress, message.crumpled]);

  if (message.crumpled) {
    return (
      <motion.div
        initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: BOUNCE }}
        data-testid="crumpled-ball"
        style={{ display: "flex", justifyContent: "flex-end", paddingRight: 8 }}
      >
        {/* 종이 뭉치: SVG 필터로 울퉁불퉁한 질감 */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={`crumpled-static-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.065 0.075" numOctaves="4" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: isAI
              ? "radial-gradient(circle at 38% 35%, #fff 0%, #e8e8e6 55%, #d4d4d0 100%)"
              : "radial-gradient(circle at 38% 35%, #3a3a38 0%, #1e1e1d 55%, #0f0f0e 100%)",
            boxShadow: isAI
              ? "inset -3px -3px 6px rgba(0,0,0,0.15), inset 2px 2px 5px rgba(255,255,255,0.7), 0 3px 10px rgba(0,0,0,0.12)"
              : "inset -3px -3px 6px rgba(0,0,0,0.4), inset 2px 2px 5px rgba(255,255,255,0.08), 0 3px 10px rgba(0,0,0,0.2)",
            filter: `url(#crumpled-static-${filterId})`,
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
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
        {...longPress}
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
          touchAction: "none",
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
