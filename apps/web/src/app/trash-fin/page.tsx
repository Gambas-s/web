"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { WebLayout } from "@/components/web/WebLayout";
import WebSidebar from "@/components/web/WebSidebar";

const MOCK_STATS = { totalBurned: 320, streak: 21, avgPerDay: 12.3 };

export default function TrashFinPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  return (
    <WebLayout sidebar={<WebSidebar activeItem="none" hideTrash />}>
    <main
      className="flex flex-col md:hidden"
      style={{
        width: "100%",
        height: "100dvh",
        alignItems: "center",
        justifyContent: "center",
        background: "#FDFDFC",
        paddingInline: 24,
        paddingBlock: 40,
        gap: 24,
        overflowY: "auto",
      }}
    >
        <motion.div
          initial={{ scale: 0.3, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          >
            <Image
              src="/trash-can.png"
              alt="빈 쓰레기통"
              width={220}
              height={220}
              style={{ objectFit: "contain" }}
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
          style={{ textAlign: "center" }}
        >
          <p style={{ fontSize: 22, fontWeight: 700, color: "#121211", letterSpacing: "-0.03em", margin: 0 }}>
            깨끗해졌어요!!
          </p>
        </motion.div>

        {/* 스탯 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
          style={{ width: "100%", background: "#F4F4F2", borderRadius: 20, padding: "20px 0" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { label: "누적 쓰레기 수", value: MOCK_STATS.totalBurned.toLocaleString(), unit: "개" },
              { label: "스트릭", value: MOCK_STATS.streak, unit: "일" },
              { label: "평균", value: MOCK_STATS.avgPerDay, unit: "개/일" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center", padding: "12px 8px", borderRight: i < 2 ? "1px solid #E2E2DF" : "none" }}>
                <p style={{ fontSize: 11, color: "#6E6E6B", margin: "0 0 6px", letterSpacing: "-0.005em" }}>{stat.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#121211", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {stat.value}<span style={{ fontSize: 13, fontWeight: 500 }}>{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 버튼 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
          style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}
        >
          <button
            aria-label="한번 더"
            onClick={() => router.push("/chat")}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 9999,
              border: "none",
              background: "#121211",
              color: "#FDFDFC",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            한번 더
          </button>
          <button
            aria-label="홈으로"
            onClick={() => router.push("/")}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 9999,
              border: "none",
              background: "#F4F4F2",
              color: "#121211",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            홈으로
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 13, fontWeight: 700, color: "#9E9E9B", fontVariantNumeric: "tabular-nums" }}
              >
                {countdown}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.div>
    </main>

    {/* 데스크톱 레이아웃 */}
    <div
      className="hidden md:flex"
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        background: "#FDFDFC",
        paddingInline: 40,
      }}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        >
          <Image
            src="/trash-can.png"
            alt="빈 쓰레기통"
            width={260}
            height={260}
            style={{ objectFit: "contain" }}
            priority
          />
        </motion.div>
      </motion.div>

      <p
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#121211",
          letterSpacing: "-0.03em",
          margin: 0,
        }}
      >
        깨끗해졌어요!!
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#F4F4F2",
          borderRadius: 20,
          padding: "20px 0",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { label: "누적 쓰레기 수", value: MOCK_STATS.totalBurned.toLocaleString(), unit: "개" },
            { label: "스트릭", value: MOCK_STATS.streak, unit: "일" },
            { label: "평균", value: MOCK_STATS.avgPerDay, unit: "개/일" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                padding: "12px 16px",
                borderRight: i < 2 ? "1px solid #E2E2DF" : "none",
              }}
            >
              <p style={{ fontSize: 12, color: "#6E6E6B", margin: "0 0 8px", letterSpacing: "-0.005em" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: "#121211", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {stat.value}
                <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ maxWidth: 440, width: "100%", display: "flex", flexDirection: "row", gap: 8 }}>
        <motion.button
          onClick={() => router.push("/")}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            flex: 1,
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          홈으로
          <AnimatePresence mode="wait">
            <motion.span
              key={countdown}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 14, fontWeight: 700, color: "#9E9E9B", fontVariantNumeric: "tabular-nums" }}
            >
              {countdown}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <motion.button
          onClick={() => router.push("/chat")}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            flex: 1,
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
          한번 더
        </motion.button>
      </div>
    </div>
    </WebLayout>
  );
}
