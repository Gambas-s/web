import { expect, test, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";

// 결정론적 응답 — 항상 MOCK_RESPONSES[0] = "ㅁㅊㅋㅋㅋ\n잼컨 발생 빨리 말해줘"
vi.spyOn(Math, "random").mockReturnValue(0);

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...props}>{children}</div>,
    header: ({ children, animate: _a, initial: _i, transition: _t, ...props }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => <header {...props}>{children}</header>,
    button: ({ children, onClick, animate: _a, initial: _i, transition: _t, whileTap: _w, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => <button onClick={onClick} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.useFakeTimers();
  mockPush.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

import ChatPage from "../page";

function typeAndSend(text: string) {
  fireEvent.change(screen.getByPlaceholderText(/메세지 입력/), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole("button", { name: /전송/ }));
}

// ─── 초기 상태 ──────────────────────────────────────────────

test("앱 로드 시 AI 첫 메시지 '무슨일이야?'가 자동으로 표시된다", () => {
  render(<ChatPage />);
  expect(screen.getByText("무슨일이야?")).toBeDefined();
});

// ─── 메시지 전송 ─────────────────────────────────────────────

test("전송하면 유저 버블이 즉시 나타난다", () => {
  render(<ChatPage />);
  typeAndSend("오늘 진짜 힘들었어");
  expect(screen.getByText("오늘 진짜 힘들었어")).toBeDefined();
});

test("전송 직후 입력창이 비워진다", () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");
  expect((screen.getByPlaceholderText(/메세지 입력/) as HTMLInputElement).value).toBe("");
});

test("전송 직후 AI 응답 텍스트는 아직 없다 — pending 버블만 존재", () => {
  render(<ChatPage />);
  typeAndSend("개빡쳐");
  expect(screen.queryByText(/잼컨/)).toBeNull();
});

// ─── AI 스트리밍 ─────────────────────────────────────────────

test("600ms 후 AI 답장이 스트리밍 시작된다", () => {
  render(<ChatPage />);
  typeAndSend("미치겠다");

  act(() => { vi.advanceTimersByTime(600 + 35 * 3); }); // 3글자 스트리밍

  expect(screen.getByText(/ㅁㅊ/)).toBeDefined();
});

test("스트리밍 완료 후 AI 전체 메시지가 표시된다", () => {
  render(<ChatPage />);
  typeAndSend("퇴근하고싶어");

  act(() => { vi.advanceTimersByTime(3000); });

  // pre-wrap 렌더링 — 줄바꿈 포함 전체 내용을 각각 확인
  expect(screen.getByText(/ㅁㅊㅋㅋㅋ/)).toBeDefined();
  expect(screen.getByText(/잼컨 발생 빨리 말해줘/)).toBeDefined();
});

// ─── 전송 제한 ───────────────────────────────────────────────

test("빈 메시지는 전송해도 새 버블이 추가되지 않는다", () => {
  render(<ChatPage />);
  fireEvent.click(screen.getByRole("button", { name: /전송/ }));

  act(() => { vi.advanceTimersByTime(3000); });

  // 초기 메시지 1개만 존재
  expect(screen.getAllByText("무슨일이야?")).toHaveLength(1);
});

test("스트리밍 중에는 두 번째 메시지 전송이 차단된다", () => {
  render(<ChatPage />);
  typeAndSend("첫 번째 메시지");

  act(() => { vi.advanceTimersByTime(100); }); // 스트리밍 진행 중

  // 스트리밍 중 두 번째 전송 시도
  fireEvent.change(screen.getByPlaceholderText(/메세지 입력/), {
    target: { value: "두 번째 메시지" },
  });
  fireEvent.click(screen.getByRole("button", { name: /전송/ }));

  expect(screen.queryByText("두 번째 메시지")).toBeNull();
});

// ─── 키보드 ──────────────────────────────────────────────────

test("Enter 키로 메시지를 전송할 수 있다", () => {
  render(<ChatPage />);
  const input = screen.getByPlaceholderText(/메세지 입력/);

  fireEvent.change(input, { target: { value: "엔터로 전송" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  expect(screen.getByText("엔터로 전송")).toBeDefined();
});

test("Shift+Enter는 전송하지 않는다", () => {
  render(<ChatPage />);
  const input = screen.getByPlaceholderText(/메세지 입력/);

  fireEvent.change(input, { target: { value: "줄바꿈" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

  expect(screen.queryByText("줄바꿈")).toBeNull();
});

// ─── 네비게이션 ──────────────────────────────────────────────

test("뒤로가기 버튼을 누르면 홈(/)으로 이동한다", () => {
  render(<ChatPage />);
  fireEvent.click(screen.getByRole("button", { name: /뒤로가기/ }));
  expect(mockPush).toHaveBeenCalledWith("/");
});
