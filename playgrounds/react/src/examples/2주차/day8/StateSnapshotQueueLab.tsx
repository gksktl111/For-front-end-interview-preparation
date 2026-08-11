import { useRef, useState } from "react";

type LogItem = {
  id: number;
  message: string;
};

export default function StateSnapshotQueueLab() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: 1,
      message: "버튼을 눌러 현재 렌더링의 Snapshot과 다음 렌더링 결과를 비교하세요.",
    },
  ]);
  const nextLogId = useRef(2);

  const pushLog = (message: string) => {
    setLogs((previousLogs) => [
      { id: nextLogId.current++, message },
      ...previousLogs.slice(0, 6),
    ]);
  };

  const handleSnapshotClick = () => {
    setCount(count + 1);
    pushLog(`Snapshot 버튼: 핸들러 안의 count는 ${count}입니다.`);
  };

  const handleValueUpdate = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    pushLog(
      `값 기반 업데이트 3회: 모두 count ${count}를 기준으로 ${count + 1}을 등록합니다.`,
    );
  };

  const handleFunctionalUpdate = () => {
    setCount((previousCount) => previousCount + 1);
    setCount((previousCount) => previousCount + 1);
    setCount((previousCount) => previousCount + 1);
    pushLog("함수형 업데이트 3회: Queue에서 이전 결과를 이어받아 +3 됩니다.");
  };

  const reset = () => {
    setCount(0);
    setLogs([
      {
        id: nextLogId.current++,
        message: "count와 로그를 초기화했습니다.",
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-indigo-700">
          Snapshot / Queue
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              State Snapshot과 업데이트 Queue
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              화면의 count와 이벤트 핸들러가 읽은 count를 비교합니다.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-4 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-700">
              count
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-indigo-950">
              {count}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={handleSnapshotClick}
          >
            setCount + log
          </button>
          <button
            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            type="button"
            onClick={handleValueUpdate}
          >
            값 기반 3회
          </button>
          <button
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            type="button"
            onClick={handleFunctionalUpdate}
          >
            함수형 3회
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={reset}
          >
            초기화
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {logs.map((log) => (
            <p
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600"
              key={log.id}
            >
              {log.message}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
        <h2 className="text-base font-semibold text-indigo-950">정리</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>`setState`는 현재 렌더링의 변수를 직접 바꾸지 않습니다.</li>
          <li>값 기반 업데이트는 현재 렌더링의 Snapshot 값을 참조합니다.</li>
          <li>함수형 업데이트는 Queue에서 이전 업데이트 결과를 이어받습니다.</li>
          <li>Batching은 여러 업데이트를 언제 렌더링으로 반영하는지에 관한 개념입니다.</li>
        </ul>
      </section>
    </div>
  );
}
