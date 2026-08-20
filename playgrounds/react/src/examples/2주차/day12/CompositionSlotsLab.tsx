import type { ReactNode } from "react";
import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary, StatePill } from "./shared";

type User = {
  id: string;
  name: string;
  role: string;
};

const users: User[] = [
  {
    id: "minji",
    name: "민지",
    role: "Frontend Developer",
  },
  {
    id: "jun",
    name: "준",
    role: "Product Designer",
  },
];

export default function CompositionSlotsLab() {
  const [selectedUserId, setSelectedUserId] = useState(users[0].id);
  const user = users.find((candidate) => candidate.id === selectedUserId) ?? users[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Composition"
          title="Layout은 user를 알아야 할까?"
          description="같은 Profile UI를 user Props 전달 체인과 sidebar slot 주입으로 각각 배치합니다."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          {users.map((candidate) => (
            <button
              className={
                selectedUserId === candidate.id
                  ? "rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                  : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              }
              key={candidate.id}
              type="button"
              onClick={() => setSelectedUserId(candidate.id)}
            >
              {candidate.name} 선택
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PropsDrillingTree user={user} />
          <CompositionTree user={user} />
        </div>
      </section>

      <PracticeSummary
        points={[
          "Props가 두세 단계를 지나간다는 이유만으로 Context가 필요한 것은 아닙니다.",
          "Layout과 Sidebar가 user를 사용하지 않으면 Profile UI를 slot으로 전달해 중간 계층의 도메인 의존성을 없앨 수 있습니다.",
          "여러 깊은 소비자가 독립적으로 같은 값을 읽고 부모가 모든 UI를 조합하기 부자연스러울 때 Context를 검토합니다.",
        ]}
      />
    </div>
  );
}

function PropsDrillingTree({ user }: { user: User }) {
  return (
    <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-rose-950">
            Props 전달 체인
          </p>
          <p className="mt-1 text-sm leading-6 text-rose-800">
            Layout과 Sidebar는 user를 표시하지 않지만 다음 컴포넌트로 전달합니다.
          </p>
        </div>
        <StatePill tone="rose">중간 user Props: 2개</StatePill>
      </div>

      <div className="mt-4">
        <DrillingLayout user={user} />
      </div>

      <div className="mt-4">
        <Metric label="Layout의 user 의존성" tone="rose" value="있음" />
      </div>
    </article>
  );
}

function DrillingLayout({ user }: { user: User }) {
  return (
    <TreeNode name="Layout" note="user Props를 받아 Sidebar로 전달">
      <DrillingSidebar user={user} />
    </TreeNode>
  );
}

function DrillingSidebar({ user }: { user: User }) {
  return (
    <TreeNode name="Sidebar" note="user Props를 받아 Profile로 전달">
      <UserProfile user={user} />
    </TreeNode>
  );
}

function CompositionTree({ user }: { user: User }) {
  return (
    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            sidebar Composition slot
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            Layout은 sidebar UI만 배치하고 user의 필드를 알지 못합니다.
          </p>
        </div>
        <StatePill tone="emerald">중간 user Props: 0개</StatePill>
      </div>

      <div className="mt-4">
        <CompositionLayout sidebar={<UserProfile user={user} />} />
      </div>

      <div className="mt-4">
        <Metric label="Layout의 user 의존성" tone="emerald" value="없음" />
      </div>
    </article>
  );
}

function CompositionLayout({ sidebar }: { sidebar: ReactNode }) {
  return (
    <TreeNode name="Layout" note="sidebar ReactNode만 받아 배치">
      <div className="rounded-xl border border-emerald-200 bg-white p-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
          sidebar slot
        </p>
        <div className="mt-2">{sidebar}</div>
      </div>
    </TreeNode>
  );
}

function TreeNode({
  children,
  name,
  note,
}: {
  children: ReactNode;
  name: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
      <div className="mt-3 border-l-2 border-slate-200 pl-3">{children}</div>
    </div>
  );
}

function UserProfile({ user }: { user: User }) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-700">
        Profile uses user
      </p>
      <p className="mt-2 text-base font-semibold text-indigo-950">{user.name}</p>
      <p className="mt-1 text-sm text-indigo-800">{user.role}</p>
    </div>
  );
}
