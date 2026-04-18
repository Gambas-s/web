"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TrashFinPage() {
  const router = useRouter();

  return (
    <main
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#FDFDFC",
      }}
    >
      {/* 헤더 */}
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
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#121211",
            letterSpacing: "-0.02em",
          }}
        >
          감바쓰
        </span>
      </header>

      {/* 본문 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          paddingInline: 24,
          paddingBottom: 40,
        }}
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
        >
          <Image
            src="/trash-can.png"
            alt="빈 쓰레기통"
            width={240}
            height={240}
            style={{ objectFit: "contain" }}
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
          style={{ textAlign: "center" }}
        >
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#121211",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            깨끗해졌어요!!
          </p>
        </motion.div>
      </div>

      {/* 버튼 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1], delay: 0.45 }}
        style={{
          width: "100%",
          padding: "0 24px",
          paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button
          aria-label="한번 더"
          onClick={() => router.push("/chat")}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 9999,
            border: "none",
            background: "#121211",
            color: "#FDFDFC",
            fontSize: 17,
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
            height: 56,
            borderRadius: 9999,
            border: "none",
            background: "#F4F4F2",
            color: "#121211",
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          홈으로
        </button>
      </motion.div>
    </main>
  );
}
