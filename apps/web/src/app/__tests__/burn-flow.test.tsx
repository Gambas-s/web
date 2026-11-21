import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const mockPush = vi.fn();
const mockQuery = new Map<string, string>();
let receiveSecondReply = false;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, layout: _l, layoutId: _lid, variants: _v, style: _s, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) =>
      <div {...props}>{children}</div>,
    span: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, style: _s, ...props }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) =>
      <span {...props}>{children}</span>,
    button: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, style: _s, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) =>
      <button {...props}>{children}</button>,
    header: ({ children, animate: _a, initial: _i, transition: _t, ...props }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) =>
      <header {...props}>{children}</header>,
    img: ({ animate: _a, initial: _i, transition: _t, style: _s, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & Record<string, unknown>) =>
      <img {...props} />,
    p: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, ...props }: React.HTMLAttributes<HTMLParagraphElement> & Record<string, unknown>) =>
      <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
  useMotionValue: (initial: number) => {
    let value = initial;
    const listeners: Array<(nextValue: number) => void> = [];
    return {
      get: () => value,
      set: (nextValue: number) => {
        value = nextValue;
        listeners.forEach((listener) => listener(nextValue));
      },
      on: (_event: string, listener: (nextValue: number) => void) => {
        listeners.push(listener);
        return () => {};
      },
    };
  },
  useTransform: (_value: unknown, _input: unknown, output: unknown) => ({
    get: () => output,
    set: vi.fn(),
    on: () => () => {},
  }),
  animate: vi.fn().mockResolvedValue(undefined),
}));

function sseResponse(chunk: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(
        `data: ${JSON.stringify({ chunk })}\ndata: [DONE]\n`,
      ));
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

beforeEach(() => {
  vi.useFakeTimers();
  const storedValues = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storedValues.get(key) ?? null,
    setItem: (key: string, value: string) => { storedValues.set(key, value); },
    removeItem: (key: string) => { storedValues.delete(key); },
    clear: () => { storedValues.clear(); },
    key: (index: number) => Array.from(storedValues.keys())[index] ?? null,
    get length() { return storedValues.size; },
  } satisfies Storage);
  localStorage.setItem("gambass_session_id", "flow-session");
  mockPush.mockClear();
  mockQuery.clear();
  receiveSecondReply = false;

  vi.stubGlobal("fetch", vi.fn((url: string | URL | Request, options?: RequestInit) => {
    const urlString = url.toString();
    if (urlString.includes("/api/session?sessionId=") && options?.method === "DELETE") {
      return Promise.resolve(new Response(JSON.stringify({ success: true, status: "deleted" })));
    }
    if (urlString.includes("/api/session?sessionId=")) {
      return Promise.resolve(new Response(JSON.stringify({ messages: [] })));
    }
    if (urlString.includes("/api/chat")) {
      const body = JSON.parse(String(options?.body)) as { message: string };
      if (body.message === "두 번째 사용자 메시지" && !receiveSecondReply) {
        return new Promise<Response>(() => {});
      }
      return Promise.resolve(sseResponse(
        body.message === "첫 번째 사용자 메시지" ? "첫 번째 감자 답장" : "두 번째 감자 답장",
      ));
    }
    return Promise.resolve(new Response("{}", { status: 200 }));
  }) as typeof fetch);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

import ChatPage from "../chat/page";
import TrashPage from "../trash/page";

function sendMessage(text: string): void {
  fireEvent.change(screen.getAllByPlaceholderText(/메세지 입력/)[0], {
    target: { value: text },
  });
  fireEvent.click(screen.getAllByRole("button", { name: /전송/ })[0]);
}

function mobileMessage(author: "ai" | "user", order: number): Element {
  const message = document.querySelector(
    `[data-layout="mobile"] [data-message-author="${author}"][data-message-order="${order}"]`,
  );
  expect(message).not.toBeNull();
  return message!;
}

async function flushAsyncWork(): Promise<void> {
  await act(async () => {
    await vi.runAllTimersAsync();
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
  });
}

test.each([
  { receiveReply: false, condition: "두 번째 감자 답장을 받기 전" },
  { receiveReply: true, condition: "두 번째 감자 답장을 받은 뒤" },
])("$condition에도 고유 순번으로 고른 사용자 2개와 감자 답장 1개만 삭제 성공 후 집계한다", async ({ receiveReply }) => {
  receiveSecondReply = receiveReply;
  render(<ChatPage />);

  sendMessage("첫 번째 사용자 메시지");
  await flushAsyncWork();
  sendMessage("두 번째 사용자 메시지");
  if (receiveReply) {
    await flushAsyncWork();
  } else {
    await act(async () => { await Promise.resolve(); });
  }

  const selectedElements = [
    mobileMessage("user", 1),
    mobileMessage("ai", 2),
    mobileMessage("user", 2),
  ];
  const selectedIds = selectedElements.map((message) => message.getAttribute("data-message-id"));
  const excludedIds = [
    mobileMessage("ai", 1).getAttribute("data-message-id"),
    mobileMessage("ai", 3).getAttribute("data-message-id"),
  ];

  await act(async () => {
    selectedElements.forEach((message) => {
      fireEvent.keyDown(message, { key: " ", code: "Space" });
    });
    await Promise.resolve();
  });

  expect(screen.getByTestId("crumple-badge").textContent).toBe("3");
  fireEvent.click(screen.getByRole("button", { name: /버리러가기/ }));
  fireEvent.click(screen.getAllByTestId("trash-confirm-burn")[0]);

  const attempt = JSON.parse(localStorage.getItem("gambass_burn_attempt") ?? "null") as {
    id: string;
    sessionId: string;
    selectedMessages: Array<{ messageId: string; author: string; order: number }>;
  };
  expect(attempt.sessionId).toBe("flow-session");
  expect(attempt.selectedMessages).toEqual([
    { messageId: selectedIds[0], author: "user", order: 1 },
    { messageId: selectedIds[1], author: "ai", order: 2 },
    { messageId: selectedIds[2], author: "user", order: 2 },
  ]);
  expect(new Set(attempt.selectedMessages.map((message) => message.messageId)).size).toBe(3);
  expect(attempt.selectedMessages.map((message) => message.messageId)).not.toEqual(
    expect.arrayContaining(excludedIds),
  );

  cleanup();
  mockQuery.set("burnAttemptId", attempt.id);
  render(<TrashPage />);

  await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
  expect(screen.getAllByText(/1 \/ 3 소각됨/)[0]).toBeDefined();
  expect(localStorage.getItem("gambass_burn_stats")).toBeNull();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1200 * 2);
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
  });
  expect(JSON.parse(localStorage.getItem("gambass_burn_stats") ?? "null")).toEqual({
    totalBurned: 3,
    appliedAttemptIds: [attempt.id],
  });
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining(`sessionId=flow-session&burnAttemptId=${attempt.id}`),
    { method: "DELETE" },
  );
});
