import type { TopicId, TopicResult } from "../shared/types";

export async function fetchInterviewQuestions(
  topicId: TopicId,
  requestId?: number,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams({
    topicId,
    requestId: String(requestId ?? 0),
  });
  let response: Response;

  try {
    response = await fetch(`/api/interview-questions?${searchParams}`, {
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new DOMException("Request aborted", "AbortError");
    }

    throw error;
  }

  if (!response.ok) {
    throw new Error(`면접 질문 조회 실패: ${response.status}`);
  }

  return (await response.json()) as TopicResult;
}
