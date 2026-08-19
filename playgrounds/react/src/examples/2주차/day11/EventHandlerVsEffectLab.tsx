import { useCallback, useEffect, useRef, useState } from "react";
import {
  EffectTimeline,
  Metric,
  PanelHeading,
  PracticeSummary,
} from "./shared";
import type { TimelineItem, TimelineTone } from "./shared";

export default function EventHandlerVsEffectLab() {
  const [shouldDelete, setShouldDelete] = useState(false);
  const [effectDeleteCount, setEffectDeleteCount] = useState(0);
  const [handlerDeleteCount, setHandlerDeleteCount] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const logSequence = useRef(0);

  const appendLog = useCallback((message: string, tone: TimelineTone) => {
    setTimeline((previous) =>
      [...previous, { id: ++logSequence.current, message, tone }].slice(-8),
    );
  }, []);

  useEffect(() => {
    if (!shouldDelete) {
      return;
    }

    appendLog(
      "Effect 실행: shouldDelete를 읽고 이제서야 deleteClip()을 호출합니다.",
      "rose",
    );
    setEffectDeleteCount((previous) => previous + 1);
    setShouldDelete(false);
  }, [appendLog, shouldDelete]);

  const requestDeleteThroughEffect = () => {
    appendLog(
      "클릭: shouldDelete = true → Render 뒤 Effect가 삭제를 처리합니다.",
      "rose",
    );
    setShouldDelete(true);
  };

  const deleteFromEventHandler = () => {
    appendLog(
      "클릭: Event Handler가 즉시 deleteClip()을 호출합니다.",
      "emerald",
    );
    setHandlerDeleteCount((previous) => previous + 1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Cause and effect"
          title="삭제의 원인은 클릭인가, 렌더링 상태인가?"
          description="같은 삭제 작업을 flag State를 감시하는 Effect와 버튼 Event Handler로 각각 실행합니다. 실행 흐름이 어떤 구조가 더 직접적인지 비교해 보세요."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-950">
              우회 구조: flag State + Effect
            </p>
            <p className="mt-1 text-sm leading-6 text-rose-800">
              클릭 → shouldDelete 변경 → Render → Effect → 삭제 요청 흐름입니다.
            </p>
            <div className="mt-4">
              <Metric
                label="Effect로 처리한 삭제"
                tone="rose"
                value={effectDeleteCount + "회"}
              />
            </div>
            <button
              className="mt-4 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              type="button"
              onClick={requestDeleteThroughEffect}
            >
              shouldDelete 설정
            </button>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              권장: Event Handler
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              클릭이 원인이므로 handler가 삭제 요청을 바로 시작합니다.
            </p>
            <div className="mt-4">
              <Metric
                label="Handler로 처리한 삭제"
                tone="emerald"
                value={handlerDeleteCount + "회"}
              />
            </div>
            <button
              className="mt-4 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              type="button"
              onClick={deleteFromEventHandler}
            >
              바로 삭제 요청
            </button>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-950">실행 흐름</h2>
            <p className="mt-1 text-sm text-slate-600">
              버튼을 눌러 두 흐름의 차이를 확인합니다.
            </p>
          </div>
          <button
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => setTimeline([])}
          >
            로그 지우기
          </button>
        </div>
        <div className="mt-4">
          <EffectTimeline
            emptyMessage="아직 실행한 작업이 없습니다."
            items={timeline}
          />
        </div>
      </section>

      <PracticeSummary
        points={[
          "특정 사용자 행동 때문에 실행되는 삭제, 구매, 제출은 Event Handler에서 시작하는 것이 자연스럽습니다.",
          "flag State를 만든 뒤 Effect가 감시하게 하면 원인과 결과가 멀어지고 Render 한 번을 경유하게 됩니다.",
          "Effect는 컴포넌트 존재 또는 reactive 값 변화에 맞춰 외부 시스템을 유지해야 할 때 사용합니다.",
        ]}
      />
    </div>
  );
}
