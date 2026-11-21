import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, whileHover: _wh, transition: _t, animate: _a, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
}));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

import WebSidebar from "../WebSidebar";
import { readTotalBurned } from "@/lib/burnStats";

test("저장된 누적 소각 수를 사이드바에 표시한다", () => {
  localStorage.setItem("gambass_burn_stats", JSON.stringify({
    totalBurned: 7,
    appliedAttemptIds: ["attempt-1"],
  }));
  expect(readTotalBurned()).toBe(7);
  render(<WebSidebar activeItem="none" hideTrash />);
  expect(screen.getByText(/소각 7개/)).toBeDefined();
});

test("사이트 저장 데이터가 없으면 사이드바 누적값을 0으로 표시한다", () => {
  render(<WebSidebar activeItem="none" hideTrash />);
  expect(screen.getByText(/소각 0개/)).toBeDefined();
});
