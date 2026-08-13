import { useRef, useState } from "react";
import { LogList, PanelHeading, PracticeSummary } from "./shared";
import type { LogItem } from "./shared";

export default function EventStateSnapshotLab() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: 1,
      message: "버튼을 누르면 setCount 전후 로그가 같은 Snapshot을 읽습니다.",
      tone: "default",
    },
  ]);
  const nextLogId = useRef(2);

  const pushLog = (message: string, tone: LogItem["tone"] = "default") => {
    setLogs((previousLogs) => [
      {
        id: nextLogId.current,
        message,
        tone,
      },
      ...previousLogs.slice(0, 5),
    ]);
    nextLogId.current += 1;
  };

  const handleClick = () => {
    const before = count;
    setCount((previousCount) => previousCount + 1);
    const after = count;

    pushLog(
      `before=${before}, setCount 호출 후 같은 핸들러의 after=${after}`,
      "sky",
    );
  };

  const reset = () => {
    setCount(0);
    setLogs([
      {
        id: nextLogId.current,
        message: "count와 로그를 초기화했습니다.",
        tone: "default",
      },
    ]);
    nextLogId.current += 1;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Snapshot"
          title="이벤트 핸들러의 State Snapshot"
          description="함수형 업데이트를 사용해도 현재 핸들러 안의 count 변수는 다음 렌더링 전까지 바뀌지 않습니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-700">
              count
            </p>
            <p className="mt-2 text-5xl font-semibold tabular-nums text-indigo-950">
              {count}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                className="rounded-xl border border-indigo-300 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                type="button"
                onClick={handleClick}
              >
                +1
              </button>
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={reset}
              >
                초기화
              </button>
            </div>
          </div>

          <LogList logs={logs} />
        </div>
      </section>

      <PracticeSummary
        points={[
          "이벤트 핸들러는 자신이 만들어진 렌더링의 State Snapshot을 읽습니다.",
          "`setState`는 현재 함수 스코프의 변수를 직접 바꾸지 않고 다음 렌더링을 요청합니다.",
          "함수형 업데이트를 사용해도 같은 핸들러 안의 State 변수는 다음 렌더링 전까지 그대로입니다.",
        ]}
      />
    </div>
  );
}
