import type { ReactNode } from "react";
import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary, StatePill } from "./shared";

type Clip = {
  id: string;
  title: string;
};

type ResultScenario = "pending" | "error" | "empty" | "list" | "delete";

const clips: Clip[] = [
  {
    id: "component",
    title: "Component Responsibility",
  },
  {
    id: "hook",
    title: "Custom Hook Contract",
  },
  {
    id: "composition",
    title: "Composition Slot",
  },
];

const resultScenarios: {
  id: ResultScenario;
  label: string;
}[] = [
  {
    id: "pending",
    label: "Loading",
  },
  {
    id: "error",
    label: "Error",
  },
  {
    id: "empty",
    label: "Empty",
  },
  {
    id: "list",
    label: "ClipList",
  },
  {
    id: "delete",
    label: "DeleteClipList",
  },
];

export default function ConditionalResultsLab() {
  const [scenario, setScenario] = useState<ResultScenario>("list");
  const [isAdmin, setIsAdmin] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const [hasSelection, setHasSelection] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPending = scenario === "pending";
  const error =
    scenario === "error" ? new Error("클립 목록을 불러오지 못했습니다.") : null;
  const visibleClips = scenario === "empty" ? [] : clips;
  const isDeleteMode = scenario === "delete";
  const canDelete =
    isAdmin && hasActiveSubscription && hasSelection && !isDeleting;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Conditional Rendering"
          title="결과 상태와 권한 조건을 읽을 수 있게 만들기"
          description="결과 화면의 우선순위와 canDelete를 이루는 이름 있는 조건을 버튼으로 바꿔 관찰합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky-950">
                  ClipResults
                </p>
                <p className="mt-1 text-sm leading-6 text-sky-800">
                  분기 순서는 loading → error → empty → delete mode → list입니다.
                </p>
              </div>
              <StatePill tone="sky">현재: {scenario}</StatePill>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {resultScenarios.map((candidate) => {
                const isSelected = candidate.id === scenario;

                return (
                  <button
                    className={
                      isSelected
                        ? "rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"
                        : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    }
                    key={candidate.id}
                    type="button"
                    onClick={() => setScenario(candidate.id)}
                  >
                    {candidate.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <ClipResults
                clips={visibleClips}
                error={error}
                isDeleteMode={isDeleteMode}
                isPending={isPending}
              />
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              이름 있는 권한 조건
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              긴 boolean 식을 is, has, can 이름으로 나누면 false 원인을 찾기 쉽습니다.
            </p>

            <div className="mt-4 grid gap-2">
              <ConditionToggle
                active={isAdmin}
                label="isAdmin"
                onClick={() => setIsAdmin((previous) => !previous)}
              />
              <ConditionToggle
                active={hasActiveSubscription}
                label="hasActiveSubscription"
                onClick={() =>
                  setHasActiveSubscription((previous) => !previous)
                }
              />
              <ConditionToggle
                active={hasSelection}
                label="hasSelection"
                onClick={() => setHasSelection((previous) => !previous)}
              />
              <ConditionToggle
                active={isDeleting}
                label="isDeleting"
                onClick={() => setIsDeleting((previous) => !previous)}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric
                label="canDelete"
                tone={canDelete ? "emerald" : "rose"}
                value={String(canDelete)}
              />
              <Metric
                label="삭제 버튼"
                tone={canDelete ? "emerald" : "default"}
                value={canDelete ? "활성" : "비활성"}
              />
            </div>

            <button
              className="mt-4 w-full rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canDelete}
              type="button"
            >
              선택한 클립 삭제
            </button>
          </article>
        </div>
      </section>

      <PracticeSummary
        points={[
          "loading, error, empty, content처럼 서로 다른 결과 화면이 커지면 ClipResults 같은 컴포넌트가 분기 순서를 책임지게 할 수 있습니다.",
          "상위 페이지는 query, toolbar, callback을 조합하고 결과 컴포넌트는 화면 상태 정책에 집중합니다.",
          "isAdmin, hasSelection, canDelete처럼 이름을 붙이면 긴 조건식이 표현하는 도메인 규칙과 false 원인을 읽기 쉬워집니다.",
        ]}
      />
    </div>
  );
}

function ClipResults({
  clips,
  error,
  isDeleteMode,
  isPending,
}: {
  clips: Clip[];
  error: Error | null;
  isDeleteMode: boolean;
  isPending: boolean;
}) {
  if (isPending) {
    return <ResultCard message="Loading: 클립 목록을 불러오는 중입니다." tone="sky" />;
  }

  if (error) {
    return <ResultCard message={"Error: " + error.message} tone="rose" />;
  }

  if (clips.length === 0) {
    return <ResultCard message="Empty: 아직 저장된 클립이 없습니다." tone="indigo" />;
  }

  if (isDeleteMode) {
    return (
      <ResultCard
        message="DeleteClipList: 삭제할 클립을 선택하세요."
        tone="rose"
      >
        <ClipList clips={clips} selectable />
      </ResultCard>
    );
  }

  return (
    <ResultCard message="ClipList: 조회한 클립을 표시합니다." tone="emerald">
      <ClipList clips={clips} />
    </ResultCard>
  );
}

function ResultCard({
  children,
  message,
  tone,
}: {
  children?: ReactNode;
  message: string;
  tone: "rose" | "emerald" | "sky" | "indigo";
}) {
  const classNameByTone = {
    rose: "border-rose-200 bg-rose-50 text-rose-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
    sky: "border-sky-200 bg-sky-50 text-sky-950",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
  };

  return (
    <div className={"rounded-xl border p-4 " + classNameByTone[tone]}>
      <p className="text-sm font-semibold">{message}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function ClipList({
  clips,
  selectable = false,
}: {
  clips: Clip[];
  selectable?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {clips.map((clip) => (
        <li
          className="flex items-center justify-between rounded-lg border border-white bg-white/80 px-3 py-2 text-sm text-slate-700"
          key={clip.id}
        >
          {clip.title}
          {selectable && <StatePill tone="rose">선택</StatePill>}
        </li>
      ))}
    </ul>
  );
}

function ConditionToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={
        active
          ? "flex items-center justify-between rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-left text-sm font-semibold text-emerald-700"
          : "flex items-center justify-between rounded-xl border border-rose-300 bg-white px-3 py-2.5 text-left text-sm font-semibold text-rose-700"
      }
      type="button"
      onClick={onClick}
    >
      {label}
      <StatePill tone={active ? "emerald" : "rose"}>
        {String(active)}
      </StatePill>
    </button>
  );
}
