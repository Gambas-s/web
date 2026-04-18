"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { MessageDock } from "@/components/ui/message-dock";

const POST_IT_SIZE = 180;
const INITIAL_STACK = 8;

// ─── TrashCan3D ───────────────────────────────────────────────────────────────
// Pseudo-3D cylinder viewed at ~75° elevation: oval rim + body with shading

function TrashCan3D({
  isOver,
  trashRef,
}: {
  isOver: boolean;
  trashRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    // Static wrapper — bounding rect used for drop detection, unaffected by scale
    <div
      ref={trashRef}
      style={{ position: "relative", width: 130, height: 195, zIndex: 3 }}
    >
      <motion.div
        animate={{ scale: isOver ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "center 62%",
        }}
      >
        {/* Cast shadow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "18%",
            right: "18%",
            height: 18,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.12)",
            filter: "blur(10px)",
            transform: "translateY(6px)",
          }}
        />

        {/* Cylinder body — horizontal gradient gives cylindrical sheen */}
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 0,
            right: 0,
            bottom: 14,
            borderRadius: "5px 5px 52% 52% / 5px 5px 14px 14px",
            background: isOver
              ? "linear-gradient(to right, #991B1B 0%, #EF4444 33%, #FCA5A5 50%, #EF4444 67%, #991B1B 100%)"
              : "linear-gradient(to right, #27272A 0%, #71717A 33%, #D1D5DB 50%, #71717A 67%, #27272A 100%)",
            overflow: "hidden",
            transition: "background 0.25s",
            boxShadow: isOver
              ? "0 12px 40px rgba(239,68,68,0.3)"
              : "0 12px 40px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Vertical specular highlight */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "44%",
              width: "13%",
              background: "rgba(255,255,255,0.14)",
            }}
          />
          {/* Horizontal ridges */}
          {[0.3, 0.58].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${pos * 100}%`,
                height: 4,
                background: "rgba(0,0,0,0.15)",
                boxShadow: "0 2px 0 rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        {/* Outer rim — top ellipse of the cylinder */}
        <div
          style={{
            position: "absolute",
            top: 13,
            left: -6,
            right: -6,
            height: 24,
            borderRadius: "50%",
            background: isOver
              ? "linear-gradient(to bottom, #FCA5A5, #DC2626)"
              : "linear-gradient(to bottom, #D4D4D8, #52525B)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.28)",
            zIndex: 2,
            transition: "background 0.25s",
          }}
        />

        {/* Opening — dark void inside the rim */}
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 3,
            right: 3,
            height: 20,
            borderRadius: "50%",
            background: isOver
              ? "radial-gradient(ellipse at 40% 38%, #7F1D1D, #3B0A0A)"
              : "radial-gradient(ellipse at 40% 38%, #18181B, #000)",
            boxShadow: "inset 0 5px 18px rgba(0,0,0,0.95)",
            zIndex: 3,
            transition: "background 0.25s",
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── PostItSheet ──────────────────────────────────────────────────────────────

function PostItSheet({
  trashRef,
  onDropped,
  onDragOverChange,
}: {
  trashRef: React.RefObject<HTMLDivElement | null>;
  onDropped: () => void;
  onDragOverChange: (v: boolean) => void;
}) {
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
        top: 0,
        left: 0,
        touchAction: "none",
        zIndex: dragging ? 20 : 8,
        cursor: dragging ? "grabbing" : "grab",
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onDragStart={() => setDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.04 }}
    >
      <div
        style={{
          width: POST_IT_SIZE,
          height: POST_IT_SIZE,
          background: "#F4F4F2", // sunken
          borderRadius: 4,
          boxShadow: dragging
            ? "0 20px 48px rgba(0,0,0,0.18)"
            : "2px 4px 14px rgba(0,0,0,0.1), 0 1px 0 rgba(0,0,0,0.05)",
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
            height: 20,
            background: "rgba(0,0,0,0.06)",
            flexShrink: 0,
          }}
        />
        {/* Lined content area */}
        <div style={{ flex: 1, position: "relative", padding: "10px 14px" }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                top: 10 + i * 26,
                height: 1,
                background: "rgba(0,0,0,0.09)",
              }}
            />
          ))}
          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                fontSize: 13,
                lineHeight: "26px",
                fontWeight: 500,
                color: "#3F3F46",
                margin: 0,
              }}
            >
              나쁜 감정은
            </p>
            <p
              style={{
                fontSize: 13,
                lineHeight: "26px",
                fontWeight: 500,
                color: "#3F3F46",
                margin: 0,
              }}
            >
              쓰레기통으로
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PostItStack ──────────────────────────────────────────────────────────────

function PostItStack({
  count,
  sheetKey,
  trashRef,
  onDropped,
  onDragOverChange,
}: {
  count: number;
  sheetKey: number;
  trashRef: React.RefObject<HTMLDivElement | null>;
  onDropped: () => void;
  onDragOverChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: POST_IT_SIZE,
        height: POST_IT_SIZE + count * 2 + 12,
      }}
    >
      {/* Visible layer edges — simulates notepad thickness */}
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: POST_IT_SIZE + i * 2,
            left: i * 0.3,
            right: -i * 0.3,
            height: 2,
            background: i % 2 === 0 ? "#DCDCE0" : "#E8E8EA",
            borderRadius: "0 0 1px 1px",
          }}
        />
      ))}
      {/* Cardboard backing */}
      <div
        style={{
          position: "absolute",
          top: POST_IT_SIZE + count * 2,
          left: 2,
          right: -2,
          height: 8,
          background: "#C4C4C0",
          borderRadius: "0 0 3px 3px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      />
      {/* Draggable top sheet */}
      <AnimatePresence mode="wait">
        {count > 0 && (
          <PostItSheet
            key={sheetKey}
            trashRef={trashRef}
            onDropped={onDropped}
            onDragOverChange={onDragOverChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const trashRef = useRef<HTMLDivElement>(null);

  const [stackCount, setStackCount] = useState(INITIAL_STACK);
  const [sheetKey, setSheetKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDropped = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCancel = () => {
    setShowModal(false);
    setSheetKey((k) => k + 1); // remount sheet at origin
  };

  const handleConfirm = () => {
    setStackCount((c) => Math.max(0, c - 1));
    setSheetKey((k) => k + 1);
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        background: "#FDFDFC", // paper — design system page background
      }}
    >
      {/* App title */}
      <div style={{ textAlign: "center", pointerEvents: "none", zIndex: 1 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#121211",
            letterSpacing: "-0.025em",
            margin: 0,
          }}
        >
          감바쓰
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#6E6E6B",
            marginTop: 6,
            fontWeight: 400,
          }}
        >
          나쁜 감정은 쓰레기통으로
        </p>
      </div>

      {/* Main scene: post-it pad + trash can side by side */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 64 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <PostItStack
            count={stackCount}
            sheetKey={sheetKey}
            trashRef={trashRef}
            onDropped={handleDropped}
            onDragOverChange={setIsDraggingOver}
          />
          <p style={{ fontSize: 12, color: "#9E9E9B", margin: 0, fontFamily: "inherit" }}>
            드래그해서 버려
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <TrashCan3D isOver={isDraggingOver} trashRef={trashRef} />
          <p style={{ fontSize: 12, color: "#9E9E9B", margin: 0, fontFamily: "inherit" }}>
            여기에 버려
          </p>
        </div>
      </div>

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
                background: "rgba(0,0,0,0.25)",
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
                  boxShadow: "0 8px 48px rgba(0,0,0,0.15)",
                  padding: "32px 28px 24px",
                  width: "min(340px, calc(100vw - 40px))",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#121211",
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  버리시겠습니까?
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6E6E6B",
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
                      border: "1px solid rgba(17,17,15,0.08)",
                      background: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: "pointer",
                      color: "#3A3A38",
                      fontFamily: "inherit",
                      boxShadow: "0 1px 2px rgba(17,17,15,0.06), 0 4px 10px rgba(17,17,15,0.08)",
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
                      border: "1px solid #000",
                      background: "#121211",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#FDFDFC",
                      fontFamily: "inherit",
                      boxShadow: "0 1px 1px rgba(255,255,255,0.15) inset, 0 2px 4px rgba(17,17,15,0.15), 0 8px 20px rgba(17,17,15,0.18)",
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

      {/* MessageDock slide-up */}
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
