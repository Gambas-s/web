"use client";

import { useRef, useState, useCallback, type CSSProperties } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { MessageDock } from "@/components/ui/message-dock";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface PostItData {
  id: number;
  style: CSSProperties;
  rotation: number;
  color: string;
  lines: string[];
}

const POST_ITS: PostItData[] = [
  {
    id: 1,
    style: { top: "8%", left: "4%" },
    rotation: -8,
    color: "#FFDF1E",
    lines: ["진짜 짜증나", "왜 이러는 거야"],
  },
  {
    id: 2,
    style: { top: "6%", right: "6%" },
    rotation: 5,
    color: "#FFB3C6",
    lines: ["스트레스", "죽겠어 진짜"],
  },
  {
    id: 3,
    style: { top: "42%", left: "2%" },
    rotation: -3,
    color: "#A8E6CF",
    lines: ["너무 힘들어"],
  },
  {
    id: 4,
    style: { bottom: "14%", left: "6%" },
    rotation: 7,
    color: "#B5D5F5",
    lines: ["왜 나만", "이래야 해"],
  },
  {
    id: 5,
    style: { bottom: "10%", right: "4%" },
    rotation: -5,
    color: "#FFD5A8",
    lines: ["이제 지쳤어"],
  },
  {
    id: 6,
    style: { top: "12%", left: "40%" },
    rotation: 3,
    color: "#FFDF1E",
    lines: ["아 몰라", "다 싫어"],
  },
];

// ─── TrashCan ──────────────────────────────────────────────────────────────────

function TrashCan({
  isOver,
  trashRef,
}: {
  isOver: boolean;
  trashRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={trashRef}
      style={{ position: "relative", width: 180, height: 180, zIndex: 3 }}
    >
      <motion.div
        animate={{ scale: isOver ? 1.18 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        {/* Metallic rim — conic gradient simulates cylindrical sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: isOver
              ? "conic-gradient(from 100deg, #EF4444 0%, #FCA5A5 20%, #EF4444 45%, #DC2626 70%, #EF4444 100%)"
              : "conic-gradient(from 100deg, #9CA3AF 0%, #E5E7EB 20%, #9CA3AF 45%, #6B7280 70%, #9CA3AF 100%)",
            boxShadow: isOver
              ? "0 20px 60px rgba(239,68,68,0.55), 0 4px 16px rgba(239,68,68,0.3)"
              : "0 20px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2)",
            transition: "background 0.25s, box-shadow 0.25s",
          }}
        />
        {/* Inner rim groove */}
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            background: isOver ? "#7F1D1D" : "#0F172A",
            boxShadow: "inset 0 6px 28px rgba(0,0,0,0.95)",
            transition: "background 0.25s",
          }}
        />
        {/* Opening void — looking down into the can */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: "50%",
            background: isOver
              ? "radial-gradient(ellipse at 38% 30%, #991B1B 0%, #450A0A 100%)"
              : "radial-gradient(ellipse at 38% 30%, #334155 0%, #020617 100%)",
            transition: "background 0.25s",
          }}
        />
        {/* Specular highlight */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 28% 22%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: -28,
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          opacity: isOver ? 0 : 1,
          transition: "opacity 0.2s",
        }}
      >
        여기에 버려
      </div>
    </div>
  );
}

// ─── PostItItem ────────────────────────────────────────────────────────────────

interface PostItItemProps {
  data: PostItData;
  trashRef: React.RefObject<HTMLDivElement | null>;
  isHidden: boolean;
  onDropped: () => void;
  onDragOverChange: (over: boolean) => void;
}

