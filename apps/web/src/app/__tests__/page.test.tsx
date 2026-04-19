import React from "react";
import { expect, test, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

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
  default: ({ src, alt, width, height, style, className }: {
    src?: string; alt?: string; width?: number; height?: number;
    style?: React.CSSProperties; className?: string;
  }) => <img src={src} alt={alt} width={width} height={height} style={style} className={className} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, layout: _l, variants: _v, style: _s, ...p }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) =>
      <div {...p}>{children}</div>,
    span: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, ...p }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) =>
      <span {...p}>{children}</span>,
    button: ({ children, onClick, disabled, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, style: _s, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) =>
      <button onClick={onClick} disabled={disabled as boolean} {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
  animate: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  mockPush.mockClear();
  cleanup();
});

import Home from "../page";

test("헤드라인이 렌더링된다", () => {
  render(<Home />);
  expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0);
});

test("'버리러가기' 버튼이 렌더링된다", () => {
  render(<Home />);
  expect(screen.getByRole("button", { name: /버리러가기/ })).toBeDefined();
});

test("'버리러가기' 버튼 클릭 시 /chat으로 이동한다", () => {
  render(<Home />);
  fireEvent.click(screen.getByRole("button", { name: /버리러가기/ }));
  expect(mockPush).toHaveBeenCalledWith("/chat");
});
