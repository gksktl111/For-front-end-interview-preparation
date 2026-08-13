import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

export default function DerivedStateLab() {
  const [price, setPrice] = useState(12000);
  const [quantity, setQuantity] = useState(2);
  const [storedTotalPrice, setStoredTotalPrice] = useState(24000);

  const derivedTotalPrice = price * quantity;
  const isOutOfSync = storedTotalPrice !== derivedTotalPrice;

  const updatePriceOnly = () => {
    setPrice((previousPrice) => previousPrice + 1000);
  };

  const updateQuantityWithStoredTotal = () => {
    setQuantity((previousQuantity) => {
      const nextQuantity = previousQuantity + 1;
      setStoredTotalPrice(price * nextQuantity);

      return nextQuantity;
    });
  };

  const syncStoredTotal = () => {
    setStoredTotalPrice(derivedTotalPrice);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Derived State"
          title="불필요한 State 제거"
          description="price와 quantity로 계산 가능한 totalPrice를 별도 State로 저장하면 동기화 책임이 생깁니다."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Metric label="price" value={`${price.toLocaleString()}원`} />
          <Metric label="quantity" value={`${quantity}개`} />
          <Metric
            label="derived total"
            value={`${derivedTotalPrice.toLocaleString()}원`}
            tone="emerald"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                stored total state
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
                {storedTotalPrice.toLocaleString()}원
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isOutOfSync
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isOutOfSync ? "동기화 깨짐" : "동기화됨"}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            type="button"
            onClick={updatePriceOnly}
          >
            price만 변경
          </button>
          <button
            className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            type="button"
            onClick={updateQuantityWithStoredTotal}
          >
            quantity + stored total 변경
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={syncStoredTotal}
          >
            stored total 동기화
          </button>
        </div>
      </section>

      <PracticeSummary
        points={[
          "다른 State로 항상 계산 가능한 값은 별도 State가 아니라 파생 값으로 둘 수 있습니다.",
          "중복 State는 동기화 책임을 만들고, 갱신 누락 시 화면 불일치를 만듭니다.",
          "원천 State를 최소화하면 이벤트 처리 로직과 렌더링 계산이 단순해집니다.",
        ]}
      />
    </div>
  );
}
