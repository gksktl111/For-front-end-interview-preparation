import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.24),_transparent_24%),linear-gradient(180deg,_#fff7ed_0%,_#fffbeb_100%)] px-6 py-12 text-slate-900">
      <section className="mx-auto w-full max-w-4xl rounded-[28px] bg-white/82 p-8 shadow-[0_24px_48px_rgba(217,119,6,0.14)]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
          Next Playground
        </p>
        <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-6xl">
          Route-based sandbox
        </h1>
        <p className="mb-5 max-w-2xl text-base leading-7 text-slate-700">
          Keep each experiment under <code>app/examples</code> and open it by route.
        </p>
        <Link
          href="/examples/day1/counter"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-slate-800"
        >
          Open day1 counter example
        </Link>
      </section>
    </main>
  );
}
