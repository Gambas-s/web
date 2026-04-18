import { expect, test, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(cleanup);
import userEvent from "@testing-library/user-event";
import Home from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

test("헤드라인이 렌더링된다", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
});

test("'버리러가기' 버튼이 렌더링된다", () => {
  render(<Home />);
  expect(screen.getByRole("button", { name: /버리러가기/ })).toBeDefined();
});

test("'버리러가기' 버튼 클릭 시 /chat으로 이동한다", async () => {
  const user = userEvent.setup();
  render(<Home />);
  await user.click(screen.getByRole("button", { name: /버리러가기/ }));
  expect(mockPush).toHaveBeenCalledWith("/chat");
});
