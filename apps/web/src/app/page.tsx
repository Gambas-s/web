"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 52,
        paddingBottom: 48,
        background: "#FDFDFC",
        boxSizing: "border-box",
      }}
    >
      {/* 앱 이름 */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#6E6E6B",
          letterSpacing: "-0.01em",
        }}
      >
        감바쓰
      </span>

      {/* 3D 쓰레기통 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image
          src="/trash-can.png"
          alt="쓰레기통"
          width={280}
          height={280}
          priority
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* 텍스트 + 버튼 */}
      <div
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

        <button
          onClick={() => router.push("/chat")}
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
        </button>
      </div>
    </main>
  );
}
