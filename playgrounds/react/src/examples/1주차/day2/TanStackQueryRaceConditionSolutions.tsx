import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { RequestFlow } from "./shared/RequestDemoPanels";
import { fetchInterviewQuestions } from "./api/client";
import { createLog, pushLog } from "./shared/logs";
import { initialResult, INITIAL_TOPIC_ID, TOPICS } from "./shared/topics";
import type { LogItem, TopicId, TopicResult } from "./shared/types";

type QuerySolutionMode = "query-key" | "query-key-abort";
type InterviewQuestionsQueryKey = readonly ["interview-questions", TopicId];
type CacheNoteMap = Record<TopicId, string>;

const QUERY_SOLUTION_META: Record<
  QuerySolutionMode,
  {
    label: string;
    title: string;
    description: string;
  }
> = {
  "query-key": {
    label: "queryKey 분리",
    title: "queryKey로 결과 캐시 분리",
    description:
      "이전 요청은 취소하지 않고 끝까지 실행합니다. 늦은 응답은 자기 queryKey 캐시에만 저장됩니다.",
  },
  "query-key-abort": {
    label: "queryKey + AbortSignal",
    title: "queryKey 분리와 요청 취소",
    description:
      "queryKey로 캐시를 분리하고, queryFn이 받은 signal을 fetch에 전달해 이전 요청을 취소합니다.",
  },
};

const emptyCacheNotes: CacheNoteMap = {
  react: "캐시 없음",
  javascript: "캐시 없음",
};

function getInterviewQuestionsQueryKey(
  topicId: TopicId,
): InterviewQuestionsQueryKey {
  return ["interview-questions", topicId];
}

export default function TanStackQueryRaceConditionSolutions() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: Infinity,
            retry: false,
            staleTime: Infinity,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TanStackQueryRaceConditionSolutionsInner />
    </QueryClientProvider>
  );
}

