import React from "react";
import { expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockRouter = { push: mockPush };
const mockQuery = new Map<string, string>();
let attemptSequence = 0;
let currentAttemptId = "";
let currentSessionId = "";

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({ get: (key: string) => mockQuery.get(key) ?? null }),
}));

vi.mock("@/components/web/WebLayout", () => ({
  WebLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/web/WebSidebar", () => ({
  default: () => null,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, style }: {
    src?: string; alt?: string; width?: number; height?: number; style?: React.CSSProperties;
  }) => <img src={src} alt={alt} width={width} height={height} style={style} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, layout: _l, style: _s, ...p }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) =>
      <div {...p}>{children}</div>,
    img: ({ animate: _a, initial: _i, transition: _t, style: _s, src, alt, ...p }: React.ImgHTMLAttributes<HTMLImageElement> & Record<string, unknown>) =>
      <img src={src as string} alt={alt} {...p} />,
    p: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, ...p }: React.HTMLAttributes<HTMLParagraphElement> & Record<string, unknown>) =>
      <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
  animate: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.useFakeTimers();
  mockPush.mockClear();
  const storedValues = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storedValues.get(key) ?? null,
    setItem: (key: string, value: string) => { storedValues.set(key, value); },
    removeItem: (key: string) => { storedValues.delete(key); },
    clear: () => { storedValues.clear(); },
    key: (index: number) => Array.from(storedValues.keys())[index] ?? null,
    get length() { return storedValues.size; },
  } satisfies Storage);
  mockQuery.clear();
  currentAttemptId = `attempt-${++attemptSequence}`;
  currentSessionId = `test-session-${attemptSequence}`;
  mockQuery.set("burnAttemptId", currentAttemptId);
  localStorage.setItem("gambass_session_id", currentSessionId);
  localStorage.setItem("gambass_burn_attempt", JSON.stringify({
    id: currentAttemptId,
    sessionId: currentSessionId,
    selectedMessages: [
      { messageId: "user-1", author: "user", order: 1 },
      { messageId: "ai-1", author: "ai", order: 1 },
      { messageId: "user-2", author: "user", order: 2 },
    ],
  }));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    success: true,
    status: "deleted",
  }))));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  cleanup();
});

import TrashPage from "../page";

test("소각 중 텍스트와 이미지가 표시된다", () => {
  render(<TrashPage />);
  expect(screen.getAllByText(/감정이 모두 불타는 중입니다/)[0]).toBeDefined();
  expect(screen.getAllByAltText("불타는 쓰레기통")[0]).toBeDefined();
});

test("초기 소각 진행 텍스트가 '0 / 3 소각됨'으로 표시된다", () => {
  render(<TrashPage />);
  expect(screen.getAllByText(/0 \/ 3 소각됨/)[0]).toBeDefined();
});

test("1200ms 후 소각 진행이 1로 증가한다", () => {
  render(<TrashPage />);
  act(() => { vi.advanceTimersByTime(1200); });
  expect(screen.getAllByText(/1 \/ 3 소각됨/)[0]).toBeDefined();
  expect(localStorage.getItem("gambass_burn_stats")).toBeNull();
});

test("소각과 삭제가 성공한 뒤 3초 대기 후 /trash-fin으로 이동한다", async () => {
  render(<TrashPage />);
  await act(async () => { await vi.advanceTimersByTimeAsync(1200 * 3); });
  expect(JSON.parse(localStorage.getItem("gambass_burn_stats") ?? "null")).toEqual({
    totalBurned: 3,
    appliedAttemptIds: [currentAttemptId],
  });
  expect(mockPush).not.toHaveBeenCalled();
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(mockPush).toHaveBeenCalledWith("/trash-fin");
});

test("저장된 선택 정보와 소각 시도 식별자로 삭제를 요청한다", async () => {
  render(<TrashPage />);

  await act(async () => { await vi.advanceTimersByTimeAsync(1200 * 3); });

  expect(fetch).toHaveBeenCalledWith(
    expect.stringMatching(new RegExp(`/api/session\\?sessionId=${currentSessionId}&burnAttemptId=${currentAttemptId}$`)),
    { method: "DELETE" },
  );
});

test("count 쿼리만 있고 저장된 소각 시도가 없으면 소각이나 삭제를 시작하지 않는다", () => {
  mockQuery.clear();
  mockQuery.set("count", "3");
  localStorage.removeItem("gambass_burn_attempt");

  render(<TrashPage />);
  act(() => { vi.advanceTimersByTime(10000); });

  expect(screen.getByRole("alert").textContent).toContain("선택한 메시지");
  expect(fetch).not.toHaveBeenCalled();
  expect(mockPush).not.toHaveBeenCalled();
});

