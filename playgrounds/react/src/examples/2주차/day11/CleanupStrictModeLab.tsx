import { useCallback, useEffect, useRef, useState } from "react";
import {
  EffectTimeline,
  Metric,
  PanelHeading,
  PracticeSummary,
} from "./shared";
import type { TimelineItem, TimelineTone } from "./shared";

export default function CleanupStrictModeLab() {
  const [isSubscriberMounted, setIsSubscriberMounted] = useState(true);
  const [resizeCount, setResizeCount] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const logSequence = useRef(0);

  const recordTrace = useCallback(
    (message: string, tone: TimelineTone = "default") => {
      setTimeline((previous) =>
        [...previous, { id: ++logSequence.current, message, tone }].slice(-12),
      );
    },
    [],
  );

  const increaseResizeCount = useCallback(() => {
    setResizeCount((previous) => previous + 1);
  }, []);

  const dispatchResize = () => {
    recordTrace("브라우저에 resize 이벤트를 보냈습니다.", "indigo");
    window.dispatchEvent(new Event("resize"));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Cleanup lifecycle"
          title="window resize 구독을 setup과 cleanup으로 관리하기"
          description="Subscriber가 mount되어 있는 동안 실제 window resize listener를 등록합니다. mount와 unmount, 이벤트 발생을 반복하며 setup과 cleanup이 짝을 이루는지 관찰하세요."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric
                label="subscriber"
                tone={isSubscriberMounted ? "emerald" : "rose"}
                value={isSubscriberMounted ? "mounted" : "unmounted"}
              />
              <Metric label="resize received" tone="sky" value={resizeCount} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className={
                  "rounded-xl border px-4 py-2.5 text-sm font-semibold transition " +
                  (isSubscriberMounted
                    ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100")
                }
                type="button"
                onClick={() => setIsSubscriberMounted((previous) => !previous)}
              >
                {isSubscriberMounted ? "Subscriber unmount" : "Subscriber mount"}
              </button>
              <button
                className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                type="button"
                onClick={dispatchResize}
              >
                resize 이벤트 발생
              </button>
            </div>

            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              unmount 뒤에는 resize 이벤트를 보내도 listener가 실행되지 않아야 합니다. cleanup이 없었다면 이전 listener가 남아 중복 처리될 수 있습니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Effect trace</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              개발 StrictMode에서는 초기 setup 뒤 cleanup과 setup이 한 번 더 보일 수 있습니다.
            </p>
            <div className="mt-4">
              <EffectTimeline
                emptyMessage="Subscriber가 effect trace를 남길 준비 중입니다."
                items={timeline}
              />
            </div>
          </div>
        </div>

        {isSubscriberMounted && (
          <ResizeSubscriber
            onResize={increaseResizeCount}
            onTrace={recordTrace}
          />
        )}
      </section>

      <PracticeSummary
        points={[
          "dependency 변경과 unmount에서는 기존 Effect cleanup이 실행되어 이전 외부 연결을 정리합니다.",
          "Event Listener는 등록할 때 사용한 같은 callback을 removeEventListener에 전달해야 합니다.",
          "StrictMode의 setup → cleanup → setup 흐름은 개발 단계에서 cleanup 누락을 발견하도록 돕습니다.",
        ]}
      />
    </div>
  );
}

function ResizeSubscriber({
  onResize,
  onTrace,
}: {
  onResize: () => void;
  onTrace: (message: string, tone: TimelineTone) => void;
}) {
  useEffect(() => {
    const handleResize = () => {
      onResize();
      onTrace(
        "listener 실행: window resize를 받아 React State를 갱신했습니다.",
        "emerald",
      );
    };

    onTrace("Effect setup: window resize listener를 등록했습니다.", "emerald");
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      onTrace(
        "Cleanup: 같은 handler로 window resize listener를 제거했습니다.",
        "sky",
      );
    };
  }, [onResize, onTrace]);

  return (
    <div className="sr-only" aria-live="polite">
      resize subscriber active
    </div>
  );
}
