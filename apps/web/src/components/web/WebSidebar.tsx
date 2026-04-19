"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export type SidebarActiveItem = "new" | "list" | "history";

interface WebSidebarProps {
  activeItem: SidebarActiveItem;
  crumpledCount?: number;
  onTrashClick?: () => void;
}

const MOCK_TIMER = "14 : 23 : 01";
const MOCK_USER = { name: "나는야 주인", totalBurned: 1234, streak: 21 };

const NAV_ITEMS = [
  { id: "new" as SidebarActiveItem, icon: "+", label: "새 쓰레기통", href: "/" },
  { id: "list" as SidebarActiveItem, icon: "≡", label: "쓰레기통 내역", href: "/chat" },
  { id: "history" as SidebarActiveItem, icon: "⏰", label: "소각 기록", href: "/trash-fin" },
];

export default function WebSidebar({
  activeItem,
  crumpledCount = 0,
  onTrashClick,
}: WebSidebarProps) {
  const router = useRouter();
  const trashControls = useAnimation();

  useEffect(() => {
    if (crumpledCount > 0) {
      trashControls.start({
        rotate: [0, -8, 8, -6, 6, -3, 3, 0],
        scale: [1, 1.05, 1.05, 1.03, 1.03, 1.01, 1.01, 1],
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      });
    }
  }, [crumpledCount, trashControls]);

  return (
    <aside
      style={{
        width: 270,
        height: "100dvh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        borderRight: "1px solid #E2E2DF",
        padding: "32px 20px 24px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#121211",
          letterSpacing: "-0.03em",
          marginBottom: 28,
          lineHeight: 1.1,
        }}
      >
        감바쓰
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: isActive ? "#F4F4F2" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "background 180ms cubic-bezier(0.32,0.72,0,1)",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: isActive ? "#121211" : "#6E6E6B",
                  width: 20,
                  textAlign: "center",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#121211" : "#6E6E6B",
                  letterSpacing: "-0.005em",
                  lineHeight: 1.6,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Center area — trash can */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.button
          type="button"
          aria-label={crumpledCount > 0 ? "쓰레기 버리기" : undefined}
          onClick={crumpledCount > 0 ? onTrashClick : undefined}
          style={{
            position: "relative",
            width: 120,
            height: 120,
            cursor: crumpledCount > 0 ? "pointer" : "default",
            background: "none",
            border: "none",
            padding: 0,
          }}
          animate={trashControls}
        >
          <motion.div style={{ width: "100%", height: "100%" }}>
            <Image
              src="/trash-can.png"
              alt="쓰레기통"
              width={120}
              height={120}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </motion.div>

          {/* Badge */}
          {crumpledCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 22,
                height: 22,
                borderRadius: 9999,
                background: "#121211",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FDFDFC",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {crumpledCount}
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Bottom section */}
      <div
        style={{
          borderTop: "1px solid #E2E2DF",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Timer label */}
        <span
          style={{
            fontSize: 11,
            color: "#9E9E9B",
            letterSpacing: "0.01em",
            lineHeight: 1.4,
          }}
        >
          다음 자동 소각까지
        </span>

        {/* Timer value */}
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#121211",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.02em",
            lineHeight: 1.3,
            marginBottom: 12,
          }}
        >
          {MOCK_TIMER}
        </span>

        {/* User profile button */}
        <button
          aria-label="사용자 프로필"
          onClick={() => {}}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "#F4F4F2",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <Image
            src="/gamza_profile.png"
            alt="프로필"
            width={36}
            height={36}
            style={{
              borderRadius: 9999,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#121211",
                letterSpacing: "-0.005em",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {MOCK_USER.name}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#6E6E6B",
                letterSpacing: "0em",
                lineHeight: 1.4,
              }}
            >
              소각 {MOCK_USER.totalBurned.toLocaleString()}개 · {MOCK_USER.streak}일 연속
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
