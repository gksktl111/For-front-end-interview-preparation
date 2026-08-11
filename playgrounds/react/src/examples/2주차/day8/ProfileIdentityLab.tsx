import { useRef, useState } from "react";

export default function ProfileIdentityLab() {
  const [userId, setUserId] = useState("user-a");
  const [resetByKey, setResetByKey] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
          Identity
        </p>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
          Props 변경과 key 변경 비교
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          UserProfile 내부에 메모를 입력한 뒤 사용자를 전환해 보세요. Props만 바뀌는 경우와
          `key`까지 바뀌는 경우의 State 보존 차이를 확인합니다.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {["user-a", "user-b"].map((nextUserId) => (
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                userId === nextUserId
                  ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              key={nextUserId}
              type="button"
              onClick={() => setUserId(nextUserId)}
            >
              {nextUserId}
            </button>
          ))}
          <button
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              resetByKey
                ? "border-indigo-400 bg-indigo-100 text-indigo-800"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            type="button"
            onClick={() => setResetByKey((enabled) => !enabled)}
          >
            key={resetByKey ? "userId" : "shared"}
          </button>
        </div>

        <UserProfile key={resetByKey ? userId : "shared-profile"} userId={userId} />
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <h2 className="text-base font-semibold text-emerald-950">정리</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>`key=shared`일 때는 Props만 바뀌므로 같은 Identity로 판단됩니다.</li>
          <li>`key=userId`일 때는 사용자를 바꿀 때 다른 Identity로 판단됩니다.</li>
          <li>다른 Identity가 되면 기존 State를 재사용하지 않고 새 State로 시작합니다.</li>
          <li>State 보존과 초기화 중 무엇이 맞는지는 UX 요구사항으로 판단합니다.</li>
        </ul>
      </section>
    </div>
  );
}

function UserProfile({ userId }: { userId: string }) {
  const [memo, setMemo] = useState("");
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{userId}</p>
          <p className="mt-1 text-xs text-slate-500">
            UserProfile render #{renderCount.current}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
          local state
        </span>
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="profile-memo">
        사용자 메모
      </label>
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        id="profile-memo"
        value={memo}
        placeholder={`${userId} 메모를 입력하세요`}
        onChange={(event) => setMemo(event.target.value)}
      />
    </div>
  );
}
