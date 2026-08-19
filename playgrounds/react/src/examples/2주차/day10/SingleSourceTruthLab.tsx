import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

type User = {
  id: string;
  name: string;
  team: string;
};

const users: User[] = [
  {
    id: "user-react",
    name: "React",
    team: "Frontend",
  },
  {
    id: "user-query",
    name: "Query",
    team: "Platform",
  },
];

export default function SingleSourceTruthLab() {
  const [selectedUserId, setSelectedUserId] = useState(users[0].id);
  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? users[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Single Source of Truth"
          title="Props를 Local State로 복사하면 왜 오래된 값이 남을까?"
          description="부모가 user Props를 바꿔도 같은 위치에 유지되는 자식의 useState 초기값은 다시 실행되지 않는다는 점을 비교합니다."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          {users.map((user) => (
            <button
              className={
                user.id === selectedUser.id
                  ? "rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                  : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              }
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
            >
              부모 user를 {user.name}로 변경
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <CopiedUserProfile user={selectedUser} />
          <PropsUserProfile user={selectedUser} />
        </div>
      </section>

      <PracticeSummary
        points={[
          "useState(user)의 user는 처음 마운트할 때만 초기값으로 쓰입니다. 이후 Props 변경은 Local State를 덮어쓰지 않습니다.",
          "단순 표시라면 Props 자체를 Source of Truth로 사용하면 부모의 최신 값이 그대로 반영됩니다.",
          "편집 draft처럼 복사본이 원본과 다른 의미라면 가능하지만, 저장과 취소, Props 변경 시 재초기화 규칙을 따로 설계해야 합니다.",
        ]}
      />
    </div>
  );
}

function CopiedUserProfile({ user }: { user: User }) {
  const [localUser] = useState(user);

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-950">주의: Props를 Local State로 복사</p>
      <p className="mt-1 text-sm leading-6 text-rose-800">
        같은 컴포넌트 위치가 유지되므로 localUser는 첫 user를 계속 기억합니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="현재 Parent user" tone="rose" value={user.name} />
        <Metric label="Child localUser" tone="rose" value={localUser.name} />
      </div>

      <p className="mt-4 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-800">
        Local team: {localUser.team}
      </p>
    </section>
  );
}

function PropsUserProfile({ user }: { user: User }) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-950">권장: Props를 그대로 사용</p>
      <p className="mt-1 text-sm leading-6 text-emerald-800">
        Parent가 가진 user 하나가 Source of Truth이므로 선택을 바꾸면 화면도 함께 바뀝니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="현재 Parent user" tone="emerald" value={user.name} />
        <Metric label="표시하는 Props user" tone="emerald" value={user.name} />
      </div>

      <p className="mt-4 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800">
        Props team: {user.team}
      </p>
    </section>
  );
}
