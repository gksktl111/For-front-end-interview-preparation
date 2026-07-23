import { useRef, useState } from "react";
import {
  RequestFlow,
  RequestResultPanel,
  StateSnapshot,
  TopicSelector,
} from "./shared/RequestDemoPanels";
import { fetchInterviewQuestions } from "./api/client";
import { createLog, pushLog } from "./shared/logs";
import { initialResult, INITIAL_TOPIC_ID, TOPICS } from "./shared/topics";
import type { LogItem, TopicId, TopicResult } from "./shared/types";

export default function AsyncRequestRaceCondition() {
  const [selectedTopicId, setSelectedTopicId] =
    useState<TopicId>(INITIAL_TOPIC_ID);
  const [result, setResult] = useState<TopicResult>(initialResult);
  const [pendingCount, setPendingCount] = useState(0);
  const [timeline, setTimeline] = useState<LogItem[]>([
    createLog("초기 상태: JavaScript 주제와 JavaScript 결과가 일치합니다.", "default"),
  ]);
  const requestSequence = useRef(0);

  const selectTopic = async (topicId: TopicId) => {
    const requestId = ++requestSequence.current;

    setSelectedTopicId(topicId);
    setPendingCount((count) => count + 1);
    pushLog(
      setTimeline,
      `${TOPICS[topicId].label} #${requestId} 요청 시작 (${TOPICS[topicId].delay}ms)`,
      "request",
    );

    const nextResult = await fetchInterviewQuestions(topicId, requestId);

    // 문제 지점: 응답이 최신 선택과 일치하는지 확인하지 않고 그대로 반영합니다.
    setResult(nextResult);
    setPendingCount((count) => Math.max(0, count - 1));
    pushLog(
      setTimeline,
      `${TOPICS[topicId].label} #${requestId} 응답 완료: 현재 선택과 비교하지 않고 결과를 덮어씁니다.`,
      topicId === "react" ? "danger" : "success",
    );
  };

  const reproduceRaceCondition = () => {
    requestSequence.current = 0;
    setSelectedTopicId(INITIAL_TOPIC_ID);
    setResult(initialResult);
    setPendingCount(0);
    setTimeline([createLog("재현 시작: 느린 React 요청을 먼저 보냅니다.", "default")]);

    // 느린 요청을 먼저 보내고 빠른 요청을 곧바로 보내 완료 순서를 뒤집습니다.
    void selectTopic("react");

    window.setTimeout(() => {
      pushLog(
        setTimeline,
        "사용자가 곧바로 JavaScript로 바꿉니다. 이 요청은 더 빨리 끝납니다.",
        "request",
      );
      void selectTopic("javascript");
    }, 120);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-rose-600">
              race condition
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              오래된 요청이 최신 선택을 덮어쓰는 예시
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              이 예제는 일부러 잘못 작성되어 있습니다. 요청이 완료될 때마다
              무조건 <code>setResult</code>를 호출하기 때문에, 느린 이전 응답이
              늦게 도착하면 최신 화면 상태를 다시 과거 결과로 바꿉니다.
            </p>
          </div>

          <button
            className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 sm:w-auto"
            type="button"
            onClick={reproduceRaceCondition}
          >
            문제 재현
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <TopicSelector
              selectedTopicId={selectedTopicId}
              onSelect={(topicId) => void selectTopic(topicId)}
            />
            <StateSnapshot
              pendingCount={pendingCount}
              result={result}
              selectedTopicId={selectedTopicId}
            />
          </div>

          <RequestResultPanel
            result={result}
            selectedTopicId={selectedTopicId}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <RequestFlow logs={timeline} onClear={() => setTimeline([])} />

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <h2 className="text-base font-semibold text-indigo-950">정리</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            <li>비동기 요청의 시작 순서와 완료 순서는 다를 수 있습니다.</li>
            <li>
              완료된 응답을 무조건 상태에 반영하면 오래된 요청이 최신 선택을
              덮어쓸 수 있습니다.
            </li>
            <li>
              실제 코드에서는 요청 번호로 최신 요청인지 확인하거나
              AbortController로 이전 요청을 취소해야 합니다.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
