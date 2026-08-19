import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

export default function LiftingStateUpLab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Lifting State Up"
          title="두 Counter가 하나의 값을 공유하게 만들기"
          description="각 Counter가 State를 가질 때와 공통 부모가 State를 가질 때의 Source of Truth 개수를 비교합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <IndependentCounters />
          <SharedCounters />
        </div>
      </section>

      <PracticeSummary
        points={[
          "독립 Counter는 각자 Local State를 가지므로 클릭한 Counter만 바뀝니다.",
          "공유 Counter는 공통 부모의 count 하나를 Props로 읽고, event callback으로 변경을 요청합니다.",
          "흐름은 Parent State → Props → Child Event → callback → Parent State Update입니다.",
        ]}
      />
    </div>
  );
}

function IndependentCounters() {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-950">각 Counter의 Local State</p>
      <p className="mt-1 text-sm leading-6 text-rose-800">
        같은 UI처럼 보여도 Counter마다 독립적인 Source of Truth가 있습니다.
      </p>

      <div className="mt-4">
        <Metric label="Source of Truth 개수" tone="rose" value="2개" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <IndependentCounter label="Counter A" />
        <IndependentCounter label="Counter B" />
      </div>
    </section>
  );
}

function IndependentCounter({ label }: { label: string }) {
  const [count, setCount] = useState(0);

  return (
    <button
      className="rounded-xl border border-rose-300 bg-white p-4 text-left transition hover:bg-rose-100"
      type="button"
      onClick={() => setCount((previousCount) => previousCount + 1)}
    >
      <span className="block text-sm font-semibold text-rose-800">{label}</span>
      <span className="mt-2 block text-3xl font-semibold tabular-nums text-rose-950">
        {count}
      </span>
      <span className="mt-2 block text-xs text-rose-700">이 버튼만 증가</span>
    </button>
  );
}

function SharedCounters() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount((previousCount) => previousCount + 1);
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-950">공통 부모의 Shared State</p>
      <p className="mt-1 text-sm leading-6 text-emerald-800">
        공통 부모가 count 하나를 소유하고 두 자식에 같은 Props를 전달합니다.
      </p>

      <div className="mt-4">
        <Metric label="Source of Truth 개수" tone="emerald" value="1개: 부모 count" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SharedCounter label="Counter A" count={count} onIncrease={handleIncrease} />
        <SharedCounter label="Counter B" count={count} onIncrease={handleIncrease} />
      </div>

      <p className="mt-4 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs leading-5 text-emerald-800">
        Parent count → Props → Counter click → onIncrease callback → Parent count update
      </p>
    </section>
  );
}

function SharedCounter({
  count,
  label,
  onIncrease,
}: {
  count: number;
  label: string;
  onIncrease: () => void;
}) {
  return (
    <button
      className="rounded-xl border border-emerald-300 bg-white p-4 text-left transition hover:bg-emerald-100"
      type="button"
      onClick={onIncrease}
    >
      <span className="block text-sm font-semibold text-emerald-800">{label}</span>
      <span className="mt-2 block text-3xl font-semibold tabular-nums text-emerald-950">
        {count}
      </span>
      <span className="mt-2 block text-xs text-emerald-700">
        어느 버튼을 눌러도 같은 count 증가
      </span>
    </button>
  );
}
