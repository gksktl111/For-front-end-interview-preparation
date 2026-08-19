import type { ReactNode } from "react";

export type TimelineTone =
  | "default"
  | "rose"
  | "emerald"
  | "sky"
  | "indigo";

export type TimelineItem = {
  id: number;
  message: string;
  tone: TimelineTone;
};

const metricToneClassNames: Record<TimelineTone, string> = {
  default: "border-slate-200 bg-slate-50 text-slate-950",
  rose: "border-rose-200 bg-rose-50 text-rose-950",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  sky: "border-sky-200 bg-sky-50 text-sky-950",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-950",
};

const timelineToneClassNames: Record<TimelineTone, string> = {
  default: "border-slate-200 bg-white text-slate-700",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
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
  tone?: TimelineTone;
  value: ReactNode;
}) {
  return (
    <div className={"rounded-xl border p-4 " + metricToneClassNames[tone]}>
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

export function EffectTimeline({
  emptyMessage,
  items,
}: {
  emptyMessage: string;
  items: TimelineItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {items.map((item) => (
        <li
          className={
            "rounded-xl border px-3 py-2.5 text-sm leading-6 " +
            timelineToneClassNames[item.tone]
          }
          key={item.id}
        >
          {item.message}
        </li>
      ))}
    </ol>
  );
}
