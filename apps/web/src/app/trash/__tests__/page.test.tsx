import { expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => (key === "count" ? "3" : null) }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, style: _s, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...props}>{children}</div>,
    img: ({ animate: _a, initial: _i, transition: _t, style: _s, src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & Record<string, unknown>) => <img src={src as string} alt={alt} {...props} />,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...props} />
  ),
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
  expect(screen.getByText(/감정이 모두 불타는 중입니다/)).toBeDefined();
  expect(screen.getByAltText("불타는 쓰레기통")).toBeDefined();
});

test("초기 소각 진행 텍스트가 '0 / 3 소각됨'으로 표시된다", () => {
  render(<TrashPage />);
  expect(screen.getByText(/0 \/ 3 소각됨/)).toBeDefined();
});

test("1200ms 후 소각 진행이 1로 증가한다", () => {
  render(<TrashPage />);
  act(() => { vi.advanceTimersByTime(1200); });
  expect(screen.getByText(/1 \/ 3 소각됨/)).toBeDefined();
});

test("소각 완료 후 /trash-fin으로 이동한다", () => {
  render(<TrashPage />);
  act(() => { vi.advanceTimersByTime(1200 * 3 + 100); });
  expect(mockPush).toHaveBeenCalledWith("/trash-fin");
});
