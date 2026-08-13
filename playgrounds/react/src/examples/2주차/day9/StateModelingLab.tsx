import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

type ClipModalState =
  | {
      status: "closed";
    }
  | {
      status: "opened";
      clipId: string;
    };

const clipIds = ["clip-react", "clip-state", "clip-event"];

export default function StateModelingLab() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ClipModalState>({
    status: "closed",
  });

  const invalidBooleanState = isOpen && selectedClipId === null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="State Model"
          title="불가능한 상태 조합 제거"
          description="분리된 boolean과 id가 모순 상태를 만들 수 있는지, union 상태가 이를 어떻게 막는지 비교합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-950">
              분리된 useState
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="isOpen" value={String(isOpen)} tone="rose" />
              <Metric
                label="selectedClipId"
                value={selectedClipId ?? "null"}
                tone="rose"
              />
            </div>
            <p className="mt-3 min-h-6 text-sm font-medium text-rose-700">
              {invalidBooleanState
                ? "모달은 열렸지만 선택된 clipId가 없습니다."
                : "현재 조합은 해석 가능합니다."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                type="button"
                onClick={() => setIsOpen(true)}
              >
                id 없이 열기
              </button>
              <button
                className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                type="button"
                onClick={() => {
                  setIsOpen(true);
                  setSelectedClipId(clipIds[0]);
                }}
              >
                선택 후 열기
              </button>
              <button
                className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedClipId(null);
                }}
              >
                닫기
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-950">
              Discriminated Union
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="status" value={modalState.status} tone="emerald" />
              <Metric
                label="clipId"
                value={modalState.status === "opened" ? modalState.clipId : "-"}
                tone="emerald"
              />
            </div>
            <p className="mt-3 min-h-6 text-sm font-medium text-emerald-700">
              열린 상태는 타입상 clipId를 반드시 가집니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {clipIds.map((clipId) => (
                <button
                  className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  key={clipId}
                  type="button"
                  onClick={() =>
                    setModalState({
                      status: "opened",
                      clipId,
                    })
                  }
                >
                  {clipId}
                </button>
              ))}
              <button
                className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                type="button"
                onClick={() => setModalState({ status: "closed" })}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </section>

      <PracticeSummary
        points={[
          "여러 State가 함께 하나의 의미를 만들면 하나의 상태 모델로 묶을 수 있습니다.",
          "boolean과 nullable id를 분리하면 의미 없는 조합이 생길 수 있습니다.",
          "Discriminated Union은 실제로 유효한 상태 조합만 표현하도록 돕습니다.",
        ]}
      />
    </div>
  );
}
