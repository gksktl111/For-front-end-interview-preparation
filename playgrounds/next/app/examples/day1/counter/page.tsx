"use client";

import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.24),_transparent_24%),linear-gradient(180deg,_#fff7ed_0%,_#fffbeb_100%)] px-6 py-12 text-slate-900">
      <section className="mx-auto w-full max-w-4xl rounded-[28px] bg-white/82 p-8 shadow-[0_24px_48px_rgba(217,119,6,0.14)]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
          Example / day1
        </p>
        <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-5xl">
          Counter component
        </h1>
        <p className="mb-6 max-w-2xl text-base leading-7 text-slate-700">
          Small client component examples can live under route folders like this.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-slate-800"
            onClick={() => setCount((value) => value + 1)}
          >
            Count: {count}
          </button>
          <button
            type="button"
            className="rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-amber-50"
            onClick={() => setCount(0)}
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
