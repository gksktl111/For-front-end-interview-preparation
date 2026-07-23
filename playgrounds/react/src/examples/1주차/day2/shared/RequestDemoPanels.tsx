import { TOPICS } from "./topics";
import type { LogItem, LogTone, TopicId, TopicResult } from "./types";

type TopicSelectorProps = {
  selectedTopicId: TopicId;
  onSelect: (topicId: TopicId) => void;
};

export function TopicSelector({
  onSelect,
  selectedTopicId,
}: TopicSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">주제 선택</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(["react", "javascript"] as const).map((topicId) => (
          <button
            className={`rounded-xl border px-4 py-3 text-left transition ${
              selectedTopicId === topicId
                ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
            }`}
            key={topicId}
            type="button"
            onClick={() => onSelect(topicId)}
          >
            <span className="block text-sm font-semibold">
              {TOPICS[topicId].label}
            </span>
            <span className="mt-1 block text-xs text-slate-500">
              응답 지연 {TOPICS[topicId].delay}ms
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type StateSnapshotProps = {
  pendingCount: number;
  result: TopicResult;
  selectedTopicId: TopicId;
};

export function StateSnapshot({
  pendingCount,
  result,
  selectedTopicId,
}: StateSnapshotProps) {
  const hasMismatch = selectedTopicId !== result.topicId;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        현재 React state
      </p>
      <dl className="mt-3 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">selectedTopic</dt>
          <dd className="font-semibold text-slate-950">
            {TOPICS[selectedTopicId].label}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">result.topic</dt>
          <dd
            className={
              hasMismatch
                ? "font-semibold text-rose-700"
                : "font-semibold text-emerald-700"
            }
          >
            {TOPICS[result.topicId].label}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">진행 중 요청</dt>
          <dd className="font-semibold text-slate-950">{pendingCount}개</dd>
        </div>
      </dl>
    </div>
  );
}

type RequestResultPanelProps = {
  matchedMessage?: string;
  mismatchMessage?: string;
  result: TopicResult;
  selectedTopicId: TopicId;
};

export function RequestResultPanel({
  matchedMessage,
  mismatchMessage,
  result,
  selectedTopicId,
}: RequestResultPanelProps) {
  const hasMismatch = selectedTopicId !== result.topicId;
  const selectedTopic = TOPICS[selectedTopicId];
  const resultTopic = TOPICS[result.topicId];
  const statusMessage =
    hasMismatch
      ? (mismatchMessage ??
        `선택은 ${selectedTopic.label}인데 결과는 ${resultTopic.label}입니다. 오래된 응답이 최신 상태를 덮어쓴 상황입니다.`)
      : matchedMessage;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        hasMismatch ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-[0.14em] ${
              hasMismatch ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            화면에 표시된 요청 결과
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {resultTopic.label}
          </h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
          #{result.requestId} · {result.delay}ms
        </span>
      </div>

      {statusMessage && (
        <p
          className={`mt-4 rounded-xl border bg-white px-4 py-3 text-sm font-medium ${
            hasMismatch
              ? "border-rose-200 text-rose-700"
              : "border-emerald-200 text-emerald-700"
          }`}
        >
          {statusMessage}
        </p>
      )}

      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {result.questions.map((question) => (
          <li className="rounded-xl bg-white px-4 py-3" key={question}>
            {question}
          </li>
        ))}
      </ul>
    </div>
  );
}

type RequestFlowProps = {
  logs: LogItem[];
  onClear: () => void;
};

export function RequestFlow({ logs, onClear }: RequestFlowProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">요청 흐름</h2>
        <button
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={logs.length === 0}
          type="button"
          onClick={onClear}
        >
          클리어
        </button>
      </div>
      <ol className="mt-4 max-h-[300px] space-y-2 overflow-y-auto pr-2 text-sm leading-6">
        {logs.map((log) => (
          <li className={logToneClasses[log.tone]} key={log.id}>
            {log.message}
          </li>
        ))}
      </ol>
    </div>
  );
}

const logToneClasses: Record<LogTone, string> = {
  default: "text-slate-500",
  request: "font-medium text-sky-700",
  success: "font-semibold text-emerald-700",
  danger: "font-semibold text-rose-700",
  ignored: "font-medium text-amber-700",
  aborted: "font-medium text-indigo-700",
};
