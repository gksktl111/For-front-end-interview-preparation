import { useEffect, useState } from "react";

export default function StaleClosure() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  // stale closure가 발생하는 예제
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCount1(count1 + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  // 함수형 상태 업데이트로 개선한 예제
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCount2((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  // 최신 count와 effect를 동기화해 개선한 예제
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCount3(count3 + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [count3]);

  const examples = [
    {
      title: "stale closure",
      label: "잘못된 예",
      count: count1,
      tone: {
        card: "border-rose-200 bg-rose-50/60",
        label: "bg-rose-100 text-rose-700",
        counter: "border-rose-200 bg-white text-rose-700",
        divider: "border-rose-200/70",
      },
      description:
        "빈 의존성 배열에서 만든 콜백이 첫 렌더 시점의 count1 값을 계속 참조합니다.",
      note: "처음 값 0을 기준으로 계산하기 때문에 보통 1에서 멈춘 것처럼 보입니다.",
    },
    {
      title: "functional update",
      label: "권장 방식",
      count: count2,
      tone: {
        card: "border-emerald-200 bg-emerald-50/60",
        label: "bg-emerald-100 text-emerald-700",
        counter: "border-emerald-200 bg-white text-emerald-700",
        divider: "border-emerald-200/70",
      },
      description:
        "이전 상태를 인자로 받는 함수형 업데이트를 사용해 최신 값을 기준으로 증가시킵니다.",
      note: "상태 누적 업데이트에서 stale closure를 피하기 가장 실용적인 방식입니다.",
    },
    {
      title: "dependency sync",
      label: "대안",
      count: count3,
      tone: {
        card: "border-sky-200 bg-sky-50/60",
        label: "bg-sky-100 text-sky-700",
        counter: "border-sky-200 bg-white text-sky-700",
        divider: "border-sky-200/70",
      },
      description:
        "count3를 의존성에 넣어 effect를 다시 실행하면서 최신 값을 반영합니다.",
      note: "동작은 맞지만 count3가 바뀔 때마다 기존 interval을 정리하고 새 interval을 등록합니다. 이 cleanup과 재등록 사이의 비용 때문에 tick 간격이 조금씩 밀릴 수 있습니다.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {examples.map((example) => (
          <article
            className={`rounded-2xl border p-5 ${example.tone.card}`}
            key={example.title}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] ${example.tone.label}`}
                >
                  {example.label}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                  {example.title}
                </h2>
              </div>
              <div
                className={`rounded-xl border px-4 py-2 text-2xl font-semibold tabular-nums ${example.tone.counter}`}
              >
                {example.count}
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {example.description}
            </p>
            <p
              className={`mt-4 border-t pt-4 text-sm leading-6 text-slate-500 ${example.tone.divider}`}
            >
              {example.note}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
        <h2 className="text-base font-semibold text-indigo-950">정리</h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>
            stale closure는 비동기 콜백이 이전 렌더의 상태를 기억하면서 생깁니다.
          </li>
          <li>
            상태 누적 업데이트는 <code>setState(prev =&gt; ...)</code> 형태가 안전합니다.
          </li>
          <li>
            의존성 배열로 최신 값을 맞출 수도 있지만 effect 재실행 비용을 함께 고려해야
            합니다.
          </li>
        </ul>

        <div className="mt-5 grid gap-3 border-t border-indigo-200 pt-5 md:grid-cols-2">
          <div className="rounded-xl bg-white/70 p-4">
            <h3 className="text-sm font-semibold text-emerald-800">
              functional update가 적합한 경우
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
              <li>이전 상태를 기준으로 값을 누적해서 변경할 때</li>
              <li>interval, timeout, 이벤트 콜백 안에서 state를 업데이트할 때</li>
              <li>effect를 다시 실행할 필요 없이 최신 상태만 필요할 때</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white/70 p-4">
            <h3 className="text-sm font-semibold text-sky-800">
              dependency sync가 필요한 경우
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
              <li>state나 props 변경에 맞춰 effect 자체를 다시 실행해야 할 때</li>
              <li>최신 값으로 구독, 요청, 타이머를 다시 설정해야 할 때</li>
              <li>cleanup 후 새 외부 리소스를 연결해야 할 때</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
