"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WebLayout } from "@/components/web/WebLayout";
import WebSidebar from "@/components/web/WebSidebar";

export default function LogPage() {
  const router = useRouter();

  return (
    <WebLayout sidebar={<WebSidebar activeItem="history" hideTrash />}>
      {/* 모바일 */}
      <main
        className="md:hidden"
        style={{
          width: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFDFC",
          gap: 16,
          paddingInline: 24,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          style={{ fontSize: 17, fontWeight: 700, color: "#121211", letterSpacing: "-0.02em", margin: 0 }}
        >
          소각 기록
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1], delay: 0.08 }}
          style={{ fontSize: 15, color: "#6E6E6B", letterSpacing: "-0.005em", margin: 0, textAlign: "center" }}
        >
          아직 준비 중이에요.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          onClick={() => router.push("/chat")}
          style={{
            marginTop: 8,
            height: 44,
            paddingInline: 28,
            borderRadius: 9999,
            border: "none",
            background: "#F4F4F2",
            color: "#121211",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          쓰레기통으로
        </motion.button>
      </main>

      {/* 데스크탑 */}
      <div
        className="hidden md:flex flex-col"
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFDFC",
          gap: 12,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          style={{ fontSize: 22, fontWeight: 700, color: "#121211", letterSpacing: "-0.03em", margin: 0 }}
        >
          소각 기록
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1], delay: 0.08 }}
          style={{ fontSize: 16, color: "#6E6E6B", letterSpacing: "-0.005em", margin: 0 }}
        >
          아직 준비 중이에요.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/chat")}
          style={{
            marginTop: 8,
            height: 48,
            paddingInline: 32,
            borderRadius: 9999,
            border: "none",
            background: "#F4F4F2",
            color: "#121211",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          쓰레기통으로
        </motion.button>
      </div>
    </WebLayout>
  );
}
