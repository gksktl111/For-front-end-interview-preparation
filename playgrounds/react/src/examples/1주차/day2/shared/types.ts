export type TopicId = "react" | "javascript";

export type TopicResult = {
  topicId: TopicId;
  requestId: number;
  delay: number;
  questions: string[];
};

export type LogTone =
  | "default"
  | "request"
  | "success"
  | "danger"
  | "ignored"
  | "aborted";

export type LogItem = {
  id: string;
  message: string;
  tone: LogTone;
};
