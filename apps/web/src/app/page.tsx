"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { WebLayout } from "@/components/web/WebLayout";
import WebSidebar from "@/components/web/WebSidebar";

const INPUT_BAR_STYLES = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 10px 10px 20px",
  borderRadius: 9999,
  background: "#FFFFFF",
  boxShadow: "0 0 0 1px #E2E2DF, 0 2px 8px rgba(18,18,17,0.06)",
  boxSizing: "border-box" as const,
};

function InputBarContent() {
  return (
    <>
      <span style={{ flex: 1, fontSize: 15, color: "#9E9E9B", letterSpacing: "-0.005em", lineHeight: 1.6, userSelect: "none" }}>
        메세지 입력..
      </span>
      <div style={{ width: 36, height: 36, borderRadius: 9999, background: "#121211", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 13V3M8 3L3 8M8 3L13 8" stroke="#FDFDFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
}

// Desktop home content
function WebHomeContent() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [cloneRect, setCloneRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const onResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleStartChat = () => {
    if (navigating) return;
    const rect = inputRef.current?.getBoundingClientRect();
    if (rect) {
      setCloneRect({ top: rect.top, left: rect.left, width: rect.width });
    }
    setNavigating(true);
    setTimeout(() => router.push("/chat"), 540);
  };

  // 채팅 입력바의 최종 위치: 화면 하단 padding 24px + 입력바 높이 56px + 상단 padding 16px
  const targetTop = windowHeight ? windowHeight - 96 : 0;

  return (
    <>
      <div
        className="hidden md:flex"
        style={{
          width: "100%",
          height: "100dvh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          background: "#FDFDFC",
          padding: "48px 40px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* 이미지 + 텍스트: 페이드아웃 */}
        <motion.div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
          animate={{ opacity: navigating ? 0 : 1, scale: navigating ? 0.96 : 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/gamza/with-trashcan.png"
              alt="감자와 쓰레기통"
              width={320}
              height={320}
              priority
              style={{
                objectFit: "contain",
                filter: "drop-shadow(0 24px 48px rgba(18,18,17,0.14)) drop-shadow(0 8px 16px rgba(18,18,17,0.08))",
              }}
            />
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#121211", letterSpacing: "-0.03em", lineHeight: 1.25, margin: 0, textAlign: "center" }}>
              나쁜 감정은 바로 쓰레기통으로!
            </h1>
            <p style={{ fontSize: 15, fontWeight: 400, color: "#6E6E6B", lineHeight: 1.6, margin: 0, textAlign: "center" }}>
              판단 없이 받아 주는 AI 쓰레기통
            </p>
          </div>
        </motion.div>

        {/* 원본 입력바: 클론 띄운 순간 투명화 (공간은 유지) */}
        <div
          ref={inputRef}
          onClick={handleStartChat}
          style={{
            ...INPUT_BAR_STYLES,
            width: "100%",
            maxWidth: 480,
            cursor: "text",
            opacity: navigating ? 0 : 1,
          }}
        >
          <InputBarContent />
        </div>
      </div>

      {/* Fixed 클론: 원본 위치에서 하단으로 슬라이드 */}
      {navigating && cloneRect && (
        <motion.div
          initial={{ top: cloneRect.top }}
          animate={{ top: targetTop }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          style={{
            ...INPUT_BAR_STYLES,
            position: "fixed",
            left: cloneRect.left,
            width: cloneRect.width,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <InputBarContent />
        </motion.div>
      )}
    </>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <WebLayout sidebar={<WebSidebar activeItem="none" />}>
      {/* Mobile: 기존 코드 그대로 */}
      <main
        className="flex md:hidden"
        style={{
          width: "100%",
          height: "100dvh",
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
        {/* 앱 이름 */}
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#6E6E6B",
            letterSpacing: "-0.01em",
          }}
        >
          감바쓰
        </motion.span>

        {/* 3D 쓰레기통 — 둥실둥실 float */}
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
            <Image
              src="/trash-can.png"
              alt="쓰레기통"
              width={280}
              height={280}
              priority
              style={{ objectFit: "contain" }}
            />
          </motion.div>
        </motion.div>

        {/* 텍스트 + 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
            paddingInline: 32,
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#121211",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: 0,
              textAlign: "center",
            }}
          >
            나쁜 감정은
            <br />
            바로 쓰레기통으로!
          </h1>

          <p
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#3A3A38",
              lineHeight: 1.5,
              margin: 0,
              textAlign: "center",
            }}
          >
            판단 없이 받아 주는
            <br />
            AI 쓰레기통
          </p>

          <motion.button
            onClick={() => router.push("/chat")}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
              marginTop: 16,
              width: "100%",
              maxWidth: 360,
              padding: "18px 0",
              borderRadius: 9999,
              border: "none",
              background: "#121211",
              color: "#FDFDFC",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow:
                "0 1px 1px rgba(255,255,255,0.12) inset, 0 4px 16px rgba(18,18,17,0.25)",
            }}
          >
            <span style={{ fontSize: 18 }}>🗑</span>
            버리러가기
          </motion.button>
        </motion.div>
      </main>

      {/* Desktop: 새 WebHomeContent */}
      <WebHomeContent />
    </WebLayout>
  );
}
