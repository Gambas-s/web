"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { WebLayout } from "@/components/web/WebLayout";
import WebSidebar from "@/components/web/WebSidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const BASE_SPEED = 1200;
const MIN_SPEED = 150;
const SPEED_STEP = 150;

function TrashCan({ size, onClick, controls }: { size: number; onClick: () => void; controls: ReturnType<typeof useAnimation> }) {
  return (
    <motion.div
      onClick={onClick}
      animate={controls}
      style={{ cursor: "pointer", userSelect: "none", WebkitUserSelect: "none" }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        animate={{
          scaleX: [1, 0.93, 1.07, 0.96, 1.03, 1],
          scaleY: [1, 1.07, 0.94, 1.03, 0.98, 1],
          y: [0, 2, -4, 1, -1, 0],
        }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.1 }}
      >
        <Image
          src="/bruning-trash-can.png"
          alt="불타는 쓰레기통"
          width={size}
          height={size}
          style={{ objectFit: "contain", pointerEvents: "none" }}
          priority
        />
      </motion.div>
    </motion.div>
  );
}

function HintText({ tapped }: { tapped: boolean }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={tapped ? "tapped" : "hint"}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        style={{ fontSize: 13, color: "#9E9E9B", margin: 0, textAlign: "center", letterSpacing: "-0.005em" }}
      >
        {tapped ? "🔥 빨라지고 있어요!" : "연타하면 더 빨리 타요"}
      </motion.p>
    </AnimatePresence>
  );
}

function TrashContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = Math.max(1, parseInt(searchParams.get("count") ?? "1", 10) || 1);
  const [burned, setBurned] = useState(0);
  const [tapped, setTapped] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burnedRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);
  const doneRef = useRef(false);
  const trashControls = useAnimation();

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      burnedRef.current += 1;
      setBurned(burnedRef.current);
      if (burnedRef.current >= total) {
        clearInterval(intervalRef.current!);
        doneRef.current = true;
        const sessionId = localStorage.getItem("gambass_session_id");
        if (sessionId) {
          fetch(`${API_URL}/api/session?sessionId=${sessionId}`, { method: "DELETE" }).catch(() => {});
          localStorage.removeItem("gambass_session_id");
        }
        timeoutRef.current = setTimeout(() => router.push("/trash-fin"), 3000);
      }
    }, speedRef.current);
  }, [total, router]);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startInterval]);

  const handleTap = useCallback(() => {
    if (doneRef.current) return;
    speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_STEP);
    startInterval();
    setTapped(true);
    trashControls.start({
      scale: [1, 1.15, 0.9, 1.08, 0.97, 1],
      rotate: [0, -8, 7, -4, 2, 0],
      transition: { duration: 0.4, ease: "easeOut" },
    });
  }, [startInterval, trashControls]);

  const progress = Math.min(burned / total, 1);

  return (
    <WebLayout sidebar={<WebSidebar activeItem="list" hideTrash />}>
      {/* 모바일 */}
      <main
        className="md:hidden"
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
        <header
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 56,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: "#121211", letterSpacing: "-0.02em" }}>
            감바쓰
          </span>
        </header>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            paddingInline: 24,
            paddingBottom: 60,
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
            감정이 모두 불타는 중입니다..
          </p>

          <TrashCan size={260} onClick={handleTap} controls={trashControls} />

          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ width: "100%", height: 8, borderRadius: 9999, background: "#E2E2DF", overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                style={{ height: "100%", borderRadius: 9999, background: "#121211", width: 0 }}
              />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
              {burned} / {total} 소각됨
            </p>
            <HintText tapped={tapped} />
          </div>
        </div>
      </main>

      {/* 데스크탑 */}
      <div
        className="hidden md:flex flex-col"
        style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#FDFDFC", gap: 32 }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
          감정이 모두 불타는 중입니다..
        </p>

        <TrashCan size={300} onClick={handleTap} controls={trashControls} />

        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ width: "100%", height: 8, borderRadius: 9999, background: "#E2E2DF", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              style={{ height: "100%", borderRadius: 9999, background: "#121211", width: 0 }}
            />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#121211", letterSpacing: "-0.02em", margin: 0, textAlign: "center" }}>
            {burned} / {total} 소각됨
          </p>
          <HintText tapped={tapped} />
        </div>
      </div>
    </WebLayout>
  );
}

export default function TrashPage() {
  return (
    <Suspense fallback={<div style={{ width: "100%", height: "100dvh", background: "#FDFDFC" }} />}>
      <TrashContent />
    </Suspense>
  );
}
