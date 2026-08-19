import type { ReactNode } from "react";
import { useState } from "react";
import { PanelHeading, PracticeSummary } from "./shared";

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

export default function PropsCompositionLab() {
  const [selectedUserId, setSelectedUserId] = useState(users[0].id);
  const user = users.find((candidate) => candidate.id === selectedUserId) ?? users[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Props / Composition"
          title="중간 컴포넌트는 user를 정말 알아야 할까?"
          description="동일한 UserProfile을 Props 전달 체인과 Composition slot으로 각각 배치해 의존성 차이를 확인합니다."
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
          "몇 단계의 Props 전달은 데이터 흐름이 명시적이므로 항상 나쁜 구조가 아닙니다.",
          "Layout과 Sidebar가 user를 전혀 사용하지 않는다면, UserProfile UI를 slot으로 주입해 그 의존성을 없앨 수 있습니다.",
          "Composition으로 충분한 경우에는 Props Drilling만을 이유로 Context를 도입할 필요가 없습니다.",
        ]}
      />
    </div>
  );
}

function PropsDrillingTree({ user }: { user: User }) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-950">Props 전달 체인</p>
      <p className="mt-1 text-sm leading-6 text-rose-800">
        Layout과 Sidebar는 user를 사용하지 않지만 다음 컴포넌트로 전달합니다.
      </p>
      <div className="mt-4">
        <DrillingLayout user={user} />
      </div>
    </section>
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
    <TreeNode name="Sidebar" note="user Props를 받아 UserProfile로 전달">
      <UserProfile user={user} />
    </TreeNode>
  );
}

function CompositionTree({ user }: { user: User }) {
  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <p className="text-sm font-semibold text-sky-950">Composition slot</p>
      <p className="mt-1 text-sm leading-6 text-sky-800">
        Layout은 sidebar UI만 받고 user 도메인 정보는 알지 못합니다.
      </p>
      <div className="mt-4">
        <CompositionLayout sidebar={<UserProfile user={user} />} />
      </div>
    </section>
  );
}

function CompositionLayout({ sidebar }: { sidebar: ReactNode }) {
  return (
    <TreeNode name="Layout" note="sidebar ReactNode만 받아 배치">
      <div className="rounded-xl border border-sky-200 bg-white p-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700">
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
        UserProfile uses user
      </p>
      <p className="mt-2 text-base font-semibold text-indigo-950">{user.name}</p>
      <p className="mt-1 text-sm text-indigo-800">{user.role}</p>
    </div>
  );
}
