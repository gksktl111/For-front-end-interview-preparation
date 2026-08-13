import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import { LogList, PanelHeading, PracticeSummary } from "./shared";
import type { LogItem } from "./shared";

function createInitialEventLogs(): LogItem[] {
  return [
    {
      id: 1,
      message: "자식 버튼이나 링크를 눌러 이벤트 흐름을 확인하세요.",
      tone: "default",
    },
  ];
}

function describeElement(element: EventTarget | null) {
  if (!(element instanceof HTMLElement)) {
    return "unknown";
  }

  const label = element.dataset.label ? `[${element.dataset.label}]` : "";

  return `${element.tagName.toLowerCase()}${label}`;
}

export default function EventPropagationDefaultLab() {
  const [useStopPropagation, setUseStopPropagation] = useState(false);
  const [usePreventDefault, setUsePreventDefault] = useState(true);
  const [logs, setLogs] = useState<LogItem[]>(createInitialEventLogs);
  const nextLogId = useRef(2);

  const pushLog = (message: string, tone: LogItem["tone"] = "default") => {
    setLogs((previousLogs) => [
      ...previousLogs.slice(-5),
      {
        id: nextLogId.current,
        message,
        tone,
      },
    ]);
    nextLogId.current += 1;
  };

  const resetLogs = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLogs(createInitialEventLogs());
    nextLogId.current = 2;
  };

  const handleParentClick = (event: MouseEvent<HTMLDivElement>) => {
    pushLog(
      `parent handler: target=${describeElement(event.target)}, currentTarget=${describeElement(event.currentTarget)}`,
      "sky",
    );
  };

  const handleChildClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (useStopPropagation) {
      event.stopPropagation();
    }

    pushLog(
      `child handler: target=${describeElement(event.target)}, currentTarget=${describeElement(event.currentTarget)}${useStopPropagation ? ", stopPropagation 적용" : ""}`,
      useStopPropagation ? "emerald" : "rose",
    );
  };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (usePreventDefault) {
      event.preventDefault();
    }

    pushLog(
      `link click: ${usePreventDefault ? "preventDefault로 hash 이동 차단" : "브라우저 기본 동작으로 hash 이동 허용"}`,
      usePreventDefault ? "emerald" : "rose",
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Event"
          title="이벤트 전파와 기본 동작"
          description="중첩 클릭에서 child와 parent 핸들러가 실행되는 순서, target/currentTarget 차이, preventDefault의 역할을 확인합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div
            className="rounded-2xl border border-sky-200 bg-sky-50 p-5"
            data-label="parent"
            onClick={handleParentClick}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-sky-950">Parent area</p>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-sky-900">
                <input
                  className="size-4"
                  type="checkbox"
                  checked={useStopPropagation}
                  onChange={(event) =>
                    setUseStopPropagation(event.target.checked)
                  }
                />
                stopPropagation
              </label>
            </div>

            <button
              className="mt-4 w-full rounded-xl border border-sky-300 bg-white px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
              data-label="child-button"
              type="button"
              onClick={handleChildClick}
            >
              <span data-label="button-text">Child button</span>
            </button>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  className="size-4"
                  type="checkbox"
                  checked={usePreventDefault}
                  onChange={(event) =>
                    setUsePreventDefault(event.target.checked)
                  }
                />
                preventDefault
              </label>
              <a
                className="mt-3 block rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                data-label="hash-link"
                href="#day9-default-action"
                onClick={handleLinkClick}
              >
                hash 링크 클릭
              </a>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                preventDefault를 끄면 주소의 hash가 바뀝니다.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-950">
                로그 내역 확인
              </h3>
              <button
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={resetLogs}
              >
                로그 초기화
              </button>
            </div>
            <LogList
              className="mt-3 h-[350px] overflow-y-auto pr-1"
              logs={logs}
            />
          </div>
        </div>
      </section>

      <PracticeSummary
        points={[
          "자식 Element에서 발생한 클릭은 부모 방향으로 전파될 수 있습니다.",
          "`target`은 실제 이벤트 발생 Element이고, `currentTarget`은 현재 핸들러가 등록된 Element입니다.",
          "`stopPropagation`은 전파를 막고, `preventDefault`는 브라우저 기본 동작을 막습니다.",
        ]}
      />
    </div>
  );
}
