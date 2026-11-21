import React from "react";
import { expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/components/web/WebLayout", () => ({
  WebLayout: ({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) => <>{sidebar}{children}</>,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, width, height, style }: {
    src?: string; alt?: string; width?: number; height?: number; style?: React.CSSProperties;
  }) => <img src={src} alt={alt} width={width} height={height} style={style} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, layout: _l, ...p }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) =>
      <div {...p}>{children}</div>,
    span: ({ children, animate: _a, initial: _i, transition: _t, exit: _e, ...p }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) =>
      <span {...p}>{children}</span>,
    button: ({ children, onClick, disabled, animate: _a, initial: _i, transition: _t, exit: _e, whileTap: _w, whileHover: _wh, style: _s, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) =>
      <button onClick={onClick} disabled={disabled as boolean} {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn().mockResolvedValue(undefined) }),
  animate: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.useFakeTimers();
  mockPush.mockClear();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

import TrashFinPage from "../page";

test("'깨끗해졌어요!!' 텍스트가 표시된다", () => {
  render(<TrashFinPage />);
  expect(screen.getAllByText("깨끗해졌어요!!")[0]).toBeDefined();
});

test("빈 쓰레기통 이미지가 표시된다", () => {
  render(<TrashFinPage />);
  expect(screen.getAllByAltText("빈 쓰레기통")[0]).toBeDefined();
});

test("저장된 누적 소각 수를 모바일과 데스크톱 완료 화면에 동일하게 표시한다", () => {
  localStorage.setItem("gambass_burn_stats", JSON.stringify({
    totalBurned: 7,
    appliedAttemptIds: ["attempt-1"],
  }));
  render(<TrashFinPage />);

  const totalStats = screen.getAllByText("누적 쓰레기 수").map((label) => label.parentElement?.textContent);
  expect(totalStats).toEqual(["누적 쓰레기 수7개", "누적 쓰레기 수7개"]);
});

test("사이트 저장 데이터가 없으면 완료 화면 누적값을 0으로 표시한다", () => {
  render(<TrashFinPage />);
  const totalStats = screen.getAllByText("누적 쓰레기 수").map((label) => label.parentElement?.textContent);
  expect(totalStats).toEqual(["누적 쓰레기 수0개", "누적 쓰레기 수0개"]);
});

test("누적값 3 표시 후 사이트 데이터를 삭제하고 다시 열면 사이드바와 완료 화면이 모두 0이 된다", () => {
  localStorage.setItem("gambass_burn_stats", JSON.stringify({
    totalBurned: 3,
    appliedAttemptIds: ["attempt-1"],
  }));
  render(<TrashFinPage />);

  expect(screen.getByText(/소각 3개/)).toBeDefined();
  expect(screen.getAllByText("누적 쓰레기 수").map((label) => label.parentElement?.textContent)).toEqual([
    "누적 쓰레기 수3개",
    "누적 쓰레기 수3개",
  ]);

  cleanup();
  localStorage.clear();
  render(<TrashFinPage />);

  expect(screen.getByText(/소각 0개/)).toBeDefined();
  expect(screen.getAllByText("누적 쓰레기 수").map((label) => label.parentElement?.textContent)).toEqual([
    "누적 쓰레기 수0개",
    "누적 쓰레기 수0개",
  ]);
});

test("'한번 더' 버튼 클릭 시 /chat으로 이동한다", () => {
  render(<TrashFinPage />);
  fireEvent.click(screen.getAllByRole("button", { name: /한번 더/ })[0]);
  expect(mockPush).toHaveBeenCalledWith("/chat");
});

test("'홈으로' 버튼 클릭 시 /로 이동한다", () => {
  render(<TrashFinPage />);
  fireEvent.click(screen.getAllByRole("button", { name: /홈으로/ })[0]);
  expect(mockPush).toHaveBeenCalledWith("/");
});

test("5초 카운트다운 후 /로 자동 이동한다", async () => {
  render(<TrashFinPage />);
  // useEffect 체인: 각 1s 타이머가 re-render를 트리거하므로 act로 플러시
  for (let i = 0; i < 5; i++) {
    await act(async () => { vi.advanceTimersByTime(1000); });
  }
  expect(mockPush).toHaveBeenCalledWith("/");
});
