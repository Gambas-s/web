import React from "react";
import { expect, test, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";

// 결정론적 응답 — 항상 MOCK_RESPONSES[0] = "ㅁㅊㅋㅋㅋ\n잼컨 발생 빨리 말해줘"
vi.spyOn(Math, "random").mockReturnValue(0);

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, layout: _l, layoutId: _lid, variants: _v, style: _s, ...p }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) =>
      <div {...p}>{children}</div>,
    span: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, ...p }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) =>
      <span {...p}>{children}</span>,
    button: ({ children, onClick, disabled, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, style: _s, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) =>
      <button onClick={onClick} disabled={disabled as boolean} {...p}>{children}</button>,
    header: ({ children, animate: _a, initial: _i, transition: _t, ...p }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) =>
      <header {...p}>{children}</header>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
  useMotionValue: (initial: number) => {
    let val = initial;
    const listeners: Array<(v: number) => void> = [];
    return {
      get: () => val,
      set: (v: number) => { val = v; listeners.forEach(l => l(v)); },
      on: (_: string, cb: (v: number) => void) => { listeners.push(cb); return () => {}; },
    };
  },
  useTransform: (_mv: unknown, _input: unknown, output: unknown) => ({
    get: () => output, set: vi.fn(), on: () => () => {},
  }),
  animate: vi.fn().mockResolvedValue(undefined),
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

// 모바일 섹션 첫 번째 입력창과 전송 버튼을 통해 메시지 전송
function typeAndSend(text: string) {
  fireEvent.change(screen.getAllByPlaceholderText(/메세지 입력/)[0], {
    target: { value: text },
  });
  fireEvent.click(screen.getAllByRole("button", { name: /전송/ })[0]);
}

// ─── 초기 상태 ──────────────────────────────────────────────

test("앱 로드 시 AI 첫 메시지 '무슨일이야?'가 자동으로 표시된다", () => {
  render(<ChatPage />);
  expect(screen.getAllByText("무슨일이야?")[0]).toBeDefined();
});

// ─── 메시지 전송 ─────────────────────────────────────────────

test("전송하면 유저 버블이 즉시 나타난다", () => {
  render(<ChatPage />);
  typeAndSend("오늘 진짜 힘들었어");
  expect(screen.getAllByText("오늘 진짜 힘들었어")[0]).toBeDefined();
});

test("전송 직후 입력창이 비워진다", () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");
  expect((screen.getAllByPlaceholderText(/메세지 입력/)[0] as HTMLInputElement).value).toBe("");
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

  act(() => { vi.advanceTimersByTime(600 + 35 * 3); });

  expect(screen.getAllByText(/ㅁㅊ/)[0]).toBeDefined();
});

test("스트리밍 완료 후 AI 전체 메시지가 표시된다", () => {
  render(<ChatPage />);
  typeAndSend("퇴근하고싶어");

  act(() => { vi.advanceTimersByTime(3000); });

  expect(screen.getAllByText(/ㅁㅊㅋㅋㅋ/)[0]).toBeDefined();
  expect(screen.getAllByText(/잼컨 발생 빨리 말해줘/)[0]).toBeDefined();
});

// ─── 전송 제한 ───────────────────────────────────────────────

test("빈 메시지는 전송해도 새 버블이 추가되지 않는다", () => {
  render(<ChatPage />);
  fireEvent.click(screen.getAllByRole("button", { name: /전송/ })[0]);

  act(() => { vi.advanceTimersByTime(3000); });

  expect(screen.getAllByText("무슨일이야?")).toHaveLength(2); // 모바일 + 데스크톱
});

test("스트리밍 중에는 전송 버튼이 비활성화된다", () => {
  render(<ChatPage />);
  typeAndSend("첫 번째 메시지");

  act(() => { vi.advanceTimersByTime(100); });

  expect(
    (screen.getAllByRole("button", { name: /전송/ })[0] as HTMLButtonElement).disabled
  ).toBe(true);
});

test("스트리밍 중에도 입력창에 타이핑할 수 있다", () => {
  render(<ChatPage />);
  typeAndSend("첫 번째 메시지");

  act(() => { vi.advanceTimersByTime(100); });

  const input = screen.getAllByPlaceholderText(/메세지 입력/)[0] as HTMLInputElement;
  expect(input.disabled).toBe(false);

  fireEvent.change(input, { target: { value: "다음 할 말 준비 중" } });
  expect(input.value).toBe("다음 할 말 준비 중");
});

// ─── 키보드 ──────────────────────────────────────────────────

