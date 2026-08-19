import type { EffectUser, EffectUserId } from "./types";

export async function fetchEffectUser(
  userId: EffectUserId,
  signal?: AbortSignal,
): Promise<EffectUser> {
  const response = await fetch("/api/day11/users/" + userId, {
    signal,
  });

  if (!response.ok) {
    throw new Error("사용자 요청 실패: HTTP " + response.status);
  }

  return (await response.json()) as EffectUser;
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
