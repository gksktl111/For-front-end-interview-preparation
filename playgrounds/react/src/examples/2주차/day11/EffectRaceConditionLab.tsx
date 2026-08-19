import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEffectUser } from "./api/client";
import { getEffectUserLabel } from "./api/types";
import type { EffectUser } from "./api/types";
import {
  EffectTimeline,
  Metric,
  PanelHeading,
  PracticeSummary,
} from "./shared";
import type { TimelineItem, TimelineTone } from "./shared";

type RaceMode = "unsafe" | "ignore";
type SelectableUserId = "user-a" | "user-b";

const modeMeta: Record<
  RaceMode,
  {
    description: string;
    label: string;
    tone: TimelineTone;
  }
> = {
  unsafe: {
    description:
      "이전 Effect cleanup 뒤에도 응답을 그대로 setState합니다. 느린 A가 최신 B를 덮을 수 있습니다.",
    label: "위험: 응답을 무조건 반영",
    tone: "rose",
  },
  ignore: {
    description:
      "cleanup에서 이전 Effect를 무효화하고, 늦게 도착한 응답은 상태에 반영하지 않습니다.",
    label: "보호: 오래된 응답 무시",
    tone: "emerald",
  },
};

export default function EffectRaceConditionLab() {
  const [mode, setMode] = useState<RaceMode>("unsafe");
  const [selectedUserId, setSelectedUserId] = useState<SelectableUserId | null>(
    null,
  );
  const [result, setResult] = useState<EffectUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [round, setRound] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const activeRoundRef = useRef(0);
  const requestSequence = useRef(0);
  const logSequence = useRef(0);
  const scenarioTimerRef = useRef<number | null>(null);

  const appendLog = useCallback((message: string, tone: TimelineTone) => {
    setTimeline((previous) =>
      [...previous, { id: ++logSequence.current, message, tone }].slice(-10),
    );
  }, []);

  useEffect(() => {
    return () => {
      if (scenarioTimerRef.current !== null) {
        window.clearTimeout(scenarioTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedUserId === null) {
      return;
    }

    let ignore = false;
    const requestId = ++requestSequence.current;
    const requestedUserId = selectedUserId;

    setPendingCount((previous) => previous + 1);
    appendLog(
      "#" +
        requestId +
        " " +
        getEffectUserLabel(requestedUserId) +
        " 요청 시작",
      "indigo",
    );

    async function loadUser() {
      try {
        const user = await fetchEffectUser(requestedUserId);

        if (round !== activeRoundRef.current) {
          return;
        }

        if (mode === "ignore" && ignore) {
          appendLog(
            "#" +
              requestId +
              " " +
              getEffectUserLabel(requestedUserId) +
              " 응답 무시: 이전 Effect의 cleanup이 이미 실행되었습니다.",
            "sky",
          );
          return;
        }

        setResult(user);
        appendLog(
          "#" +
            requestId +
            " " +
            getEffectUserLabel(requestedUserId) +
            " 응답 반영",
          mode === "unsafe" && requestedUserId === "user-a" ? "rose" : "emerald",
        );
      } catch (caughtError) {
        if (round !== activeRoundRef.current) {
          return;
        }

        const message =
          caughtError instanceof Error ? caughtError.message : "알 수 없는 오류";

        setError(message);
        appendLog("#" + requestId + " 요청 실패: " + message, "rose");
      } finally {
        if (round === activeRoundRef.current) {
          setPendingCount((previous) => Math.max(0, previous - 1));
        }
      }
    }

    void loadUser();

    return () => {
      if (mode === "ignore") {
        ignore = true;

        if (round === activeRoundRef.current) {
          appendLog(
            "#" +
              requestId +
              " cleanup: 이후 도착하는 " +
              getEffectUserLabel(requestedUserId) +
              " 응답은 무시합니다.",
            "sky",
          );
        }
      }
    };
  }, [appendLog, mode, round, selectedUserId]);

  const beginRound = (message: string) => {
    if (scenarioTimerRef.current !== null) {
      window.clearTimeout(scenarioTimerRef.current);
      scenarioTimerRef.current = null;
    }

    const nextRound = activeRoundRef.current + 1;

    activeRoundRef.current = nextRound;
    setRound(nextRound);
    setSelectedUserId(null);
    setResult(null);
    setError(null);
    setPendingCount(0);
    setTimeline([
      {
        id: ++logSequence.current,
        message,
        tone: "default",
      },
    ]);

    return nextRound;
  };

  const runRaceScenario = () => {
    const nextRound = beginRound(
      "재현 시작: 느린 User A를 먼저 요청하고 160ms 뒤 빠른 User B를 요청합니다.",
    );

    setSelectedUserId("user-a");
    scenarioTimerRef.current = window.setTimeout(() => {
      if (activeRoundRef.current !== nextRound) {
        return;
      }

      appendLog("사용자 선택 변경: 이제 User B가 현재 화면의 선택값입니다.", "indigo");
      setSelectedUserId("user-b");
      scenarioTimerRef.current = null;
    }, 160);
  };

  const resetScenario = () => {
    beginRound("초기화했습니다. 새 시나리오를 실행할 수 있습니다.");
  };

  const isScenarioActive = selectedUserId !== null;
  const resultMatches =
    selectedUserId !== null && result !== null && result.id === selectedUserId;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Async effect"
          title="느린 이전 응답이 최신 선택을 덮어쓰는지 관찰하기"
          description="Effect가 선택된 userId마다 실제 Mock API 요청을 보냅니다. A는 2.2초, B는 0.45초 후 응답하므로 같은 시작 순서에서도 완료 순서가 뒤집힙니다."
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {(["unsafe", "ignore"] as const).map((nextMode) => (
            <button
              className={
                "rounded-xl border p-4 text-left transition " +
                (mode === nextMode
                  ? nextMode === "unsafe"
                    ? "border-rose-300 bg-rose-50"
                    : "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300") +
                (isScenarioActive ? " cursor-not-allowed opacity-60" : "")
              }
              disabled={isScenarioActive}
              key={nextMode}
              type="button"
              onClick={() => setMode(nextMode)}
            >
              <span className="block text-sm font-semibold text-slate-950">
                {modeMeta[nextMode].label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-slate-600">
                {modeMeta[nextMode].description}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            type="button"
            onClick={runRaceScenario}
          >
            A → B Race Condition 실행
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={resetScenario}
          >
            초기화
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Metric
              label="current selected user"
              tone="indigo"
              value={selectedUserId ? getEffectUserLabel(selectedUserId) : "선택 없음"}
            />
            <Metric label="pending requests" tone="sky" value={pendingCount} />
            <Metric
              label="response shown"
              tone={resultMatches ? "emerald" : result ? "rose" : "default"}
              value={result ? getEffectUserLabel(result.id) : "응답 대기"}
            />
          </div>

          <article
            className={
              "rounded-2xl border p-5 " +
              (result
                ? resultMatches
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
                : "border-slate-200 bg-slate-50")
            }
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              화면에 반영된 결과
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              {result ? result.name : "응답을 기다리는 중"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {result
                ? result.role + " · " + result.responseDelay + "ms 응답"
                : "시나리오를 실행하면 User A와 User B 요청의 완료 순서를 비교합니다."}
            </p>
            {result && (
              <p
                className={
                  "mt-4 rounded-xl border px-3 py-2.5 text-sm font-semibold " +
                  (resultMatches
                    ? "border-emerald-200 bg-white text-emerald-700"
                    : "border-rose-200 bg-white text-rose-700")
                }
              >
                {resultMatches
                  ? "현재 선택과 응답이 일치합니다."
                  : "오래된 응답이 최신 선택을 덮어썼습니다."}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-rose-700">
                {error}
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Request timeline</h2>
        <div className="mt-4">
          <EffectTimeline
            emptyMessage="실행 버튼을 누르면 request와 cleanup 흐름이 기록됩니다."
            items={timeline}
          />
        </div>
      </section>

      <PracticeSummary
        points={[
          "요청을 먼저 시작했다고 먼저 끝난다는 보장은 없으므로, 응답 완료 순서만 믿고 setState하면 Race Condition이 생깁니다.",
          "ignore flag는 cleanup 뒤 도착한 이전 응답을 무시하지만, 요청 자체는 계속 진행됩니다.",
          "다음 실습에서는 AbortController로 같은 이전 요청을 실제 취소합니다.",
        ]}
      />
    </div>
  );
}
