import { useState, useRef, useCallback } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  duration?: number;
  disabled?: boolean;
}

export function useLongPress({
  onLongPress,
  duration = 500,
  disabled = false,
}: UseLongPressOptions) {
  const [isPressing, setIsPressing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    setIsPressing(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onPointerDown = useCallback(() => {
    if (disabled) return;
    setIsPressing(true);
    timer.current = setTimeout(() => {
      setIsPressing(false);
      onLongPress();
    }, duration);
  }, [disabled, duration, onLongPress]);

  const onPointerUp = cancel;
  const onPointerLeave = cancel;
  const onPointerCancel = cancel;

  return { isPressing, onPointerDown, onPointerUp, onPointerLeave, onPointerCancel };
}
