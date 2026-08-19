import {
  createContext,
  memo,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

type Density = "comfortable" | "compact";

type User = {
  id: string;
  name: string;
};

type BigContextValue = {
  density: Density;
  user: User;
};

type AuthContextValue = {
  user: User;
};

type SettingsContextValue = {
  density: Density;
};

const CURRENT_USER: User = {
  id: "user-minji",
  name: "민지",
};

const BigContext = createContext<BigContextValue | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);
const SettingsContext = createContext<SettingsContextValue | null>(null);

export default function ContextScopeLab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Context"
          title="Context value의 책임 범위를 나누기"
          description="밀도 설정만 바꿨을 때 user만 읽는 Consumer가 왜 큰 Context에서는 영향을 받고, 분리한 Context에서는 피할 수 있는지 비교합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <BigContextDemo />
          <SeparatedContextsDemo />
        </div>

        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
          개발 모드 Strict Mode에서는 render count가 예상보다 크게 보일 수 있습니다. 비교의 핵심은 설정 변경 전후 user Consumer가 영향을 받는지입니다.
        </p>
      </section>

      <PracticeSummary
        points={[
          "Context는 깊은 트리에 공통 값을 전달하는 도구이며, 모든 State를 담는 상자가 아닙니다.",
          "Provider value가 바뀌면 그 Context를 읽는 Consumer가 리렌더링 대상이 됩니다.",
          "실제 사용 패턴에서 독립적으로 바뀌는 책임이라면 Context 분리와 안정적인 Provider value를 검토할 수 있습니다.",
        ]}
      />
    </div>
  );
}

function BigContextDemo() {
  const [density, setDensity] = useState<Density>("comfortable");
  const value = useMemo(
    () => ({
      density,
      user: CURRENT_USER,
    }),
    [density],
  );

  return (
    <BigContext.Provider value={value}>
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-rose-950">하나의 큰 Context</p>
        <p className="mt-1 text-sm leading-6 text-rose-800">
          density가 바뀌면 value 객체가 바뀌고 user만 읽는 Consumer도 같은 Context를 구독하므로 영향을 받습니다.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <BigContextUserBadge />
          <BigContextDensityBadge />
        </div>

        <div className="mt-4">
          <DensityButtons density={density} onChange={setDensity} tone="rose" />
        </div>
      </section>
    </BigContext.Provider>
  );
}

function SeparatedContextsDemo() {
  const [density, setDensity] = useState<Density>("comfortable");
  const authValue = useMemo(
    () => ({
      user: CURRENT_USER,
    }),
    [],
  );
  const settingsValue = useMemo(
    () => ({
      density,
    }),
    [density],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <SettingsContext.Provider value={settingsValue}>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-950">책임별 Context 분리</p>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            SettingsContext만 바뀌고 AuthContext value는 유지됩니다. memoized user Consumer는 변경을 건너뛸 수 있습니다.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SeparatedUserBadge />
            <SeparatedDensityBadge />
          </div>

          <div className="mt-4">
            <DensityButtons density={density} onChange={setDensity} tone="emerald" />
          </div>
        </section>
      </SettingsContext.Provider>
    </AuthContext.Provider>
  );
}

const BigContextUserBadge = memo(function BigContextUserBadge() {
  const renderCount = useRenderCount();
  const context = useContext(BigContext);

  if (context === null) {
    return null;
  }

  return (
    <Metric
      label={"user Consumer renders: " + renderCount}
      tone="rose"
      value={context.user.name}
    />
  );
});

const BigContextDensityBadge = memo(function BigContextDensityBadge() {
  const renderCount = useRenderCount();
  const context = useContext(BigContext);

  if (context === null) {
    return null;
  }

  return (
    <Metric
      label={"density Consumer renders: " + renderCount}
      tone="rose"
      value={formatDensity(context.density)}
    />
  );
});

const SeparatedUserBadge = memo(function SeparatedUserBadge() {
  const renderCount = useRenderCount();
  const auth = useContext(AuthContext);

  if (auth === null) {
    return null;
  }

  return (
    <Metric
      label={"Auth Consumer renders: " + renderCount}
      tone="emerald"
      value={auth.user.name}
    />
  );
});

const SeparatedDensityBadge = memo(function SeparatedDensityBadge() {
  const renderCount = useRenderCount();
  const settings = useContext(SettingsContext);

  if (settings === null) {
    return null;
  }

  return (
    <Metric
      label={"Settings Consumer renders: " + renderCount}
      tone="emerald"
      value={formatDensity(settings.density)}
    />
  );
});

function DensityButtons({
  density,
  onChange,
  tone,
}: {
  density: Density;
  onChange: (nextDensity: Density) => void;
  tone: "rose" | "emerald";
}) {
  const className =
    tone === "rose"
      ? "rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      : "rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100";

  return (
    <button
      className={className}
      type="button"
      onClick={() =>
        onChange(density === "comfortable" ? "compact" : "comfortable")
      }
    >
      density를 {density === "comfortable" ? "compact" : "comfortable"}로 변경
    </button>
  );
}

function useRenderCount() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return renderCount.current;
}

function formatDensity(density: Density) {
  return density === "comfortable" ? "comfortable" : "compact";
}
