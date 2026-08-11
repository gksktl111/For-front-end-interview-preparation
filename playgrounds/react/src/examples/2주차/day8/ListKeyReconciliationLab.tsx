import { useRef, useState } from "react";

type User = {
  id: string;
  name: string;
};

const initialUsers: User[] = [
  { id: "user-a", name: "User A" },
  { id: "user-b", name: "User B" },
  { id: "user-c", name: "User C" },
];

function createNewUser(): User {
  const id = `user-${Date.now()}`;

  return {
    id,
    name: "New User",
  };
}

export default function ListKeyReconciliationLab() {
  const [users, setUsers] = useState(initialUsers);
  const [keyMode, setKeyMode] = useState<"index" | "id">("index");

  const reverseUsers = () => {
    setUsers((previousUsers) => [...previousUsers].reverse());
  };

  const removeSecondUser = () => {
    setUsers((previousUsers) => previousUsers.filter((_, index) => index !== 1));
  };

  const addUserToFront = () => {
    setUsers((previousUsers) => [createNewUser(), ...previousUsers]);
  };

  const resetUsers = () => {
    setUsers(initialUsers);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-rose-700">
          key / Reconciliation
        </p>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
          index key 문제 재현
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          각 Row에 메모를 입력한 뒤 순서를 바꾸거나 중간 항목을 삭제해 보세요. Row의
          로컬 State가 데이터에 붙는지, 위치에 붙는지 비교합니다.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              keyMode === "index"
                ? "border-rose-400 bg-rose-100 text-rose-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            type="button"
            onClick={() => setKeyMode("index")}
          >
            key=index
          </button>
          <button
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              keyMode === "id"
                ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            type="button"
            onClick={() => setKeyMode("id")}
          >
            key=user.id
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={reverseUsers}
          >
            순서 뒤집기
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={removeSecondUser}
          >
            두 번째 삭제
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={addUserToFront}
          >
            앞에 추가
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={resetUsers}
          >
            목록 초기화
          </button>
        </div>

        <ul className="mt-5 space-y-3">
          {users.map((user, index) => (
            <UserRow key={keyMode === "index" ? index : user.id} user={user} />
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
        <h2 className="text-base font-semibold text-rose-950">정리</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>`key=index`는 데이터를 식별하는 값이 아니라 현재 위치를 식별합니다.</li>
          <li>추가·삭제·정렬이 가능한 목록에서는 위치와 데이터의 관계가 쉽게 바뀝니다.</li>
          <li>Row가 로컬 State를 가지면 입력값이나 체크 상태가 다른 데이터에 붙을 수 있습니다.</li>
          <li>가능하면 서버 id나 클라이언트에서 만든 안정적인 id를 `key`로 사용합니다.</li>
        </ul>
      </section>
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const [memo, setMemo] = useState("");
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{user.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {user.id} · render #{renderCount.current}
          </p>
        </div>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 sm:max-w-56"
          value={memo}
          placeholder={`${user.name} memo`}
          onChange={(event) => setMemo(event.target.value)}
        />
      </div>
    </li>
  );
}
