import { useMemo, useState } from "react";
import type { Tone } from "./shared";
import { Metric, PanelHeading, PracticeSummary, StatePill } from "./shared";

type UserPreview = {
  name: string;
  role: string;
};

const usersById: Record<string, UserPreview> = {
  minji: {
    name: "민지",
    role: "Frontend Developer",
  },
};

function useUserPreview(userId?: string) {
  const user = useMemo(() => {
    if (!userId) {
      return null;
    }

    return usersById[userId] ?? null;
  }, [userId]);

  return {
    data: user,
    enabled: Boolean(userId),
  };
}

export default function HookCallOrderLab() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const userQuery = useUserPreview(userId);
  const hasUserId = Boolean(userId);

  const unsafeSteps = hasUserId
    ? [
        "1. useState(isEditing)",
        "2. useUser(userId)",
        "3. useState(activeTab)",
      ]
    : [
        "1. useState(isEditing)",
        "return null",
        "useUser와 activeTab Hook은 호출되지 않음",
      ];

  const safeSteps = [
    "1. useState(isEditing)",
    "2. useUser(userId)",
    "3. useState(activeTab)",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Hook Rules"
          title="userId가 바뀌어도 Hook 위치는 바뀌면 안 된다"
          description="userId를 켜고 끄며 조건부 Hook 호출과 조건부 동작의 렌더별 호출 순서를 비교합니다."
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className={
              hasUserId
                ? "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                : "rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
            }
            type="button"
            onClick={() => setUserId("minji")}
          >
            userId 제공
          </button>
          <button
            className={
              !hasUserId
                ? "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                : "rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
            }
            type="button"
            onClick={() => setUserId(undefined)}
          >
            userId 없음
          </button>
          <StatePill tone={hasUserId ? "emerald" : "sky"}>
            현재 userId: {userId ?? "없음"}
          </StatePill>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <HookSequence
            description="실제 invalid Hook 코드는 React 오류로 앱을 멈추므로, 여기서는 호출 수가 달라지는 모습을 시뮬레이션합니다."
            steps={unsafeSteps}
            title="위험: Hook을 조건부로 호출"
            tone="rose"
          />
          <HookSequence
            description="useUser는 항상 같은 두 번째 위치에서 호출되고, enabled만 userId에 따라 바뀝니다."
            steps={safeSteps}
            title="권장: Hook은 항상 호출"
            tone="emerald"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric
            label="safe useUser 위치"
            tone="emerald"
            value="항상 2번째"
          />
          <Metric
            label="query enabled"
            tone={userQuery.enabled ? "emerald" : "sky"}
            value={String(userQuery.enabled)}
          />
          <Metric
            label="화면에 표시할 user"
            tone={userQuery.data ? "emerald" : "default"}
            value={userQuery.data?.name ?? "없음"}
          />
        </div>

        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
          <p className="font-semibold">조건부 동작의 실제 결과</p>
          <p className="mt-1">
            useUserPreview는 userId가 없어도 호출됩니다. 다만 enabled가 false라서
            사용자 조회 동작을 시작하지 않고, userId가 생기면 같은 Hook 위치에서
            데이터만 활성화됩니다.
          </p>
        </div>
      </section>

      <PracticeSummary
        points={[
          "React는 렌더마다 Hook 호출 순서를 기준으로 State와 Effect를 연결하므로 조건·반복·중첩 함수 안에서 Hook을 호출하면 안 됩니다.",
          "조건부 데이터 요청은 Hook 호출을 건너뛰는 대신 enabled나 Effect 내부 조건으로 요청 동작만 제어합니다.",
          "리스트 항목별 Hook이 필요하면 map 안에서 Hook을 호출하지 말고, 각 항목을 별도 컴포넌트로 만들어 고정된 Hook 순서를 갖게 합니다.",
        ]}
      />
    </div>
  );
}

function HookSequence({
  description,
  steps,
  title,
  tone,
}: {
  description: string;
  steps: string[];
  title: string;
  tone: Tone;
}) {
  const classNameByTone: Record<Tone, string> = {
    default: "border-slate-200 bg-slate-50",
    rose: "border-rose-200 bg-rose-50",
    emerald: "border-emerald-200 bg-emerald-50",
    sky: "border-sky-200 bg-sky-50",
    indigo: "border-indigo-200 bg-indigo-50",
  };

  const textClassNameByTone: Record<Tone, string> = {
    default: "text-slate-950",
    rose: "text-rose-950",
    emerald: "text-emerald-950",
    sky: "text-sky-950",
    indigo: "text-indigo-950",
  };

  return (
    <article className={"rounded-2xl border p-4 " + classNameByTone[tone]}>
      <p className={"text-sm font-semibold " + textClassNameByTone[tone]}>
        {title}
      </p>
      <p className="mt-1 min-h-12 text-sm leading-6 text-slate-700">
        {description}
      </p>

      <ol className="mt-4 space-y-2">
        {steps.map((step) => (
          <li
            className="rounded-xl border border-white bg-white/80 px-3 py-2 text-sm font-medium text-slate-700"
            key={step}
          >
            {step}
          </li>
        ))}
      </ol>
    </article>
  );
}