function PostItItem({
  data,
  trashRef,
  isHidden,
  onDropped,
  onDragOverChange,
}: PostItItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  const checkOverlap = useCallback(() => {
    const post = ref.current?.getBoundingClientRect();
    const trash = trashRef.current?.getBoundingClientRect();
    if (!post || !trash) return false;
    return !(
      post.right < trash.left ||
      post.left > trash.right ||
      post.bottom < trash.top ||
      post.top > trash.bottom
    );
  }, [trashRef]);

  const handleDrag = useCallback(() => {
    onDragOverChange(checkOverlap());
  }, [checkOverlap, onDragOverChange]);

  const handleDragEnd = useCallback(() => {
    setDragging(false);
    onDragOverChange(false);
    if (checkOverlap()) {
      onDropped();
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 28 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 28 });
    }
  }, [checkOverlap, onDropped, onDragOverChange, x, y]);

  return (
    <motion.div
      ref={ref}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      style={{
        x,
        y,
        position: "absolute",
        ...data.style,
        touchAction: "none",
        zIndex: dragging ? 10 : 2,
        cursor: dragging ? "grabbing" : "grab",
        pointerEvents: isHidden ? "none" : "auto",
      }}
      initial={{ opacity: 0, scale: 0.85, rotate: data.rotation }}
      animate={{
        opacity: isHidden ? 0 : 1,
        scale: isHidden ? 0.5 : 1,
        rotate: data.rotation,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onDragStart={() => setDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.06 }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          background: data.color,
          borderRadius: 4,
          boxShadow: dragging
            ? "0 20px 48px rgba(0,0,0,0.25)"
            : "3px 5px 18px rgba(0,0,0,0.18), 1px 2px 0 rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          userSelect: "none",
          position: "relative",
        }}
      >
        {/* Adhesive strip */}
        <div
          style={{
            height: 22,
            background: "rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        />
        {/* Lined content */}
        <div style={{ flex: 1, position: "relative", padding: "8px 12px" }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                top: 8 + i * 26,
                height: 1,
                background: "rgba(0,0,0,0.1)",
              }}
            />
          ))}
          <div style={{ position: "relative", zIndex: 1 }}>
            {data.lines.map((line, i) => (
              <p
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: "26px",
                  fontWeight: 500,
                  color: "#18181B",
                  margin: 0,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const trashRef = useRef<HTMLDivElement>(null);

  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [pendingDropId, setPendingDropId] = useState<number | null>(null);
  const [resetKeys, setResetKeys] = useState<Record<number, number>>({});
  const [showModal, setShowModal] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDropped = useCallback((id: number) => {
    setHiddenIds((prev) => new Set([...prev, id]));
    setPendingDropId(id);
    setShowModal(true);
  }, []);

  const handleCancel = () => {
    if (pendingDropId !== null) {
      setHiddenIds((prev) => {
        const n = new Set(prev);
        n.delete(pendingDropId);
        return n;
      });
      setResetKeys((prev) => ({
        ...prev,
        [pendingDropId]: (prev[pendingDropId] ?? 0) + 1,
      }));
    }
    setPendingDropId(null);
    setShowModal(false);
  };

  const handleConfirm = () => {
    setPendingDropId(null);
    setShowModal(false);
    setShowDock(true);
    setTimeout(() => router.push("/chat"), 600);
  };

  return (
    <main
      style={{
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Desk wood surface
        backgroundColor: "#C8A97A",
        backgroundImage: `
          repeating-linear-gradient(
            88deg,
            transparent 0px, transparent 30px,
            rgba(0,0,0,0.018) 30px, rgba(0,0,0,0.018) 31px
          ),
          repeating-linear-gradient(
            93deg,
            transparent 0px, transparent 80px,
            rgba(0,0,0,0.008) 80px, rgba(0,0,0,0.008) 81px
          )
        `,
      }}
    >
      {/* App label */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "-0.02em",
            textShadow: "0 1px 4px rgba(0,0,0,0.25)",
            margin: 0,
          }}
        >
          감바쓰
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            marginTop: 4,
            fontWeight: 400,
          }}
        >
          나쁜 감정은 쓰레기통으로
        </p>
      </div>

      {/* Center trash can */}
      <TrashCan isOver={isDraggingOver} trashRef={trashRef} />

      {/* Scattered post-its */}
      {POST_ITS.map((data) => (
        <PostItItem
          key={`${data.id}-${resetKeys[data.id] ?? 0}`}
          data={data}
          trashRef={trashRef}
          isHidden={hiddenIds.has(data.id)}
          onDropped={() => handleDropped(data.id)}
          onDragOverChange={setIsDraggingOver}
        />
      ))}

      {/* Confirm modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCancel}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                zIndex: 20,
              }}
            />
            <motion.div
              key="modal-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 21,
                pointerEvents: "none",
              }}
            >
              <motion.div
                initial={{ scale: 0.88, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.88, y: 20 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                style={{
                  pointerEvents: "all",
                  background: "#ffffff",
                  borderRadius: 24,
                  boxShadow: "0 8px 48px rgba(0,0,0,0.2)",
                  padding: "32px 28px 24px",
                  width: "min(340px, calc(100vw - 40px))",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#18181B",
                    margin: "0 0 8px",
                  }}
                >
                  버리시겠습니까?
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#71717A",
                    lineHeight: 1.5,
                    margin: "0 0 28px",
                  }}
                >
                  감정을 쓰레기통에 버리고 시작해봐
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: "13px 0",
                      borderRadius: 9999,
                      border: "1.5px solid #E4E4E7",
                      background: "#fff",
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: "pointer",
                      color: "#52525B",
                      fontFamily: "inherit",
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirm}
                    style={{
                      flex: 1,
                      padding: "13px 0",
                      borderRadius: 9999,
                      border: "none",
                      background: "#FFDF1E",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#18181B",
                      fontFamily: "inherit",
                    }}
                  >
                    버릴게요
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dock slide-up */}
      <AnimatePresence>
        {showDock && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
            }}
          >
            <MessageDock position="bottom" autoFocus />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
