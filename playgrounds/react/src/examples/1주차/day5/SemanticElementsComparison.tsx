import { useState } from "react";

type ActivationLog = {
  id: number;
  message: string;
};

export default function SemanticElementsComparison() {
  const [logs, setLogs] = useState<ActivationLog[]>([
    {
      id: 1,
      message: "Tab으로 각 요소에 포커스한 뒤 Enter와 Space를 눌러 비교하세요.",
    },
  ]);
  const [copyCount, setCopyCount] = useState(0);

  const pushLog = (message: string) => {
    setLogs((previousLogs) => [
      { id: Date.now() + Math.random(), message },
      ...previousLogs.slice(0, 4),
    ]);
  };

  const handleCopy = (source: string) => {
    setCopyCount((count) => count + 1);
    pushLog(`${source}: 복사 액션 실행`);
  };

  const handleDivKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleCopy("div role=button Enter");
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      handleCopy("div role=button Space");
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
          <p className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-rose-700">
            비교 대상
          </p>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
            `div role="button"`
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            포커스와 키보드 실행을 직접 맞춰야 합니다. 아래 예제는 일부러
            Enter와 Space 핸들러를 추가해 실제 버튼과 비슷하게 만든 상태입니다.
          </p>

          <div
            className="mt-5 inline-flex cursor-pointer select-none items-center justify-center rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 outline-none transition hover:bg-rose-100 focus-visible:ring-4 focus-visible:ring-rose-200"
            role="button"
            tabIndex={0}
            onClick={() => handleCopy("div role=button click")}
            onKeyDown={handleDivKeyDown}
          >
            클립 복사
          </div>

          <div className="mt-5 rounded-xl border border-rose-200 bg-white/80 p-4">
            <h3 className="text-sm font-semibold text-rose-900">직접 챙길 것</h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
              <li>Tab 포커스를 위해 `tabIndex` 필요</li>
              <li>Enter, Space 실행을 직접 구현</li>
              <li>`disabled` 같은 기본 상태를 직접 표현</li>
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
          <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
            권장 방식
          </p>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
            실제 `button`
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            브라우저가 버튼 역할, 포커스, 키보드 실행, 비활성화 상태를 기본으로
            제공합니다.
          </p>

          <button
            className="mt-5 inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            type="button"
            onClick={() => handleCopy("button")}
          >
            클립 복사
          </button>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-white/80 p-4">
            <h3 className="text-sm font-semibold text-emerald-900">기본 제공</h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
              <li>Tab 포커스 가능</li>
              <li>Enter와 Space로 실행</li>
              <li>`type`, `disabled` 속성 사용 가능</li>
            </ul>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">실행 결과</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            실행 횟수:{" "}
            <span className="font-semibold tabular-nums text-indigo-700">
              {copyCount}
            </span>
          </p>
          <div className="mt-4 space-y-2">
            {logs.map((log) => (
              <p
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
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
            <li>의미가 버튼이면 실제 `button`을 먼저 선택합니다.</li>
            <li>`role`은 의미를 보완하지만 기본 동작을 자동 구현하지 않습니다.</li>
            <li>
              ARIA를 쓰기 전에 기본 HTML 요소로 해결할 수 있는지 확인합니다.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
