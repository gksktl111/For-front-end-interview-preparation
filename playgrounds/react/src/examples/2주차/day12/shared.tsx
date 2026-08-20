import type { ReactNode } from "react";

export type Tone = "default" | "rose" | "emerald" | "sky" | "indigo";

const toneClassNames: Record<Tone, string> = {
  default: "border-slate-200 bg-slate-50 text-slate-950",
  rose: "border-rose-200 bg-rose-50 text-rose-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  sky: "border-sky-200 bg-sky-50 text-sky-950",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
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
  tone?: Tone;
  value: ReactNode;
}) {
  return (
    <div className={"rounded-xl border p-4 " + toneClassNames[tone]}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 min-h-8 break-words text-xl font-semibold tabular-nums">
        {value}
      </p>
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

export function StatePill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const classNameByTone: Record<Tone, string> = {
    default: "bg-slate-100 text-slate-700",
    rose: "bg-rose-100 text-rose-700",
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
        classNameByTone[tone]
      }
    >
      {children}
    </span>
  );
}
