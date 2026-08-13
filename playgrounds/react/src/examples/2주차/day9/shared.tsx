export type LogItem = {
  id: number;
  message: string;
  tone: "default" | "rose" | "emerald" | "sky";
};

export function PanelHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-indigo-700">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export function Metric({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "default" | "rose" | "emerald";
  value: string;
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-white text-rose-950"
      : tone === "emerald"
        ? "border-emerald-200 bg-white text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-950";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 min-h-8 break-words text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function LogList({
  className = "",
  logs,
}: {
  className?: string;
  logs: LogItem[];
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {logs.map((log) => (
        <p
          className={`rounded-xl border px-3 py-2 text-sm leading-6 ${
            log.tone === "rose"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : log.tone === "emerald"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : log.tone === "sky"
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
          key={log.id}
        >
          {log.message}
        </p>
      ))}
    </div>
  );
}

export function PracticeSummary({ points }: { points: string[] }) {
  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
      <h2 className="text-base font-semibold text-indigo-950">정리</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