test("삭제 응답 전에는 애니메이션이 끝나도 완료 화면으로 이동하지 않는다", async () => {
  let resolveDelete!: (response: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(() => new Promise((resolve) => {
    resolveDelete = resolve;
  }));
  render(<TrashPage />);

  await act(async () => { await vi.advanceTimersByTimeAsync(1200 * 3 + 5000); });
  expect(localStorage.getItem("gambass_burn_stats")).toBeNull();
  expect(mockPush).not.toHaveBeenCalled();

  await act(async () => {
    resolveDelete(new Response(JSON.stringify({ success: true, status: "deleted" })));
    await Promise.resolve();
  });
  await act(async () => { await vi.advanceTimersByTimeAsync(2999); });
  expect(JSON.parse(localStorage.getItem("gambass_burn_stats") ?? "null").totalBurned).toBe(3);
  expect(mockPush).not.toHaveBeenCalled();
  await act(async () => { await vi.advanceTimersByTimeAsync(1); });
  expect(mockPush).toHaveBeenCalledWith("/trash-fin");
});

test("삭제 전 네트워크 실패 시 세션과 선택 데이터를 유지하고 동일한 식별자로 다시 시도한다", async () => {
  const storedAttempt = localStorage.getItem("gambass_burn_attempt");
  vi.mocked(fetch)
    .mockRejectedValueOnce(new TypeError("network unavailable"))
    .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, status: "deleted" })));
  render(<TrashPage />);

  await act(async () => { await vi.advanceTimersByTimeAsync(1200 * 3); });

  expect(screen.getAllByRole("button", { name: "다시 시도" })[0]).toBeDefined();
  expect(localStorage.getItem("gambass_burn_stats")).toBeNull();
  expect(localStorage.getItem("gambass_session_id")).toBe(currentSessionId);
  expect(localStorage.getItem("gambass_burn_attempt")).toBe(storedAttempt);

  await act(async () => {
    fireEvent.click(screen.getAllByRole("button", { name: "다시 시도" })[0]);
    await Promise.resolve();
  });

  expect(fetch).toHaveBeenCalledTimes(2);
  expect(vi.mocked(fetch).mock.calls[0][0]).toBe(vi.mocked(fetch).mock.calls[1][0]);
  expect(JSON.parse(localStorage.getItem("gambass_burn_stats") ?? "null")).toEqual({
    totalBurned: 3,
    appliedAttemptIds: [currentAttemptId],
  });
  expect(localStorage.getItem("gambass_session_id")).toBeNull();
  expect(localStorage.getItem("gambass_burn_attempt")).toBeNull();
});

test("삭제 성공 응답이 유실되어도 같은 시도로 복구하고 한 번만 합산한다", async () => {
  vi.mocked(fetch)
    .mockRejectedValueOnce(new TypeError("response lost after delete"))
    .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, status: "already_deleted" })));
  render(<TrashPage />);

  await act(async () => { await vi.advanceTimersByTimeAsync(1200 * 3); });

  expect(localStorage.getItem("gambass_burn_stats")).toBeNull();
  expect(localStorage.getItem("gambass_session_id")).toBe(currentSessionId);
  expect(JSON.parse(localStorage.getItem("gambass_burn_attempt") ?? "null").id).toBe(currentAttemptId);

  await act(async () => {
    fireEvent.click(screen.getAllByRole("button", { name: "다시 시도" })[0]);
    await Promise.resolve();
  });

  expect(vi.mocked(fetch).mock.calls[0][0]).toBe(vi.mocked(fetch).mock.calls[1][0]);
  expect(JSON.parse(localStorage.getItem("gambass_burn_stats") ?? "null")).toEqual({
    totalBurned: 3,
    appliedAttemptIds: [currentAttemptId],
  });
  expect(localStorage.getItem("gambass_session_id")).toBeNull();
  expect(localStorage.getItem("gambass_burn_attempt")).toBeNull();
});

test("이미 반영한 소각 시도의 성공 결과를 다시 처리해도 중복 합산하지 않는다", async () => {
  localStorage.setItem("gambass_burn_stats", JSON.stringify({
    totalBurned: 3,
    appliedAttemptIds: [currentAttemptId],
  }));
  render(<TrashPage />);

  await act(async () => { await vi.advanceTimersByTimeAsync(1200 * 3); });

  expect(JSON.parse(localStorage.getItem("gambass_burn_stats") ?? "null")).toEqual({
    totalBurned: 3,
    appliedAttemptIds: [currentAttemptId],
  });
});
