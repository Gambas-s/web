"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WebLayout } from "@/components/web/WebLayout";
import WebSidebar from "@/components/web/WebSidebar";

// Desktop home content
function WebHomeContent() {
  const router = useRouter();

  return (
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
      }}
    >
      {/* 이미지 — 둥실둥실 float */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/gamza/with-trashcan.png"
          alt="감자와 쓰레기통"
          width={260}
          height={260}
          priority
          style={{ objectFit: "contain" }}
        />
      </motion.div>

      {/* 텍스트 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#121211",
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
            margin: 0,
            textAlign: "center",
          }}
        >
          나쁜 감정은 바로 쓰레기통으로!
        </h1>

        <p
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: "#6E6E6B",
            lineHeight: 1.6,
            margin: 0,
            textAlign: "center",
          }}
        >
          판단 없이 받아 주는 AI 쓰레기통
        </p>
      </div>

      {/* 입력 바 */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 10px 10px 20px",
          borderRadius: 9999,
          background: "#FFFFFF",
          boxShadow:
            "0 0 0 1px #E2E2DF, 0 2px 8px rgba(18,18,17,0.06)",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 15,
            color: "#9E9E9B",
            letterSpacing: "-0.005em",
            lineHeight: 1.6,
            cursor: "text",
            userSelect: "none",
          }}
          onClick={() => router.push("/chat")}
        >
          메세지 입력..
        </span>

        {/* 전송 버튼 */}
        <motion.button
          onClick={() => router.push("/chat")}
          whileTap={{ scale: 0.93 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: "#121211",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="채팅 시작"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 13V3M8 3L3 8M8 3L13 8"
              stroke="#FDFDFC"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <WebLayout sidebar={<WebSidebar activeItem="new" />}>
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
