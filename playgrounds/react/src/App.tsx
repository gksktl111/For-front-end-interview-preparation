import StaleClosure from "./examples/1주차/day1/StaleClosure";

export default function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#e0f2fe_100%)] px-6 py-12 text-slate-900">
      <section className="mx-auto w-full max-w-4xl rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_40px_rgba(14,165,233,0.12)] backdrop-blur">
        {/* 1주차 day1 */}
        <StaleClosure />
      </section>
    </main>
  );
}