function TanStackQueryRaceConditionSolutionsInner() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<QuerySolutionMode>("query-key");
  const [selectedTopicId, setSelectedTopicId] =
    useState<TopicId>(INITIAL_TOPIC_ID);
  const [scenarioStarted, setScenarioStarted] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([
    createLog("TanStack Query 해결 방식을 선택한 뒤 같은 요청 순서로 실행합니다.", "default"),
  ]);
  const [cacheNotes, setCacheNotes] =
    useState<CacheNoteMap>(emptyCacheNotes);
  const requestSequence = useRef(0);
  const selectedTopicRef = useRef<TopicId>(selectedTopicId);
  const scenarioTimerRef = useRef<number | null>(null);

  useEffect(() => {
    selectedTopicRef.current = selectedTopicId;
  }, [selectedTopicId]);

  useEffect(() => {
    return () => {
      if (scenarioTimerRef.current !== null) {
        window.clearTimeout(scenarioTimerRef.current);
      }
    };
  }, []);

  const currentQueryKey = getInterviewQuestionsQueryKey(selectedTopicId);

  const query = useQuery<
    TopicResult,
    Error,
    TopicResult,
    InterviewQuestionsQueryKey
  >({
    enabled: scenarioStarted,
    queryKey: currentQueryKey,
    queryFn: async ({ queryKey, signal }) => {
      const [, topicId] = queryKey;
      const requestId = ++requestSequence.current;
      const shouldUseSignal = mode === "query-key-abort";

      setCacheNotes((notes) => ({
        ...notes,
        [topicId]: "요청 중",
      }));
      pushLog(
        setLogs,
        `${TOPICS[topicId].label} #${requestId} 요청 실행: queryKey ${formatQueryKey(queryKey)}`,
        "request",
      );

      try {
        const nextResult = await fetchInterviewQuestions(
          topicId,
          requestId,
          shouldUseSignal ? signal : undefined,
        );
        const isCurrentTopic = selectedTopicRef.current === topicId;

        setCacheNotes((notes) => ({
          ...notes,
          [topicId]: isCurrentTopic
            ? "현재 화면에서 구독 중, 데이터 저장"
            : "요청 완료, 이전 queryKey 캐시에 데이터 저장",
        }));
        pushLog(
          setLogs,
          `${TOPICS[topicId].label} #${requestId} 응답 완료: ${isCurrentTopic ? "현재 queryKey 데이터로 표시됩니다." : "이전 queryKey 캐시에만 저장됩니다."}`,
          isCurrentTopic ? "success" : "ignored",
        );
        window.setTimeout(() => {
          setCacheNotes((notes) => ({ ...notes }));
        }, 0);

        return nextResult;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setCacheNotes((notes) => ({
            ...notes,
            [topicId]: "요청 취소, 성공 데이터 없음",
          }));
          pushLog(
            setLogs,
            `${TOPICS[topicId].label} #${requestId} 요청 취소: AbortError가 발생했습니다.`,
            "aborted",
          );
        }

        throw error;
      }
    },
  });

  const runScenario = () => {
    if (scenarioTimerRef.current !== null) {
      window.clearTimeout(scenarioTimerRef.current);
    }

    void queryClient.cancelQueries({
      queryKey: ["interview-questions"],
    });
    queryClient.removeQueries({
      queryKey: ["interview-questions"],
    });
    requestSequence.current = 0;
    setScenarioStarted(false);
    setSelectedTopicId("react");
    setCacheNotes({
      react: "요청 시작 대기",
      javascript: "캐시 없음",
    });
    setLogs([
      createLog(
        `${QUERY_SOLUTION_META[mode].label} 모드로 느린 React 요청을 먼저 시작합니다.`,
        "default",
      ),
    ]);

    // enabled를 켠 뒤 selectedTopicId가 바뀔 때마다 TanStack Query가 새 queryKey를 구독합니다.
    setScenarioStarted(true);

    scenarioTimerRef.current = window.setTimeout(() => {
      pushLog(
        setLogs,
        "120ms 후 JavaScript로 변경합니다. JavaScript queryKey를 새로 구독합니다.",
        "request",
      );
      setSelectedTopicId("javascript");
      setCacheNotes((notes) => ({
        ...notes,
        javascript: "요청 시작 대기",
      }));
    }, 120);
  };

  const handleModeChange = (nextMode: QuerySolutionMode) => {
    if (scenarioTimerRef.current !== null) {
      window.clearTimeout(scenarioTimerRef.current);
    }

    void queryClient.cancelQueries({
      queryKey: ["interview-questions"],
    });
    queryClient.removeQueries({
      queryKey: ["interview-questions"],
    });
    requestSequence.current = 0;
    setMode(nextMode);
    setScenarioStarted(false);
    setSelectedTopicId(INITIAL_TOPIC_ID);
    setCacheNotes(emptyCacheNotes);
    setLogs([
      createLog(`${QUERY_SOLUTION_META[nextMode].label} 모드로 전환했습니다.`, "default"),
    ]);
  };

  const displayedResult = query.data ?? initialResult;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
            TanStack Query
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            queryKey와 AbortSignal로 레이스 컨디션 막기
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            TanStack Query는 요청 완료 순서를 보장하지 않습니다. 대신
            queryKey로 조회 조건별 캐시를 분리하고, 필요하면 queryFn의 signal을
            실제 요청 함수에 전달해 불필요한 요청을 취소합니다.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <QueryModeSelector
              mode={mode}
              onChange={handleModeChange}
            />

            <button
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
              type="button"
              onClick={runScenario}
            >
              같은 조건으로 실행
            </button>

            <QueryStatePanel
              currentQueryKey={currentQueryKey}
              displayedResult={displayedResult}
              hasData={Boolean(query.data)}
              isFetching={query.isFetching}
              isPending={query.isPending}
              mode={mode}
              selectedTopicId={selectedTopicId}
            />
          </div>

          <QueryResultPanel
            result={displayedResult}
            selectedTopicId={selectedTopicId}
            hasData={Boolean(query.data)}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <RequestFlow logs={logs} onClear={() => setLogs([])} />

        <QueryCacheSnapshot
          cacheNotes={cacheNotes}
          queryClient={queryClient}
        />
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
        <h2 className="text-base font-semibold text-indigo-950">정리</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>
            queryKey는 조회 조건별로 캐시를 분리하여 오래된 응답이 현재 UI를
            덮어쓰지 못하게 합니다.
          </li>
          <li>
            AbortSignal은 더 이상 필요하지 않은 이전 요청 자체를 중단하여
            네트워크와 응답 처리 비용을 줄입니다.
          </li>
          <li>
            queryKey는 데이터 정합성을 위한 핵심 구조이고, AbortSignal은 요청
            취소가 필요한 경우 추가하는 보완책입니다.
          </li>
        </ul>
      </section>
    </div>
  );
}

