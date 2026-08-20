import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary, StatePill } from "./shared";

const changeScenarios = [
  {
    id: "form",
    label: "폼 검증 규칙 변경",
    description: "닉네임 길이와 저장 버튼의 disabled 규칙을 바꿉니다.",
    target: "UserForm",
  },
  {
    id: "dialog",
    label: "삭제 확인 UX 변경",
    description: "삭제 확인 문구와 취소 흐름을 바꿉니다.",
    target: "DeleteUserDialog",
  },
  {
    id: "results",
    label: "조회 결과 상태 변경",
    description: "loading, error, empty 화면의 우선순위를 바꿉니다.",
    target: "UserPageContent",
  },
  {
    id: "permission",
    label: "권한 정책 변경",
    description: "수정·삭제 가능 조건을 새 정책에 맞게 바꿉니다.",
    target: "canManageUser",
  },
] as const;

type ChangeId = (typeof changeScenarios)[number]["id"];

const separatedResponsibilities = [
  {
    id: "page",
    name: "UserPage",
    note: "라우트와 데이터 경계 조합",
  },
  {
    id: "results",
    name: "UserPageContent",
    note: "loading / error / empty 결과",
  },
  {
    id: "form",
    name: "UserForm",
    note: "draft, 검증, 제출 UI",
  },
  {
    id: "dialog",
    name: "DeleteUserDialog",
    note: "삭제 확인과 취소 UI",
  },
  {
    id: "permission",
    name: "canManageUser",
    note: "권한 규칙을 계산하는 순수 함수",
  },
] as const;

export default function ComponentBoundaryLab() {
  const [selectedChangeId, setSelectedChangeId] = useState<ChangeId>("form");
  const selectedChange =
    changeScenarios.find((scenario) => scenario.id === selectedChangeId) ??
    changeScenarios[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Component Boundary"
          title="요구사항이 바뀌면 어느 책임을 읽어야 할까?"
          description="변경 요청을 선택해 하나의 큰 UserPage와 역할을 나눈 구조의 직접 변경 지점을 비교합니다."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          {changeScenarios.map((scenario) => {
            const isSelected = scenario.id === selectedChangeId;

            return (
              <button
                className={
                  isSelected
                    ? "rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                    : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                }
                key={scenario.id}
                type="button"
                onClick={() => setSelectedChangeId(scenario.id)}
              >
                {scenario.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
          <StatePill tone="indigo">선택한 변경</StatePill>
          <p className="mt-2 text-sm font-semibold text-indigo-950">
            {selectedChange.label}
          </p>
          <p className="mt-1 text-sm leading-6 text-indigo-800">
            {selectedChange.description}
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <MonolithicUserPage changeLabel={selectedChange.label} />
          <SeparatedUserPage target={selectedChange.target} />
        </div>
      </section>

      <PracticeSummary
        points={[
          "한 파일에 코드가 있다고 항상 나쁜 것은 아니지만, 서로 다른 요구사항이 같은 UserPage를 계속 수정하게 만들면 변경 이유가 섞입니다.",
          "역할별 경계에서는 UserForm, DeleteUserDialog, 결과 상태, 권한 규칙이 각자의 변경 지점을 가집니다.",
          "분리의 목적은 파일 수를 늘리는 것이 아니라, 변경할 책임을 빠르게 찾고 다른 책임에 미치는 영향을 줄이는 것입니다.",
        ]}
      />
    </div>
  );
}

function MonolithicUserPage({ changeLabel }: { changeLabel: string }) {
  return (
    <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-rose-950">
            모든 책임이 UserPage에 있음
          </p>
          <p className="mt-1 text-sm leading-6 text-rose-800">
            어떤 요구사항이 바뀌어도 같은 컴포넌트의 여러 문맥을 함께 읽어야 합니다.
          </p>
        </div>
        <StatePill tone="rose">직접 변경 후보: UserPage</StatePill>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-rose-300 bg-white p-4">
        <p className="text-base font-semibold text-rose-950">UserPage</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          <li>• 사용자 조회와 loading, error, empty 분기</li>
          <li>• 편집 form draft, 검증, update 요청</li>
          <li>• 삭제 dialog 열림 상태와 delete 요청</li>
          <li>• 수정·삭제 권한 판단</li>
        </ul>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="선택한 변경" tone="rose" value={changeLabel} />
        <Metric
          label="읽어야 할 책임"
          tone="rose"
          value="UserPage 전체"
        />
      </div>
    </article>
  );
}

function SeparatedUserPage({ target }: { target: string }) {
  return (
    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            역할별로 책임을 나눔
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            페이지는 조합에 집중하고, 선택한 요구사항의 직접 책임이 강조됩니다.
          </p>
        </div>
        <StatePill tone="emerald">직접 변경 후보: {target}</StatePill>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-white p-4">
        <p className="text-base font-semibold text-emerald-950">UserPage</p>
        <p className="mt-1 text-sm text-slate-600">
          라우트와 데이터 경계를 연결한 뒤 역할별 UI를 조합합니다.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {separatedResponsibilities
            .filter((responsibility) => responsibility.id !== "page")
            .map((responsibility) => {
              const isTarget =
                responsibility.name === target ||
                (target === "canManageUser" &&
                  responsibility.id === "permission");

              return (
                <div
                  className={
                    isTarget
                      ? "rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3"
                      : "rounded-xl border border-slate-200 bg-slate-50 p-3"
                  }
                  key={responsibility.id}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {responsibility.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {responsibility.note}
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="선택한 변경" tone="emerald" value={target} />
        <Metric
          label="주로 읽을 책임"
          tone="emerald"
          value={target}
        />
      </div>
    </article>
  );
}
