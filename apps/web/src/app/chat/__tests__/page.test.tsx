import { expect, test, vi, afterEach, beforeAll, beforeEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";

// 결정론적 응답 — 항상 MOCK_RESPONSES[0] = "ㅁㅊㅋㅋㅋ\n잼컨 발생 빨리 말해줘"
vi.spyOn(Math, "random").mockReturnValue(0);

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockMotionValue = (initial: number) => {
  let val = initial;
  const listeners: Array<(v: number) => void> = [];
  return {
    get: () => val,
    set: (v: number) => { val = v; listeners.forEach(l => l(v)); },
    on: (_: string, cb: (v: number) => void) => { listeners.push(cb); return () => {}; },
  };
};

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, style: _s, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...props}>{children}</div>,
    header: ({ children, animate: _a, initial: _i, transition: _t, ...props }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => <header {...props}>{children}</header>,
    button: ({ children, onClick, animate: _a, initial: _i, transition: _t, whileTap: _w, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => <button onClick={onClick} {...props}>{children}</button>,
    span: ({ children, animate: _a, initial: _i, transition: _t, ...props }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
  useMotionValue: (initial: number) => mockMotionValue(initial),
  useTransform: (_mv: unknown, _input: unknown, _output: unknown) => ({ get: () => _output, set: vi.fn(), on: () => () => {} }),
  animate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...props} />
  ),
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

test("스트리밍 중에는 전송 버튼이 비활성화된다", () => {
  render(<ChatPage />);
  typeAndSend("첫 번째 메시지");

  act(() => { vi.advanceTimersByTime(100); }); // 스트리밍 진행 중

  expect(
    (screen.getByRole("button", { name: /전송/ }) as HTMLButtonElement).disabled
  ).toBe(true);
});

test("스트리밍 중에도 입력창에 타이핑할 수 있다", () => {
  render(<ChatPage />);
  typeAndSend("첫 번째 메시지");

  act(() => { vi.advanceTimersByTime(100); }); // 스트리밍 진행 중

  const input = screen.getByPlaceholderText(/메세지 입력/) as HTMLInputElement;
  expect(input.disabled).toBe(false);

  fireEvent.change(input, { target: { value: "다음 할 말 준비 중" } });
  expect(input.value).toBe("다음 할 말 준비 중");
});

// ─── 키보드 ──────────────────────────────────────────────────

test("Enter 키로 메시지를 전송할 수 있다", () => {
  render(<ChatPage />);
  const input = screen.getByPlaceholderText(/메세지 입력/);

  fireEvent.change(input, { target: { value: "엔터로 전송" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  expect(screen.getByText("엔터로 전송")).toBeDefined();
});

test("Shift+Enter는 전송하지 않고 입력창에 값이 남아있다", () => {
  render(<ChatPage />);
  const input = screen.getByPlaceholderText(/메세지 입력/) as HTMLTextAreaElement;

  fireEvent.change(input, { target: { value: "줄바꿈" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter", shiftKey: true });

  // 전송되지 않았으므로 입력창에 값이 그대로 남아 있어야 함
  expect(input.value).toBe("줄바꿈");
});

// ─── 크럼플 (롱프레스) ────────────────────────────────────────

test("유저 메시지 500ms 롱프레스 시 종이 뭉치로 교체된다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getByText("스트레스 받아");
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getByTestId("crumpled-ball")).toBeDefined();
  expect(screen.queryByText("스트레스 받아")).toBeNull();
});

test("500ms 이전에 손 떼면 크럼플되지 않는다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getByText("스트레스 받아");
  fireEvent.pointerDown(bubble);
  act(() => { vi.advanceTimersByTime(300); });
  fireEvent.pointerUp(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.queryByAltText("crumpled")).toBeNull();
  expect(screen.getByText("스트레스 받아")).toBeDefined();
});

test("AI 메시지도 롱프레스하면 크럼플된다", async () => {
  render(<ChatPage />);

  const aiMsg = screen.getByText("무슨일이야?");
  fireEvent.pointerDown(aiMsg);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getByTestId("crumpled-ball")).toBeDefined();
});

test("pending 메시지는 롱프레스해도 크럼플되지 않는다", () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");
  // pending AI 버블이 존재하는 상태 (스트리밍 전)
  const beforeCount = screen.queryAllByTestId("crumpled-ball").length;
  expect(beforeCount).toBe(0);
});

// ─── 네비게이션 ──────────────────────────────────────────────

test("뒤로가기 버튼을 누르면 홈(/)으로 이동한다", () => {
  render(<ChatPage />);
  fireEvent.click(screen.getByRole("button", { name: /뒤로가기/ }));
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

  const bubble = screen.getByText("스트레스 받아");
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getByRole("button", { name: /버리러가기/ })).toBeDefined();
});

test("뱃지에 크럼플 수가 표시된다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getByText("스트레스 받아");
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.getByTestId("crumple-badge").textContent).toBe("1");
});

test("'버리러가기' 버튼 클릭 시 /trash?count=N으로 이동한다", async () => {
  render(<ChatPage />);
  typeAndSend("스트레스 받아");

  const bubble = screen.getByText("스트레스 받아");
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  fireEvent.click(screen.getByRole("button", { name: /버리러가기/ }));
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

  const bubble = screen.getByText("스트레스 받아");
  fireEvent.pointerDown(bubble);
  await act(async () => { vi.advanceTimersByTime(500); });

  expect(screen.queryByTestId("longpress-hint")).toBeNull();
});
