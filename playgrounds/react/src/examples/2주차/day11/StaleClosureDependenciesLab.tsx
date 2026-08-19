import { useEffect, useState } from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

export default function StaleClosureDependenciesLab() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [staleObserved, setStaleObserved] = useState<number | null>(null);
  const [freshObserved, setFreshObserved] = useState<number | null>(null);
  const [staleSetups, setStaleSetups] = useState(0);
  const [staleCleanups, setStaleCleanups] = useState(0);
  const [freshSetups, setFreshSetups] = useState(0);
  const [freshCleanups, setFreshCleanups] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const capturedCount = count;

    setStaleSetups((previous) => previous + 1);
    const timerId = window.setInterval(() => {
      setStaleObserved(capturedCount);
    }, 900);

    return () => {
      window.clearInterval(timerId);
      setStaleCleanups((previous) => previous + 1);
    };
    // 학습용: count를 dependency에서 일부러 뺀 stale closure 예시입니다.
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const capturedCount = count;

    setFreshSetups((previous) => previous + 1);
    const timerId = window.setInterval(() => {
      setFreshObserved(capturedCount);
    }, 900);

    return () => {
      window.clearInterval(timerId);
      setFreshCleanups((previous) => previous + 1);
    };
  }, [count, isRunning]);

  const resetCount = () => {
    setCount(0);
    setStaleObserved(null);
    setFreshObserved(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Stale closure"
          title="같은 timer가 어떤 렌더의 count를 기억하는지 비교하기"
          description="Timer를 시작한 뒤 count를 올리면 왼쪽 callback은 시작 시점 값을 계속 읽고, 오른쪽 Effect는 count 변경마다 cleanup 후 새 callback을 연결합니다."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            type="button"
            onClick={() => setCount((previous) => previous + 1)}
          >
            count + 1
          </button>
          <button
            className={
              "rounded-xl border px-4 py-2.5 text-sm font-semibold transition " +
              (isRunning
                ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100")
            }
            type="button"
            onClick={() => setIsRunning((previous) => !previous)}
          >
            {isRunning ? "timer 정지" : "timer 시작"}
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={resetCount}
          >
            count 초기화
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-950">
              위험: count를 dependency에서 누락
            </p>
            <p className="mt-1 text-sm leading-6 text-rose-800">
              timer는 시작된 렌더의 count를 계속 캡처합니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="callback observed" tone="rose" value={staleObserved ?? "대기"} />
              <Metric label="setup / cleanup" tone="rose" value={staleSetups + " / " + staleCleanups} />
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              재동기화: [count] dependency
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              count가 바뀌면 기존 timer를 정리하고 최신 snapshot을 캡처한 timer를 만듭니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="callback observed" tone="emerald" value={freshObserved ?? "대기"} />
              <Metric label="setup / cleanup" tone="emerald" value={freshSetups + " / " + freshCleanups} />
            </div>
          </article>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Metric label="current React count" tone="indigo" value={count} />
          <Metric
            label="timer state"
            tone={isRunning ? "indigo" : "default"}
            value={isRunning ? "running" : "stopped"}
          />
        </div>
      </section>

      <PracticeSummary
        points={[
          "Effect callback은 자신이 만들어진 렌더의 State Snapshot을 캡처하므로 dependency 누락은 stale closure를 만들 수 있습니다.",
          "최신 값으로 외부 연결을 다시 설정해야 한다면 dependency에 넣고 cleanup 후 새 setup을 만듭니다.",
          "이전 State를 기준으로 누적 업데이트만 하면 되는 경우에는 함수형 업데이트가 Effect 재연결보다 알맞을 수 있습니다.",
        ]}
      />
    </div>
  );
}
