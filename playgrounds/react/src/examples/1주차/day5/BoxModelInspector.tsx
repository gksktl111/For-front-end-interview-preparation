import { useMemo, useState } from "react";

type BoxSizingMode = "content-box" | "border-box";
type DisplayMode = "block" | "inline" | "inline-block";
type PositionMode = "static" | "relative" | "absolute";

export default function BoxModelInspector() {
  const [boxSizing, setBoxSizing] = useState<BoxSizingMode>("content-box");
  const [display, setDisplay] = useState<DisplayMode>("block");
  const [position, setPosition] = useState<PositionMode>("static");
  const [contentWidth, setContentWidth] = useState(220);
  const [padding, setPadding] = useState(24);
  const [border, setBorder] = useState(4);
  const [margin, setMargin] = useState(16);
  const [zIndex, setZIndex] = useState(2);
  const [parentCreatesStackingContext, setParentCreatesStackingContext] =
    useState(true);

  const renderedWidth = useMemo(() => {
    if (boxSizing === "border-box") {
      return contentWidth;
    }

    return contentWidth + padding * 2 + border * 2;
  }, [border, boxSizing, contentWidth, padding]);

  const contentAreaWidth = useMemo(() => {
    if (boxSizing === "content-box") {
      return contentWidth;
    }

    return Math.max(0, contentWidth - padding * 2 - border * 2);
  }, [border, boxSizing, contentWidth, padding]);

  const displayDescription = {
    block: "새 줄에서 시작하고 가능한 가로 공간을 차지합니다.",
    inline: "줄 안에서 흐르며 width/height가 기대처럼 적용되지 않을 수 있습니다.",
    "inline-block": "줄 안에서 흐르지만 박스 크기를 가질 수 있습니다.",
  } satisfies Record<DisplayMode, string>;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">
            controls
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Box Model 값을 바꿔보기
          </h2>

          <div className="mt-5 space-y-5">
            <SegmentedControl
              label="box-sizing"
              options={["content-box", "border-box"]}
              value={boxSizing}
              onChange={setBoxSizing}
            />

            <SegmentedControl
              label="display"
              options={["block", "inline", "inline-block"]}
              value={display}
              onChange={setDisplay}
            />

            <SegmentedControl
              label="position"
              options={["static", "relative", "absolute"]}
              value={position}
              onChange={setPosition}
            />

            <RangeControl
              label="width"
              max={360}
              min={120}
              value={contentWidth}
              onChange={setContentWidth}
            />
            <RangeControl
              label="padding"
              max={48}
              min={0}
              value={padding}
              onChange={setPadding}
            />
            <RangeControl
              label="border"
              max={16}
              min={0}
              value={border}
              onChange={setBorder}
            />
            <RangeControl
              label="margin"
              max={48}
              min={0}
              value={margin}
              onChange={setMargin}
            />
            <RangeControl
              label="z-index"
              max={20}
              min={0}
              value={zIndex}
              onChange={setZIndex}
            />

            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span>부모 stacking context 생성</span>
              <input
                checked={parentCreatesStackingContext}
                className="h-4 w-4"
                type="checkbox"
                onChange={(event) =>
                  setParentCreatesStackingContext(event.currentTarget.checked)
                }
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">
            result
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            렌더링 박스 관찰
          </h2>

          <div
            className={`mt-5 min-h-[360px] overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 ${
              parentCreatesStackingContext ? "opacity-[0.99]" : ""
            }`}
          >
            <div className="relative min-h-[300px] rounded-xl bg-white p-4">
              <div className="absolute right-6 top-8 z-10 h-32 w-48 rounded-xl border border-sky-200 bg-sky-100/80 p-4 text-sm font-medium text-sky-900">
                비교 레이어
                <p className="mt-2 text-xs font-normal leading-5 text-sky-700">
                  부모 stacking context 여부에 따라 비교 범위가 달라집니다.
                </p>
              </div>

              <span className="text-sm leading-7 text-slate-500">
                앞 문장입니다.{" "}
              </span>
              <div
                className="bg-amber-100"
                style={{
                  border: `${border}px solid rgb(217 119 6)`,
                  boxSizing,
                  display,
                  margin,
                  padding,
                  position,
                  top: position === "static" ? undefined : 24,
                  left: position === "static" ? undefined : 24,
                  width: contentWidth,
                  zIndex: position === "static" ? "auto" : zIndex,
                }}
              >
                <div className="min-h-20 rounded-lg bg-emerald-100 p-3 text-sm leading-6 text-emerald-950">
                  content 영역
                  <br />
                  계산 너비: {contentAreaWidth}px
                </div>
              </div>
              <span className="text-sm leading-7 text-slate-500">
                {" "}
                뒤 문장입니다. display와 position 값에 따라 문장 흐름이 바뀝니다.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
          <h2 className="text-base font-semibold text-indigo-950">계산 결과</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Metric label="box-sizing" value={boxSizing} />
            <Metric label="display" value={display} />
            <Metric label="position" value={position} />
            <Metric label="rendered width" value={`${renderedWidth}px`} />
            <Metric label="content width" value={`${contentAreaWidth}px`} />
            <Metric
              label="stacking context"
              value={parentCreatesStackingContext ? "parent isolated" : "shared"}
            />
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-950">관찰 포인트</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            <li>{displayDescription[display]}</li>
            <li>
              `content-box`는 width 밖으로 padding과 border가 더해지고,
              `border-box`는 width 안에 포함됩니다.
            </li>
            <li>
              `absolute`는 기본 흐름에서 빠져 주변 문장이 빈자리를 채울 수 있습니다.
            </li>
            <li>
              `z-index`는 같은 stacking context 안에서만 직접 비교됩니다.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function SegmentedControl<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly TValue[];
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              value === option
                ? "border-indigo-300 bg-indigo-100 text-indigo-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            key={option}
            type="button"
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeControl({
  label,
  max,
  min,
  value,
  onChange,
}: {
  label: string;
  max: number;
  min: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-800">
        <span>{label}</span>
        <span className="tabular-nums text-slate-500">{value}px</span>
      </span>
      <input
        className="mt-2 w-full accent-indigo-600"
        max={max}
        min={min}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-white/75 p-3">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-indigo-600">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
