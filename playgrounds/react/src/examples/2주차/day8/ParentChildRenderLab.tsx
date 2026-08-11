import { useRef, useState } from "react";

export default function ParentChildRenderLab() {
  const [parentCount, setParentCount] = useState(0);
  const parentRenderCount = useRef(0);
  parentRenderCount.current += 1;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-sky-700">
          Render / Commit
        </p>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
          부모 리렌더링과 자식 컴포넌트 실행
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          자식 Props는 고정되어 있지만 부모 State를 바꾸면 자식 함수도 다시 실행됩니다.
          이 화면은 리렌더링과 DOM 업데이트가 같은 의미가 아님을 확인하는 실습입니다.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric label="Parent renders" value={parentRenderCount.current} />
          <Metric label="Parent count" value={parentCount} />
        </div>

        <button
          className="mt-5 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          type="button"
          onClick={() => setParentCount((count) => count + 1)}
        >
          Parent state 변경
        </button>

        <ChildRenderProbe name="React" />
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
        <h2 className="text-base font-semibold text-sky-950">관찰 포인트</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>버튼을 누르면 Parent render count와 Child render count가 함께 증가합니다.</li>
          <li>Child의 `props.name`은 계속 `React`로 같아도 Child 함수는 다시 실행될 수 있습니다.</li>
          <li>Child의 화면 텍스트가 그대로라면 실제 DOM 변경은 없거나 작을 수 있습니다.</li>
          <li>`React.memo`는 여기서는 존재만 확인하고 최적화 파트에서 판단 기준을 다룹니다.</li>
        </ul>
      </section>
    </div>
  );
}

function ChildRenderProbe({ name }: { name: string }) {
  const childRenderCount = useRef(0);
  childRenderCount.current += 1;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Child component</p>
          <p className="mt-1 text-sm text-slate-600">props.name: {name}</p>
        </div>
        <Metric label="Child renders" value={childRenderCount.current} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
        {value}
      </p>
    </div>
  );
}
