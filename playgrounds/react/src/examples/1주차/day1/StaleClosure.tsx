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

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
          React Closure Lab
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Stale Closure 실습
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            <code>useEffect</code> 안의 콜백이 처음 렌더 시점의 값을 캡처하면 최신 상태를
            보지 못할 수 있습니다. 아래 세 카운터는 같은 타이머 예제지만, 상태를 읽는
            방식에 따라 결과가 어떻게 달라지는지 비교합니다.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-rose-200 bg-gradient-to-b from-rose-50 to-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
            stale closure
          </p>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            빈 의존성 배열에서 만든 콜백이 처음의 <code>count1</code> 값을 계속 참조합니다.
          </p>
          <div className="rounded-2xl bg-slate-950 px-4 py-5 text-center text-4xl font-black text-white">
            {count1}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            첫 렌더의 값인 <code>0</code>을 기준으로만 계산해서 보통 <code>1</code>에서
            멈춘 것처럼 보입니다.
          </p>
        </article>

        <article className="rounded-[24px] border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            functional update
          </p>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            이전 상태를 인자로 받는 함수형 업데이트를 사용해 항상 최신 값을 기준으로
            증가시킵니다.
          </p>
          <div className="rounded-2xl bg-slate-950 px-4 py-5 text-center text-4xl font-black text-white">
            {count2}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            stale closure 문제를 가장 안전하게 피하는 대표적인 방식입니다.
          </p>
        </article>

        <article className="rounded-[24px] border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            dependency sync
          </p>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            <code>count3</code>를 의존성에 넣어 effect를 다시 실행하면서 최신 값을 반영합니다.
          </p>
          <div className="rounded-2xl bg-slate-950 px-4 py-5 text-center text-4xl font-black text-white">
            {count3}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            동작은 맞지만 매번 interval을 새로 등록하므로 함수형 업데이트보다 부담이 큽니다.
          </p>
        </article>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
        <h3 className="mb-3 text-lg font-bold text-slate-900">정리</h3>
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          <li>
            stale closure는 비동기 콜백이 예전 렌더의 상태를 기억하면서 생깁니다.
          </li>
          <li>
            상태 누적 업데이트는 함수형 업데이트 <code>setState(prev =&gt; ...)</code>가
            가장 실용적입니다.
          </li>
          <li>
            의존성 배열을 늘려 최신 값을 맞출 수도 있지만 effect 재실행 비용을 같이
            고려해야 합니다.
          </li>
          <li>
            지금 예제의 <code>count3</code>처럼 의존성으로 상태를 맞추면 매 tick마다
            기존 interval을 정리하고 다시 등록하므로, UI에서 증가 속도가 덜 안정적으로
            보일 수 있습니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
