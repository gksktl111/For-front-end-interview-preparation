import { delay, http, HttpResponse } from "msw";
import { TOPICS } from "../shared/topics";
import type { TopicId, TopicResult } from "../shared/types";

export const day2Handlers = [
  http.get("/api/interview-questions", async ({ request }) => {
    const url = new URL(request.url);
    const topicId = url.searchParams.get("topicId");
    const requestIdParam = url.searchParams.get("requestId");
    const requestId = Number(requestIdParam);

    if (!isTopicId(topicId) || requestIdParam === null || !Number.isFinite(requestId)) {
      return HttpResponse.json(
        {
          message: "topicId 또는 requestId가 올바르지 않습니다.",
        },
        {
          status: 400,
        },
      );
    }

    const topic = TOPICS[topicId];

    await delay(topic.delay);

    return HttpResponse.json<TopicResult>({
      topicId,
      requestId,
      delay: topic.delay,
      questions: topic.questions,
    });
  }),
];

function isTopicId(value: string | null): value is TopicId {
  return value === "react" || value === "javascript";
}
