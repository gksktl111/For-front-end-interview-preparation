import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEffectUser, isAbortError } from "./api/client";
import { getEffectUserLabel } from "./api/types";
import type { EffectUser, EffectUserId } from "./api/types";
import {
  EffectTimeline,
  Metric,
  PanelHeading,
  PracticeSummary,
} from "./shared";
import type { TimelineItem, TimelineTone } from "./shared";

export default function AbortControllerLab() {
  const [selectedUserId, setSelectedUserId] = useState<EffectUserId | null>(
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

    const controller = new AbortController();
    const requestId = ++requestSequence.current;
    const requestedUserId = selectedUserId;
    let settled = false;

    setPendingCount((previous) => previous + 1);
    appendLog(
      "#" +
        requestId +
        " " +
        getEffectUserLabel(requestedUserId) +
        " 요청 시작: controller.signal을 fetch에 전달했습니다.",
      "indigo",
    );

    async function loadUser() {
      try {
        const user = await fetchEffectUser(requestedUserId, controller.signal);

        if (round !== activeRoundRef.current) {
          return;
        }

        setResult(user);
        appendLog(
          "#" +
            requestId +
            " 응답 반영: 취소되지 않은 최신 요청입니다.",
          "emerald",
        );
      } catch (caughtError) {
        if (round !== activeRoundRef.current) {
          return;
        }

        if (isAbortError(caughtError)) {
          appendLog(
            "#" +
              requestId +
              " AbortError 처리: 일반 오류가 아닌 정상 취소 흐름입니다.",
            "sky",
          );
          return;
        }

        const message =
          caughtError instanceof Error ? caughtError.message : "알 수 없는 오류";

        setError(message);
        appendLog(
          "#" +
            requestId +
            " 요청 실패: response.ok 검사 뒤 HTTP 오류로 처리했습니다.",
          "rose",
        );
      } finally {
        settled = true;

        if (round === activeRoundRef.current) {
          setPendingCount((previous) => Math.max(0, previous - 1));
        }
      }
    }

    void loadUser();

    return () => {
      if (!settled && round === activeRoundRef.current) {
        appendLog(
          "#" +
            requestId +
            " cleanup: controller.abort()로 이전 요청을 취소합니다.",
          "sky",
        );
      }

      controller.abort();
    };
  }, [appendLog, round, selectedUserId]);

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

  const runAbortScenario = () => {
    const nextRound = beginRound(
      "재현 시작: 느린 User A 요청을 보낸 뒤 160ms 후 User B로 변경합니다.",
    );

    setSelectedUserId("user-a");
    scenarioTimerRef.current = window.setTimeout(() => {
      if (activeRoundRef.current !== nextRound) {
        return;
      }

      appendLog(
        "userId 변경: 이전 Effect cleanup이 A의 controller.abort()를 호출합니다.",
        "indigo",
      );
      setSelectedUserId("user-b");
      scenarioTimerRef.current = null;
    }, 160);
  };

  const runHttpErrorScenario = () => {
    beginRound(
      "HTTP 500 응답을 요청합니다. fetch가 Response를 반환한 뒤 response.ok 검사가 오류를 만듭니다.",
    );
    setSelectedUserId("error");
  };

  const resetScenario = () => {
    beginRound("초기화했습니다. 새 요청을 실행할 수 있습니다.");
  };

  const resultMatches =
    selectedUserId !== null && result !== null && result.id === selectedUserId;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="AbortController"
          title="Effect cleanup에서 이전 fetch 요청 취소하기"
          description="A 요청이 진행 중일 때 userId를 B로 바꾸면 cleanup이 controller.abort()를 호출합니다. HTTP 500 버튼으로 response.ok 검사도 함께 확인할 수 있습니다."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            type="button"
            onClick={runAbortScenario}
          >
            A → B 요청 취소 실행
          </button>
          <button
            className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            type="button"
            onClick={runHttpErrorScenario}
          >
            HTTP 500 응답 요청
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
              label="current userId"
              tone="indigo"
              value={selectedUserId ? getEffectUserLabel(selectedUserId) : "선택 없음"}
            />
            <Metric label="pending requests" tone="sky" value={pendingCount} />
            <Metric
              label="request result"
              tone={error ? "rose" : resultMatches ? "emerald" : "default"}
              value={error ? "HTTP error" : result ? getEffectUserLabel(result.id) : "대기"}
            />
          </div>

          <article
            className={
              "rounded-2xl border p-5 " +
              (error
                ? "border-rose-200 bg-rose-50"
                : resultMatches
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50")
            }
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              fetch 처리 결과
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              {error ? "오류 상태" : result ? result.name : "결과 대기"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {error
                ? error
                : result
                  ? result.role + " · " + result.responseDelay + "ms 응답"
                  : "취소된 A는 AbortError로 분리하고, 최신 B만 화면에 반영됩니다."}
            </p>
            {error && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-semibold text-rose-700">
                HTTP 500도 fetch 자체는 Response를 반환할 수 있으므로 response.ok 검사가 필요합니다.
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">Request timeline</h2>
        <div className="mt-4">
          <EffectTimeline
            emptyMessage="실행 버튼을 누르면 signal 전달, cleanup abort, AbortError 흐름이 기록됩니다."
            items={timeline}
          />
        </div>
      </section>

      <PracticeSummary
        points={[
          "AbortController는 취소 신호를 만들고, signal을 fetch에 전달해야 요청이 그 신호를 받습니다.",
          "dependency 변경 때 cleanup이 controller.abort()를 호출하면 이전 요청이 새 요청의 결과를 방해하지 못합니다.",
          "AbortError는 정상 취소로 분리하고, HTTP 500 같은 응답 오류는 response.ok 검사로 일반 오류 상태로 만듭니다.",
        ]}
      />
    </div>
  );
}
