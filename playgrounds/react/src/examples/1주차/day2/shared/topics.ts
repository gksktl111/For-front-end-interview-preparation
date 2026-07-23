import type { TopicId, TopicResult } from "./types";

export const TOPICS: Record<
  TopicId,
  {
    label: string;
    delay: number;
    questions: string[];
  }
> = {
  react: {
    label: "React",
    delay: 1400,
    questions: [
      "useEffect cleanup은 언제 실행되나요?",
      "state 업데이트가 batching되는 이유는 무엇인가요?",
      "controlled component와 uncontrolled component의 차이는 무엇인가요?",
    ],
  },
  javascript: {
    label: "JavaScript",
    delay: 350,
    questions: [
      "Promise의 fulfilled와 rejected는 어떻게 구분되나요?",
      "fetch에서 HTTP 500 응답은 왜 catch로 바로 가지 않나요?",
      "AbortController는 어떤 상황에서 사용하나요?",
    ],
  },
};

export const INITIAL_TOPIC_ID: TopicId = "javascript";

export const initialResult: TopicResult = {
  topicId: INITIAL_TOPIC_ID,
  requestId: 0,
  delay: TOPICS[INITIAL_TOPIC_ID].delay,
  questions: TOPICS[INITIAL_TOPIC_ID].questions,
};
