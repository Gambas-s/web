import { expect, test, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, style: _s, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...props} />
  ),
}));

afterEach(() => {
  mockPush.mockClear();
  cleanup();
});

import TrashFinPage from "../page";

test("'깨끗해졌어요!!' 텍스트가 표시된다", () => {
  render(<TrashFinPage />);
  expect(screen.getByText("깨끗해졌어요!!")).toBeDefined();
});

test("빈 쓰레기통 이미지가 표시된다", () => {
  render(<TrashFinPage />);
  expect(screen.getByAltText("빈 쓰레기통")).toBeDefined();
});

test("'한번 더' 버튼 클릭 시 /chat으로 이동한다", () => {
  render(<TrashFinPage />);
  fireEvent.click(screen.getByRole("button", { name: /한번 더/ }));
  expect(mockPush).toHaveBeenCalledWith("/chat");
});

test("'홈으로' 버튼 클릭 시 /로 이동한다", () => {
  render(<TrashFinPage />);
  fireEvent.click(screen.getByRole("button", { name: /홈으로/ }));
  expect(mockPush).toHaveBeenCalledWith("/");
});
