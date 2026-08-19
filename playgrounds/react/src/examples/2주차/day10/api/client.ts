import type { Clip } from "./types";

export async function fetchClips(revision: number): Promise<Clip[]> {
  const searchParams = new URLSearchParams({
    revision: String(revision),
  });
  const response = await fetch("/api/day10/clips?" + searchParams.toString());

  if (!response.ok) {
    throw new Error("클립 목록을 불러오지 못했습니다: " + response.status);
  }

  return (await response.json()) as Clip[];
}
