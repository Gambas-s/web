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

export default function Home() {
  const router = useRouter();
  const trashRef = useRef<HTMLDivElement>(null);
  const postItRef = useRef<HTMLDivElement>(null);

  const [postItVisible, setPostItVisible] = useState(true);
  const [postItKey, setPostItKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const checkOverlap = useCallback(() => {
    const postRect = postItRef.current?.getBoundingClientRect();
    const trashRect = trashRef.current?.getBoundingClientRect();
    if (!postRect || !trashRect) return false;
    return !(
      postRect.right < trashRect.left ||
      postRect.left > trashRect.right ||
      postRect.bottom < trashRect.top ||
      postRect.top > trashRect.bottom
    );
  }, []);

  const handleDrag = useCallback(() => {
    setIsDraggingOver(checkOverlap());
  }, [checkOverlap]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingOver(false);
    if (checkOverlap()) {
      setPostItVisible(false);
      setShowModal(true);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 28 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 28 });
    }
  }, [checkOverlap, x, y]);

  const handleCancel = () => {
    x.set(0);
    y.set(0);
    setShowModal(false);
    setPostItKey((k) => k + 1);
    setPostItVisible(true);
  };

  const handleConfirm = () => {
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAFA",
        position: "relative",
      }}
    >
      {/* App title */}
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#18181B",
          marginBottom: 40,
          letterSpacing: "-0.02em",
        }}
      >
        감바쓰
      </motion.h1>

      {/* Post-it */}
      <AnimatePresence>
        {postItVisible && (
          <motion.div
            key={postItKey}
            ref={postItRef}
            drag
            dragMomentum={false}
            dragElastic={0.08}
            style={{ x, y, touchAction: "none", zIndex: 5, cursor: "grab" }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.65, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
          >
            <div
              style={{
                width: 220,
                minHeight: 220,
                background: "var(--color-accent, #FFDF1E)",
                borderRadius: "var(--radius-xl, 24px)",
                boxShadow: "var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.07))",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                userSelect: "none",
              }}
            >
              {/* Ruled line decoration */}
              <div
                style={{
                  height: 8,
                  background: "rgba(0,0,0,0.07)",
                  borderRadius: 4,
                  width: "55%",
                  marginBottom: 16,
                }}
              />
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  fontWeight: 500,
                  color: "#18181B",
                  flex: 1,
                }}
              >
                나쁜 감정은 여기에 써봐.
                <br />
                다 쓰면 쓰레기통에 버려.
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#52525B",
                  marginTop: 16,
                  fontWeight: 500,
                }}
              >
                감바쓰
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trash zone */}
      <div
        ref={trashRef}
        style={{
          position: "absolute",
          bottom: 48,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 4,
        }}
      >
        <motion.div
          animate={{ scale: isDraggingOver ? 1.4 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{ fontSize: 48, lineHeight: 1, userSelect: "none" }}
        >
          {isDraggingOver ? "🔥" : "🗑️"}
        </motion.div>
        <p
          style={{
            fontSize: 12,
            color: "#71717A",
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          여기에 버려
        </p>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
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
                zIndex: 10,
              }}
            />
            {/* Modal */}
            <motion.div
              key="modal-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 11,
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
                  borderRadius: "var(--radius-xl, 24px)",
                  boxShadow: "var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.07))",
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
                    marginBottom: 8,
                  }}
                >
                  버리시겠습니까?
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#71717A",
                    marginBottom: 28,
                    lineHeight: 1.5,
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
                      background: "var(--color-accent, #FFDF1E)",
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
              zIndex: 20,
            }}
          >
            <MessageDock position="bottom" autoFocus />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
