import { beforeEach, expect, test } from "vitest";
import {
  BURN_STATS_STORAGE_KEY,
  readTotalBurned,
  recordBurnCompletion,
} from "../burnStats";

beforeEach(() => {
  localStorage.clear();
});

test("저장값이 없으면 누적 소각 수를 0으로 읽는다", () => {
  expect(readTotalBurned()).toBe(0);
});

test("완료된 소각 시도의 선택 개수를 한 번만 누적하고 저장한다", () => {
  expect(recordBurnCompletion("attempt-1", 3)).toBe(3);
  expect(recordBurnCompletion("attempt-1", 3)).toBe(3);
  expect(readTotalBurned()).toBe(3);
  expect(JSON.parse(localStorage.getItem(BURN_STATS_STORAGE_KEY) ?? "null")).toEqual({
    totalBurned: 3,
    appliedAttemptIds: ["attempt-1"],
  });
});

test("새 소각 시도는 기존 누적값에 더하고 새로 읽어도 유지한다", () => {
  recordBurnCompletion("attempt-1", 3);
  recordBurnCompletion("attempt-2", 2);
  expect(readTotalBurned()).toBe(5);
});

test.each([
  "not-json",
  JSON.stringify({ totalBurned: -1, appliedAttemptIds: [] }),
  JSON.stringify({ totalBurned: 1.5, appliedAttemptIds: [] }),
  JSON.stringify({ totalBurned: Number.MAX_SAFE_INTEGER + 1, appliedAttemptIds: [] }),
  JSON.stringify({ totalBurned: 4, appliedAttemptIds: "attempt-1" }),
  JSON.stringify({ totalBurned: 4, appliedAttemptIds: [""] }),
  JSON.stringify({ totalBurned: 4, appliedAttemptIds: [1] }),
])("손상되거나 음수인 저장값은 0으로 처리한다: %s", (storedValue) => {
  localStorage.setItem(BURN_STATS_STORAGE_KEY, storedValue);
  expect(readTotalBurned()).toBe(0);
});

test("사이트 저장 데이터를 지우면 다시 0으로 초기화된다", () => {
  recordBurnCompletion("attempt-1", 3);
  localStorage.clear();
  expect(readTotalBurned()).toBe(0);
});

test("새로고침과 재방문에 해당하는 새 읽기에서도 저장된 누적값을 유지한다", () => {
  recordBurnCompletion("attempt-1", 3);

  expect(readTotalBurned()).toBe(3);
  expect(readTotalBurned()).toBe(3);
});
