export const BURN_ATTEMPT_STORAGE_KEY = "gambass_burn_attempt";

export type MessageAuthor = "ai" | "user";

export interface BurnSelection {
  messageId: string;
  author: MessageAuthor;
  order: number;
}

export interface BurnAttempt {
  id: string;
  sessionId: string;
  selectedMessages: BurnSelection[];
}

function generateAttemptId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isBurnSelection(value: unknown): value is BurnSelection {
  if (!value || typeof value !== "object") return false;
  const selection = value as Partial<BurnSelection>;
  return (
    typeof selection.messageId === "string" &&
    (selection.author === "ai" || selection.author === "user") &&
    Number.isInteger(selection.order) &&
    (selection.order ?? 0) > 0
  );
}

export function createBurnAttempt(
  sessionId: string,
  selectedMessages: BurnSelection[],
): BurnAttempt {
  const attempt = {
    id: generateAttemptId(),
    sessionId,
    selectedMessages,
  };
  localStorage.setItem(BURN_ATTEMPT_STORAGE_KEY, JSON.stringify(attempt));
  return attempt;
}

export function readBurnAttempt(expectedId: string | null): BurnAttempt | null {
  if (!expectedId) return null;

  const rawAttempt = localStorage.getItem(BURN_ATTEMPT_STORAGE_KEY);
  if (!rawAttempt) return null;

  try {
    const attempt = JSON.parse(rawAttempt) as Partial<BurnAttempt>;
    if (
      attempt.id !== expectedId ||
      typeof attempt.sessionId !== "string" ||
      attempt.sessionId.length === 0 ||
      !Array.isArray(attempt.selectedMessages) ||
      attempt.selectedMessages.length === 0 ||
      !attempt.selectedMessages.every(isBurnSelection)
    ) {
      return null;
    }
    return attempt as BurnAttempt;
  } catch {
    return null;
  }
}

export function clearBurnAttempt(attemptId: string): void {
  const attempt = readBurnAttempt(attemptId);
  if (attempt) localStorage.removeItem(BURN_ATTEMPT_STORAGE_KEY);
}
