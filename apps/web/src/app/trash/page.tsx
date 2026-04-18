"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function TrashContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = Math.max(1, parseInt(searchParams.get("count") ?? "1", 10));
  const [burned, setBurned] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setBurned((prev) => {
        const next = prev + 1;
        if (next >= total) {
          clearInterval(intervalRef.current!);
          router.push("/trash-fin");
        }
        return next;
      });
    }, 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [total, router]);

  const progress = Math.min(burned / total, 1);

  return (
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
          gap: 40,
          paddingInline: 24,
          paddingBottom: 60,
        }}
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#121211",
            letterSpacing: "-0.02em",
            margin: 0,
            textAlign: "center",
          }}
        >
          감정이 모두 불타는 중입니다..
        </p>

        {/* 뽀잉뽀잉 애니메이션 */}
        <motion.div
          animate={{
            scale: [1, 1.07, 0.94, 1.05, 0.97, 1],
            rotate: [0, -4, 3, -2, 1, 0],
            y: [0, -10, 3, -5, 1, 0],
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/bruning-trash-can.png"
            alt="불타는 쓰레기통"
            width={260}
            height={260}
            style={{ objectFit: "contain" }}
            priority
          />
        </motion.div>

        {/* 프로그레스 영역 */}
        <div
          style={{
            width: "100%",
            maxWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 9999,
              background: "#E2E2DF",
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              style={{
                height: "100%",
                borderRadius: 9999,
                background: "#121211",
                width: 0,
              }}
            />
          </div>
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#121211",
              letterSpacing: "-0.02em",
              margin: 0,
              textAlign: "center",
            }}
          >
            {burned} / {total} 소각됨
          </p>
        </div>
      </div>
    </main>
  );
}

export default function TrashPage() {
  return (
    <Suspense>
      <TrashContent />
    </Suspense>
  );
}
