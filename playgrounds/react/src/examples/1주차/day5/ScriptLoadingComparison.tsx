import { useMemo, useState } from "react";

type LoadingMode = "script" | "defer" | "async";

type TimelineStep = {
  id: string;
  time: number;
  label: string;
  detail: string;
  tone: "default" | "block" | "run" | "done";
};

const STEPS: Record<LoadingMode, TimelineStep[]> = {
  script: [
    {
      id: "parse-start",
      time: 0,
      label: "HTML 파싱 시작",
      detail: "브라우저가 head부터 문서를 읽습니다.",
      tone: "default",
    },
    {
      id: "script-found",
      time: 25,
      label: "일반 script 발견",
      detail: "HTML 파서는 스크립트 다운로드와 실행을 기다립니다.",
      tone: "block",
    },
    {
      id: "script-run",
      time: 55,
      label: "스크립트 실행",
      detail: "실행이 끝날 때까지 DOM 파싱이 멈춰 있습니다.",
      tone: "run",
    },
    {
      id: "parse-resume",
      time: 75,
      label: "HTML 파싱 재개",
      detail: "스크립트 실행 후 남은 HTML을 계속 읽습니다.",
      tone: "default",
    },
    {
      id: "dom-ready",
      time: 100,
      label: "DOM 파싱 완료",
      detail: "문서 구조가 끝까지 만들어졌습니다.",
      tone: "done",
    },
  ],
  defer: [
    {
      id: "parse-start",
      time: 0,
      label: "HTML 파싱 시작",
      detail: "브라우저가 문서를 읽으며 스크립트도 병렬 다운로드합니다.",
      tone: "default",
    },
    {
      id: "defer-download",
      time: 25,
      label: "defer 다운로드",
      detail: "다운로드 중에도 HTML 파싱은 계속됩니다.",
      tone: "default",
    },
    {
      id: "dom-ready",
      time: 70,
      label: "DOM 파싱 완료",
      detail: "DOM이 준비된 뒤 실행을 기다립니다.",
      tone: "done",
    },
    {
      id: "defer-run",
      time: 86,
      label: "defer 실행",
      detail: "선언된 순서대로 DOMContentLoaded 전에 실행됩니다.",
      tone: "run",
    },
    {
      id: "complete",
      time: 100,
      label: "DOMContentLoaded",
      detail: "defer 스크립트 실행 후 이벤트가 발생합니다.",
      tone: "done",
    },
  ],
  async: [
    {
      id: "parse-start",
      time: 0,
      label: "HTML 파싱 시작",
      detail: "브라우저가 문서를 읽으며 스크립트도 병렬 다운로드합니다.",
      tone: "default",
    },
    {
      id: "async-download",
      time: 18,
      label: "async 다운로드",
      detail: "다운로드 중에는 HTML 파싱이 계속됩니다.",
      tone: "default",
    },
    {
      id: "async-run",
      time: 45,
      label: "다운로드 완료 즉시 실행",
      detail: "실행되는 동안 HTML 파싱이 잠시 멈출 수 있습니다.",
      tone: "run",
    },
    {
      id: "parse-resume",
      time: 60,
      label: "HTML 파싱 계속",
      detail: "async 스크립트 실행 순서는 다운로드 완료 순서에 좌우됩니다.",
      tone: "block",
    },
    {
      id: "dom-ready",
      time: 100,
      label: "DOM 파싱 완료",
      detail: "실행 순서가 중요한 앱 코드에는 적합하지 않을 수 있습니다.",
      tone: "done",
    },
  ],
};

export default function ScriptLoadingComparison() {
  const [mode, setMode] = useState<LoadingMode>("script");
  const steps = STEPS[mode];

  const source = useMemo(() => {
    if (mode === "script") {
      return '<script src="/main.js"></script>';
    }

    if (mode === "defer") {
      return '<script defer src="/main.js"></script>';
    }

    return '<script async src="/main.js"></script>';
  }, [mode]);

  const summary = {
    script: {
      title: "HTML 파싱을 막음",
      description:
        "일반 script는 발견 즉시 다운로드와 실행을 기다리므로 초기 DOM 생성이 늦어질 수 있습니다.",
    },
    defer: {
      title: "DOM 파싱 후 순서대로 실행",
      description:
        "앱 초기화 코드처럼 DOM에 의존하고 실행 순서가 중요한 스크립트에 적합합니다.",
    },
    async: {
      title: "다운로드 완료 즉시 실행",
      description:
        "분석 코드처럼 독립적이고 실행 순서가 중요하지 않은 스크립트에 적합합니다.",
    },
  } satisfies Record<LoadingMode, { title: string; description: string }>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">
              parser timeline
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              스크립트 로딩 방식 비교
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              버튼을 바꾸면 HTML 파서가 멈추는 지점과 실행 시점이 달라집니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["script", "defer", "async"] as const).map((option) => (
              <button
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  mode === option
                    ? "border-indigo-300 bg-indigo-100 text-indigo-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                key={option}
                type="button"
                onClick={() => setMode(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
          <code>{source}</code>
        </pre>

        <div className="mt-6">
          <div className="relative h-3 rounded-full bg-slate-100">
            {steps.map((step) => (
              <span
                className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 bg-white ${
                  step.tone === "block"
                    ? "border-rose-400"
                    : step.tone === "run"
                      ? "border-amber-400"
                      : step.tone === "done"
                        ? "border-emerald-400"
                        : "border-slate-300"
                }`}
                key={step.id}
                style={{ left: `${step.time}%` }}
                title={step.label}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-5">
            {steps.map((step) => (
              <article
                className={`rounded-2xl border p-4 ${
                  step.tone === "block"
                    ? "border-rose-200 bg-rose-50"
                    : step.tone === "run"
                      ? "border-amber-200 bg-amber-50"
                      : step.tone === "done"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                }`}
                key={step.id}
              >
                <p className="text-xs font-semibold tabular-nums text-slate-500">
                  {step.time}%
                </p>
                <h3 className="mt-2 text-sm font-semibold text-slate-950">
                  {step.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <h2 className="text-base font-semibold text-indigo-950">
            {summary[mode].title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {summary[mode].description}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">비교 기준</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2">방식</th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    파싱 차단
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    실행 시점
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    순서 보장
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="border-b border-slate-100 px-3 py-2">script</td>
                  <td className="border-b border-slate-100 px-3 py-2">예</td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    다운로드 직후
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">예</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-3 py-2">defer</td>
                  <td className="border-b border-slate-100 px-3 py-2">아니오</td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    DOM 파싱 완료 후
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">예</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">async</td>
                  <td className="px-3 py-2">다운로드 중에는 아니오</td>
                  <td className="px-3 py-2">다운로드 완료 즉시</td>
                  <td className="px-3 py-2">아니오</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
