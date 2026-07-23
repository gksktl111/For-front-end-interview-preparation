import { useRef, useState } from "react";
import {
  RequestFlow,
  RequestResultPanel,
  StateSnapshot,
} from "./shared/RequestDemoPanels";
import { fetchInterviewQuestions } from "./api/client";
import { createLog, pushLog } from "./shared/logs";
import { initialResult, INITIAL_TOPIC_ID, TOPICS } from "./shared/topics";
import type { LogItem, TopicId, TopicResult } from "./shared/types";

type SolutionMode = "request-id" | "abort";

const SOLUTION_META: Record<
  SolutionMode,
  {
    label: string;
    title: string;
    description: string;
    summary: string;
  }
> = {
  "request-id": {
    label: "요청 번호",
    title: "최신 요청 번호만 상태에 반영",
    description:
      "요청마다 증가하는 id를 붙이고, 응답 시점에 가장 최신 id인지 검사합니다.",
    summary:
      "취소할 수 없는 Promise라도 오래된 응답이 UI를 덮어쓰지 못하게 막을 수 있습니다.",
  },
  abort: {
    label: "요청 취소",
    title: "이전 요청을 AbortController로 취소",
    description:
      "새 요청이 시작될 때 이전 controller를 abort해서 더 이상 필요 없는 fetch를 종료합니다.",
    summary:
      "네트워크 요청 자체를 중단할 수 있어 불필요한 응답 처리까지 줄일 수 있습니다.",
  },
};

export default function AsyncRequestRaceConditionSolutions() {
  const [mode, setMode] = useState<SolutionMode>("request-id");
  const [selectedTopicId, setSelectedTopicId] =
    useState<TopicId>(INITIAL_TOPIC_ID);
  const [result, setResult] = useState<TopicResult>(initialResult);
  const [pendingCount, setPendingCount] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([
    createLog("해결 방식을 선택한 뒤 같은 요청 순서로 실행해 봅니다.", "default"),
  ]);
  const requestSequence = useRef(0);
  const latestRequestId = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const runScenario = () => {
    controllerRef.current?.abort();
    requestSequence.current = 0;
    latestRequestId.current = 0;
    setSelectedTopicId(INITIAL_TOPIC_ID);
    setResult(initialResult);
    setPendingCount(0);
    setLogs([
      createLog(
        `${SOLUTION_META[mode].label} 방식으로 같은 레이스 조건을 실행합니다.`,
        "default",
      ),
    ]);

    // 재현 예제와 동일하게 느린 요청 후 빠른 요청을 보내되, 반영 규칙만 바꿉니다.
    startRequest("react");

    window.setTimeout(() => {
      pushLog(
        setLogs,
        "사용자가 곧바로 JavaScript로 변경합니다. JavaScript 응답이 먼저 도착합니다.",
        "request",
      );
      startRequest("javascript");
    }, 120);
  };

  const startRequest = (topicId: TopicId) => {
    if (mode === "request-id") {
      void startWithRequestId(topicId);
      return;
    }

    void startWithAbort(topicId);
  };

  const startWithRequestId = async (topicId: TopicId) => {
    const requestId = ++requestSequence.current;
    latestRequestId.current = requestId;

    setSelectedTopicId(topicId);
    setPendingCount((count) => count + 1);
    pushLog(
      setLogs,
      `${TOPICS[topicId].label} #${requestId} 요청 시작: latestRequestId를 ${requestId}로 갱신합니다.`,
      "request",
    );

    const nextResult = await fetchInterviewQuestions(topicId, requestId);

    setPendingCount((count) => Math.max(0, count - 1));

    // 요청 번호 방식: 응답이 늦게 와도 자신의 id가 최신이 아니면 상태를 바꾸지 않습니다.
    if (requestId !== latestRequestId.current) {
      pushLog(
        setLogs,
        `${TOPICS[topicId].label} #${requestId} 응답 무시: 최신 요청은 #${latestRequestId.current}입니다.`,
        "ignored",
      );
      return;
    }

    setResult(nextResult);
    pushLog(
      setLogs,
      `${TOPICS[topicId].label} #${requestId} 응답 반영: 최신 요청과 일치합니다.`,
      "success",
    );
  };

  const startWithAbort = async (topicId: TopicId) => {
    // 취소 방식: 새 요청이 이전 요청을 대체하므로 이전 controller에 취소 신호를 보냅니다.
    controllerRef.current?.abort();

    const requestId = ++requestSequence.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    setSelectedTopicId(topicId);
    setPendingCount((count) => count + 1);
    pushLog(
      setLogs,
      `${TOPICS[topicId].label} #${requestId} 요청 시작: 이전 요청은 먼저 취소합니다.`,
      "request",
    );

    try {
      const nextResult = await fetchInterviewQuestions(
        topicId,
        requestId,
        controller.signal,
      );

      setResult(nextResult);
      pushLog(
        setLogs,
        `${TOPICS[topicId].label} #${requestId} 응답 반영: 취소되지 않은 요청입니다.`,
        "success",
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        pushLog(
          setLogs,
          `${TOPICS[topicId].label} #${requestId} 요청 취소: 새 요청으로 대체되었습니다.`,
          "aborted",
        );
        return;
      }

      pushLog(setLogs, `${TOPICS[topicId].label} #${requestId} 요청 실패`, "ignored");
    } finally {
      setPendingCount((count) => Math.max(0, count - 1));
    }
  };

  const selectedTopic = TOPICS[selectedTopicId];
  const resultTopic = TOPICS[result.topicId];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
            race condition solutions
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            오래된 응답을 막는 두 가지 방법
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            같은 요청 순서를 실행하되, 응답 반영 규칙을 추가합니다. 핵심은
            응답이 도착한 시점에 그 응답이 아직 유효한지 판단하는 것입니다.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">해결 방식</p>
              <div className="mt-3 grid gap-3">
                {(["request-id", "abort"] as const).map((nextMode) => (
                  <button
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      mode === nextMode
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                    key={nextMode}
                    type="button"
                    onClick={() => setMode(nextMode)}
                  >
                    <span className="block text-sm font-semibold">
                      {SOLUTION_META[nextMode].title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {SOLUTION_META[nextMode].description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
              type="button"
              onClick={runScenario}
            >
              같은 조건으로 실행
            </button>

            <StateSnapshot
              pendingCount={pendingCount}
              result={result}
              selectedTopicId={selectedTopicId}
            />
          </div>

          <RequestResultPanel
            matchedMessage={`${selectedTopic.label} 선택과 ${resultTopic.label} 결과가 일치합니다.`}
            mismatchMessage="아직 이전 응답이 정리되는 중입니다."
            result={result}
            selectedTopicId={selectedTopicId}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <RequestFlow logs={logs} onClear={() => setLogs([])} />

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <h2 className="text-base font-semibold text-indigo-950">정리</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            <li>{SOLUTION_META[mode].summary}</li>
            <li>
              요청 번호 방식은 응답을 버리는 방식이고, AbortController는 요청
              자체를 취소하는 방식입니다.
            </li>
            <li>
              React effect에서 요청을 시작한다면 cleanup에서 abort를 호출해
              컴포넌트 unmount와 의존성 변경을 함께 처리할 수 있습니다.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