function QueryModeSelector({
  mode,
  onChange,
}: {
  mode: QuerySolutionMode;
  onChange: (mode: QuerySolutionMode) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">해결 방식</p>
      <div className="mt-3 grid gap-3">
        {(["query-key", "query-key-abort"] as const).map((nextMode) => (
          <button
            className={`rounded-xl border px-4 py-3 text-left transition ${
              mode === nextMode
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
            }`}
            key={nextMode}
            type="button"
            onClick={() => onChange(nextMode)}
          >
            <span className="block text-sm font-semibold">
              {QUERY_SOLUTION_META[nextMode].title}
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {QUERY_SOLUTION_META[nextMode].description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QueryStatePanel({
  currentQueryKey,
  displayedResult,
  hasData,
  isFetching,
  isPending,
  mode,
  selectedTopicId,
}: {
  currentQueryKey: InterviewQuestionsQueryKey;
  displayedResult: TopicResult;
  hasData: boolean;
  isFetching: boolean;
  isPending: boolean;
  mode: QuerySolutionMode;
  selectedTopicId: TopicId;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        TanStack Query state
      </p>
      <dl className="mt-3 space-y-3 text-sm">
        <StateRow label="mode" value={QUERY_SOLUTION_META[mode].label} />
        <StateRow label="selectedTopic" value={TOPICS[selectedTopicId].label} />
        <StateRow label="queryKey" value={formatQueryKey(currentQueryKey)} />
        <StateRow
          label="result.topic"
          tone={
            hasData && selectedTopicId === displayedResult.topicId
              ? "success"
              : hasData
                ? "danger"
                : undefined
          }
          value={hasData ? TOPICS[displayedResult.topicId].label : "없음"}
        />
        <StateRow label="isPending" value={String(isPending)} />
        <StateRow label="isFetching" value={String(isFetching)} />
      </dl>
    </div>
  );
}

function QueryResultPanel({
  hasData,
  result,
  selectedTopicId,
}: {
  hasData: boolean;
  result: TopicResult;
  selectedTopicId: TopicId;
}) {
  const selectedTopic = TOPICS[selectedTopicId];
  const resultTopic = TOPICS[result.topicId];
  const isMatched = selectedTopicId === result.topicId;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isMatched ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
            현재 UI가 구독 중인 쿼리 데이터
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {hasData ? resultTopic.label : "데이터 대기"}
          </h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
          {hasData ? `#${result.requestId} · ${result.delay}ms` : "pending"}
        </span>
      </div>

      <p className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700">
        {hasData
          ? `${selectedTopic.label} queryKey를 구독 중이며 ${resultTopic.label} 데이터가 표시됩니다.`
          : `${selectedTopic.label} queryKey를 구독 중이며 응답을 기다리고 있습니다.`}
      </p>

      {hasData && (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          {result.questions.map((question) => (
            <li className="rounded-xl bg-white px-4 py-3" key={question}>
              {question}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QueryCacheSnapshot({
  cacheNotes,
  queryClient,
}: {
  cacheNotes: CacheNoteMap;
  queryClient: QueryClient;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-semibold text-slate-950">쿼리 캐시</h2>
      <div className="mt-4 grid gap-3">
        {(["react", "javascript"] as const).map((topicId) => {
          const queryState = queryClient.getQueryState<TopicResult>(
            getInterviewQuestionsQueryKey(topicId),
          );
          const data = queryState?.data;

          return (
            <div
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              key={topicId}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950">
                  {TOPICS[topicId].label} 캐시
                </h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                  {queryState?.status ?? "empty"} /{" "}
                  {queryState?.fetchStatus ?? "idle"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {cacheNotes[topicId]}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                queryKey: {formatQueryKey(getInterviewQuestionsQueryKey(topicId))}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                저장된 데이터: {data ? `${TOPICS[data.topicId].label} #${data.requestId}` : "없음"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StateRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "success" | "danger";
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`break-all text-right font-semibold ${
          tone === "success"
            ? "text-emerald-700"
            : tone === "danger"
              ? "text-rose-700"
              : "text-slate-950"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatQueryKey(queryKey: readonly unknown[]) {
  return JSON.stringify(queryKey);
}
