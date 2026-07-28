import { useEffect, useRef, useState } from "react";

type LogItem = {
  id: number;
  message: string;
  tone: "default" | "warning" | "success";
};

export default function LongTaskPlayground() {
  const [clickCount, setClickCount] = useState(0);
  const [tick, setTick] = useState(0);
  const [isChunkRunning, setIsChunkRunning] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: 1,
      message: "긴 Task 실행 중에는 버튼 클릭과 tick 표시가 늦게 반영됩니다.",
      tone: "default",
    },
  ]);
  const chunkCancelRef = useRef(false);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 250);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const pushLog = (message: string, tone: LogItem["tone"] = "default") => {
    setLogs((previousLogs) => [
      { id: Date.now() + Math.random(), message, tone },
      ...previousLogs.slice(0, 5),
    ]);
  };

  const runBlockingTask = () => {
    pushLog("3초 동안 Main Thread를 점유합니다.", "warning");
    const startedAt = performance.now();

    while (performance.now() - startedAt < 3000) {
      // Main Thread 점유
    }

    pushLog("긴 Task가 끝났습니다. 밀린 렌더링과 입력이 이제 처리됩니다.", "success");
  };

  const runChunkedTask = () => {
    if (isChunkRunning) {
      return;
    }

    setIsChunkRunning(true);
    chunkCancelRef.current = false;
    pushLog("동일한 3초 작업을 작은 chunk로 나눠 실행합니다.", "default");

    const startedAt = performance.now();

    const runNextChunk = () => {
      const deadline = performance.now() + 12;

      while (performance.now() < deadline) {
        Math.sqrt(Math.random() * 1000);
      }

      if (performance.now() - startedAt < 3000 && !chunkCancelRef.current) {
        window.setTimeout(runNextChunk, 0);
        return;
      }

      setIsChunkRunning(false);
      pushLog("chunk 작업이 끝났습니다. 중간중간 입력 처리 기회가 있었습니다.", "success");
    };

    runNextChunk();
  };

  useEffect(() => {
    return () => {
      chunkCancelRef.current = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">
              main thread
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              긴 JavaScript Task 재현
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              tick은 250ms마다 증가합니다. 긴 동기 작업을 실행한 뒤 버튼 반응과
              tick 갱신이 어떻게 밀리는지 관찰하세요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
              type="button"
              onClick={runBlockingTask}
            >
              긴 Task 실행
            </button>
            <button
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              disabled={isChunkRunning}
              type="button"
              onClick={runChunkedTask}
            >
              chunk 실행
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <MetricCard label="interval tick" value={String(tick)} />
          <MetricCard label="button clicks" value={String(clickCount)} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              interaction
            </p>
            <button
              className="mt-4 w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              type="button"
              onClick={() => setClickCount((count) => count + 1)}
            >
              반응 확인 버튼
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-950">실행 로그</h2>
            <button
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              type="button"
              onClick={() => setLogs([])}
            >
              지우기
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {logs.map((log) => (
              <p
                className={`rounded-xl border px-3 py-2 text-sm leading-6 ${
                  log.tone === "warning"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : log.tone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
                key={log.id}
              >
                {log.message}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <h2 className="text-base font-semibold text-indigo-950">정리</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            <li>Main Thread는 JavaScript 실행과 사용자 입력 처리를 담당합니다.</li>
            <li>긴 동기 작업은 클릭, 스크롤, 렌더링을 지연시킵니다.</li>
            <li>작업을 작은 단위로 나누면 브라우저가 중간에 숨을 돌릴 수 있습니다.</li>
            <li>실제 병목은 DevTools Performance 탭에서 Long Task로 확인합니다.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-4xl font-semibold tabular-nums tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
