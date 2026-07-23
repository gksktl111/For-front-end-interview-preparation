import type { Dispatch, SetStateAction } from "react";
import type { LogItem, LogTone } from "./types";

export function createLog(message: string, tone: LogTone): LogItem {
  return {
    id: crypto.randomUUID(),
    message,
    tone,
  };
}

export function pushLog(
  setLogs: Dispatch<SetStateAction<LogItem[]>>,
  message: string,
  tone: LogTone,
) {
  setLogs((logs) => [...logs, createLog(message, tone)]);
}
