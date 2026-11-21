"use client";

import { useEffect, useState } from "react";

export const BURN_STATS_STORAGE_KEY = "gambass_burn_stats";

interface BurnStats {
  totalBurned: number;
  appliedAttemptIds: string[];
}

const BURN_STATS_CHANGED_EVENT = "gambass:burn-stats-changed";
const EMPTY_STATS: BurnStats = { totalBurned: 0, appliedAttemptIds: [] };

function isValidStats(value: unknown): value is BurnStats {
  if (!value || typeof value !== "object") return false;
  const stats = value as Partial<BurnStats>;
  return (
    Number.isSafeInteger(stats.totalBurned) &&
    (stats.totalBurned ?? -1) >= 0 &&
    Array.isArray(stats.appliedAttemptIds) &&
    stats.appliedAttemptIds.every((id) => typeof id === "string" && id.length > 0)
  );
}

function readBurnStats(): BurnStats {
  if (typeof window === "undefined") return EMPTY_STATS;

  const rawStats = localStorage.getItem(BURN_STATS_STORAGE_KEY);
  if (!rawStats) return EMPTY_STATS;

  try {
    const stats: unknown = JSON.parse(rawStats);
    return isValidStats(stats) ? stats : EMPTY_STATS;
  } catch {
    return EMPTY_STATS;
  }
}

export function readTotalBurned(): number {
  return readBurnStats().totalBurned;
}

export function recordBurnCompletion(attemptId: string, selectedCount: number): number {
  const stats = readBurnStats();
  if (
    attemptId.length === 0 ||
    !Number.isSafeInteger(selectedCount) ||
    selectedCount <= 0 ||
    stats.appliedAttemptIds.includes(attemptId)
  ) {
    return stats.totalBurned;
  }

  const nextTotal = stats.totalBurned + selectedCount;
  if (!Number.isSafeInteger(nextTotal)) return stats.totalBurned;

  const nextStats: BurnStats = {
    totalBurned: nextTotal,
    appliedAttemptIds: [...stats.appliedAttemptIds, attemptId],
  };
  localStorage.setItem(BURN_STATS_STORAGE_KEY, JSON.stringify(nextStats));
  window.dispatchEvent(new Event(BURN_STATS_CHANGED_EVENT));
  return nextTotal;
}

function subscribeToBurnStats(onStoreChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === BURN_STATS_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(BURN_STATS_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BURN_STATS_CHANGED_EVENT, onStoreChange);
  };
}

export function useTotalBurned(): number {
  const [totalBurned, setTotalBurned] = useState(0);

  useEffect(() => {
    const updateTotal = () => setTotalBurned(readTotalBurned());
    updateTotal();
    return subscribeToBurnStats(updateTotal);
  }, []);

  return totalBurned;
}
