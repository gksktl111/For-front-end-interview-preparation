import { useEffect, useRef, useState } from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

export default function EffectSynchronizationLab() {
  const [count, setCount] = useState(0);
  const [price, setPrice] = useState(12000);
  const [quantity, setQuantity] = useState(2);
  const [effectSetups, setEffectSetups] = useState(0);
  const renderCount = useRef(0);

  renderCount.current += 1;

  useEffect(() => {
    const previousTitle = document.title;

    document.title = "Day 11 · Count " + count;
    setEffectSetups((previous) => previous + 1);

    return () => {
      document.title = previousTitle;
    };
  }, [count]);

  const total = price * quantity;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Effect synchronization"
          title="React count와 브라우저 document.title 맞추기"
          description="count가 바뀌면 Effect가 React 밖의 DOM API인 document.title을 최신 값으로 바꿉니다. 오른쪽에는 Effect 없이 렌더링 중 계산하는 total을 함께 둡니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              권장: 외부 시스템 동기화
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              document.title은 React State가 아니므로 count와 맞추는 Effect가 필요합니다.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="React count" tone="emerald" value={count} />
              <Metric label="Effect setup" tone="emerald" value={effectSetups} />
              <Metric label="Render calls" tone="emerald" value={renderCount.current} />
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                browser document.title
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                Day 11 · Count {count}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                브라우저 탭 제목도 실제로 바뀝니다. 개발 StrictMode에서는 첫 mount의 setup 수가 더 보일 수 있습니다.
              </p>
            </div>

            <button
              className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              type="button"
              onClick={() => setCount((previous) => previous + 1)}
            >
              count + 1
            </button>
          </article>

          <article className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-sm font-semibold text-sky-950">
              권장: 렌더링 중 계산
            </p>
            <p className="mt-1 text-sm leading-6 text-sky-800">
              total은 price와 quantity에서 항상 계산되므로 별도 State와 동기화 Effect가 필요하지 않습니다.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="price" tone="sky" value={price.toLocaleString() + "원"} />
              <Metric label="quantity" tone="sky" value={quantity + "개"} />
              <Metric label="derived total" tone="sky" value={total.toLocaleString() + "원"} />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                type="button"
                onClick={() => setPrice((previous) => previous + 1000)}
              >
                price + 1,000원
              </button>
              <button
                className="rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                type="button"
                onClick={() => setQuantity((previous) => previous + 1)}
              >
                quantity + 1
              </button>
            </div>
          </article>
        </div>
      </section>

      <PracticeSummary
        points={[
          "Effect의 목적은 React State를 브라우저 title처럼 React 밖의 시스템과 동기화하는 것입니다.",
          "total처럼 현재 State에서 계산 가능한 값은 렌더링 중 바로 계산하면 Effect와 추가 State 업데이트가 필요 없습니다.",
          "Effect setup 수는 개발 StrictMode에서 cleanup 검증 때문에 예상보다 많이 보일 수 있습니다.",
        ]}
      />
    </div>
  );
}
