import React from "react";
import { expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => (key === "count" ? "3" : null) }),
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
});

afterEach(() => {
  vi.useRealTimers();
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
});

test("소각 완료 후 3초 대기 뒤 /trash-fin으로 이동한다", () => {
  render(<TrashPage />);
  act(() => { vi.advanceTimersByTime(1200 * 3 + 3000 + 100); });
  expect(mockPush).toHaveBeenCalledWith("/trash-fin");
});
