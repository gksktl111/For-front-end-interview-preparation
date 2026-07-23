import { useEffect, useMemo, useState } from "react";
import { practiceRoutes } from "./examples/routes";
import type {
  DayRouteGroup,
  PracticeRoute,
  WeekRouteGroup,
} from "./examples/routes";

const HOME_PATH = "/";

type ActiveRoute =
  | {
      type: "home";
    }
  | {
      type: "week";
      week: WeekRouteGroup;
    }
  | {
      type: "day";
      week: WeekRouteGroup;
      day: DayRouteGroup;
    }
  | {
      type: "practice";
      week: WeekRouteGroup;
      day: DayRouteGroup;
      practice: PracticeRoute;
    };

function getCurrentPath() {
  const pathname = window.location.pathname.replace(/\/+$/, "");

  return pathname || HOME_PATH;
}

function navigateTo(path: string) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function resolveRoute(path: string): ActiveRoute {
  for (const week of practiceRoutes) {
    if (week.path === path) {
      return {
        type: "week",
        week,
      };
    }

    for (const day of week.days) {
      if (day.path === path) {
        return {
          type: "day",
          week,
          day,
        };
      }

      for (const practice of day.practices) {
        if (practice.path === path) {
          return {
            type: "practice",
            week,
            day,
            practice,
          };
        }
      }
    }
  }

  return {
    type: "home",
  };
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getCurrentPath());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const activeRoute = useMemo(() => resolveRoute(currentPath), [currentPath]);

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {activeRoute.type === "home" && <LandingPage />}

        {activeRoute.type === "week" && <WeekPage week={activeRoute.week} />}

        {activeRoute.type === "day" && (
          <DayPage day={activeRoute.day} week={activeRoute.week} />
        )}

        {activeRoute.type === "practice" && (
          <PracticePage
            day={activeRoute.day}
            practice={activeRoute.practice}
            week={activeRoute.week}
          />
        )}
      </div>
    </main>
  );
}

function LandingPage() {
  const totalPracticeCount = practiceRoutes.reduce(
    (total, week) =>
      total +
      week.days.reduce((dayTotal, day) => dayTotal + day.practices.length, 0),
    0,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${practiceRoutes.length} weeks · ${totalPracticeCount} labs`}
        title="React Practice"
        description="주차별 실습을 정리한 인덱스입니다. 주차를 선택한 뒤 날짜와 실습 항목으로 이동합니다."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {practiceRoutes.map((week) => (
          <RouteCard
            key={week.path}
            title={week.title}
            meta={`${week.days.length} days`}
            description={week.description}
            actionLabel="주차 보기"
            onClick={() => navigateTo(week.path)}
          />
        ))}
      </div>
    </div>
  );
}

function WeekPage({ week }: { week: WeekRouteGroup }) {
  const practiceCount = week.days.reduce(
    (total, day) => total + day.practices.length,
    0,
  );

  return (
    <div className="space-y-8">
      <BackButton label="전체 목록" path={HOME_PATH} />
      <PageHeader
        eyebrow={`${week.days.length} days · ${practiceCount} labs`}
        title={week.title}
        description={week.description}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {week.days.map((day) => (
          <RouteCard
            key={day.path}
            title={day.title}
            meta={`${day.practices.length} labs`}
            description={day.description}
            actionLabel="날짜 보기"
            onClick={() => navigateTo(day.path)}
          />
        ))}
      </div>
    </div>
  );
}

function DayPage({
  week,
  day,
}: {
  week: WeekRouteGroup;
  day: DayRouteGroup;
}) {
  return (
    <div className="space-y-8">
      <BackButton label={week.title} path={week.path} />
      <PageHeader
        eyebrow={week.title}
        title={day.title}
        description={day.description}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {day.practices.map((practice) => (
          <RouteCard
            key={practice.path}
            title={practice.title}
            meta="practice"
            description={practice.description}
            actionLabel="실습 열기"
            onClick={() => navigateTo(practice.path)}
          />
        ))}
      </div>
    </div>
  );
}

function PracticePage({
  day,
  practice,
  week,
}: {
  day: DayRouteGroup;
  practice: PracticeRoute;
  week: WeekRouteGroup;
}) {
  const PracticeComponent = practice.Component;

  return (
    <div className="space-y-6">
      <BackButton label={day.title} path={day.path} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
            {week.title} / {day.title}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {practice.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {practice.description}
          </p>
        </div>

        <PracticeComponent />
      </section>
    </div>
  );
}

function PageHeader({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="border-b border-slate-200 pb-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </header>
  );
}

function BackButton({ label, path }: { label: string; path: string }) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
      type="button"
      onClick={() => navigateTo(path)}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}

function RouteCard({
  actionLabel,
  description,
  meta,
  onClick,
  title,
}: {
  actionLabel: string;
  description: string;
  meta: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)]"
      type="button"
      onClick={onClick}
    >
      <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.14em] text-indigo-700">
        {meta}
      </span>
      <span className="mt-4 block text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </span>
      <span className="mt-3 block min-h-12 text-sm leading-6 text-slate-600">
        {description}
      </span>
      <span className="mt-6 inline-flex text-sm font-medium text-indigo-700">
        {actionLabel}
        <span
          className="ml-1 transition group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </span>
    </button>
  );
}
