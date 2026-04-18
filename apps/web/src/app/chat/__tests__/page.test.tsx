import { expect, test, vi, afterEach, beforeAll } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <header {...props}>{children}</header>,
    button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button onClick={onClick} {...props}>{children}</button>,
    section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ChatPage from "../page";

test("헤더에 '감바쓰' 타이틀이 표시된다", () => {
  render(<ChatPage />);
  expect(screen.getByText("감바쓰")).toBeDefined();
});

test("뒤로가기 버튼이 렌더링된다", () => {
  render(<ChatPage />);
  expect(screen.getByRole("button", { name: /뒤로가기/ })).toBeDefined();
});

test("메시지 입력창이 렌더링된다", () => {
  render(<ChatPage />);
  expect(screen.getByPlaceholderText(/메세지 입력/)).toBeDefined();
});

test("전송 버튼이 렌더링된다", () => {
  render(<ChatPage />);
  expect(screen.getByRole("button", { name: /전송/ })).toBeDefined();
});