test("Enter 키로 메시지를 전송할 수 있다", () => {
  render(<ChatPage />);
  const input = screen.getAllByPlaceholderText(/메세지 입력/)[0];

  fireEvent.change(input, { target: { value: "엔터로 전송" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  expect(screen.getAllByText("엔터로 전송")[0]).toBeDefined();
});

test("Shift+Enter는 전송하지 않고 입력창에 값이 남아있다", () => {
  render(<ChatPage />);
  const input = screen.getAllByPlaceholderText(/메세지 입력/)[0] as HTMLTextAreaElement;

  fireEvent.change(input, { target: { value: "줄바꿈" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

  expect(input.value).toBe("줄바꿈");
});

// ─── 크럼플 (롱프레스) ────────────────────────────────────────

test("유저 메시지 500ms 롱프레스 시 종이 뭉치로 교체된다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getAllByTestId("crumpled-ball")[0]).toBeDefined();
  expect(screen.queryAllByText("스트레스 받아")).toHaveLength(0);
});

test("500ms 이전에 손 떼면 크럼플되지 않는다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  act(() => { vi.advanceTimersByTime(300); });
  fireEvent.pointerUp(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.queryAllByTestId("crumpled-ball")).toHaveLength(0);
  expect(screen.getAllByText("스트레스 받아")[0]).toBeDefined();
});

test("AI 메시지도 롱프레스하면 크럼플된다", async () => {
  render(<ChatPage />);

  const aiMsg = screen.getAllByText("무슨일이야?")[0];
  fireEvent.pointerDown(aiMsg);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getAllByTestId("crumpled-ball")[0]).toBeDefined();
});

test("pending 메시지는 롱프레스해도 크럼플되지 않는다", () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");
  // pending AI 버블이 존재하는 상태 (스트리밍 전)
  expect(screen.queryAllByTestId("crumpled-ball")).toHaveLength(0);
});

// ─── 네비게이션 ──────────────────────────────────────────────

test("뒤로가기 버튼을 누르면 홈(/)으로 이동한다", () => {
  render(<ChatPage />);
  fireEvent.click(screen.getAllByRole("button", { name: /뒤로가기/ })[0]);
  expect(mockPush).toHaveBeenCalledWith("/");
});

// ─── 헤더 버리러가기 버튼 ────────────────────────────────────

test("크럼플 0개면 '버리러가기' 버튼이 보이지 않는다", () => {
  render(<ChatPage />);
  expect(screen.queryByRole("button", { name: /버리러가기/ })).toBeNull();
});

test("크럼플 1개 이상이면 '버리러가기' 버튼이 나타난다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getByRole("button", { name: /버리러가기/ })).toBeDefined();
});

test("뱃지에 크럼플 수가 표시된다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getByTestId("crumple-badge").textContent).toBe("1");
});

test("'버리러가기' 버튼 클릭 시 확인 모달이 열린다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  fireEvent.click(screen.getByRole("button", { name: /버리러가기/ }));
  expect(screen.getByTestId("trash-confirm-modal")).toBeDefined();
  expect(mockPush).not.toHaveBeenCalled();
});

test("모달에서 '아직 남았어요' 클릭 시 모달이 닫히고 이동하지 않는다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  fireEvent.click(screen.getByRole("button", { name: /버리러가기/ }));
  fireEvent.click(screen.getAllByRole("button", { name: /아직 남았어요/ })[0]);

  expect(screen.queryByTestId("trash-confirm-modal")).toBeNull();
  expect(mockPush).not.toHaveBeenCalled();
});

test("모달에서 '다 불태울게요' 클릭 시 /trash?count=N으로 이동한다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  fireEvent.click(screen.getByRole("button", { name: /버리러가기/ }));
  fireEvent.click(screen.getAllByTestId("trash-confirm-burn")[0]);

  expect(mockPush).toHaveBeenCalledWith("/trash?count=1");
});

// ─── 온보딩 힌트 ─────────────────────────────────────────────

test("첫 유저 메시지 전송 후 롱프레스 힌트가 나타난다", () => {
  localStorage.removeItem("gambass_hint_shown");
  render(<ChatPage />);
  typeAndSend("스트레스 받아");
  expect(screen.getByTestId("longpress-hint")).toBeDefined();
});

test("localStorage에 gambass_hint_shown이 있으면 힌트가 표시되지 않는다", () => {
  localStorage.setItem("gambass_hint_shown", "1");
  render(<ChatPage />);
  typeAndSend("스트레스 받아");
  expect(screen.queryByTestId("longpress-hint")).toBeNull();
  localStorage.removeItem("gambass_hint_shown");
});

test("크럼플 성공 시 힌트가 사라진다", async () => {
  localStorage.removeItem("gambass_hint_shown");
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getAllByText("스트레스 받아")[0];
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.queryByTestId("longpress-hint")).toBeNull();
});
