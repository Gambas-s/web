import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "../useLongPress";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe("useLongPress", () => {
  test("500ms 이상 누르면 onLongPress가 호출된다", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, duration: 500 }));

    act(() => { result.current.onPointerDown(); });
    act(() => { vi.advanceTimersByTime(500); });

    expect(onLongPress).toHaveBeenCalledOnce();
  });

  test("500ms 이전에 취소하면 onLongPress가 호출되지 않는다", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, duration: 500 }));

    act(() => { result.current.onPointerDown(); });
    act(() => { vi.advanceTimersByTime(300); });
    act(() => { result.current.onPointerUp(); });
    act(() => { vi.advanceTimersByTime(500); });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  test("onPointerDown 시 isPressing이 true가 된다", () => {
    const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn(), duration: 500 }));

    act(() => { result.current.onPointerDown(); });

    expect(result.current.isPressing).toBe(true);
  });

  test("onPointerUp 시 isPressing이 false가 된다", () => {
    const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn(), duration: 500 }));

    act(() => { result.current.onPointerDown(); });
    act(() => { result.current.onPointerUp(); });

    expect(result.current.isPressing).toBe(false);
  });

  test("disabled 상태에서는 onLongPress가 호출되지 않는다", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, duration: 500, disabled: true }));

    act(() => { result.current.onPointerDown(); });
    act(() => { vi.advanceTimersByTime(500); });

    expect(onLongPress).not.toHaveBeenCalled();
  });
});
