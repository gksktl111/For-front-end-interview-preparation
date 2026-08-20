import { useState } from "react";
import { Metric, PanelHeading, PracticeSummary, StatePill } from "./shared";

type Clip = {
  id: string;
  title: string;
  topic: string;
};

const initialClips: Clip[] = [
  {
    id: "render",
    title: "React Rendering Model",
    topic: "render",
  },
  {
    id: "state",
    title: "State Ownership",
    topic: "state",
  },
  {
    id: "effect",
    title: "Effect Synchronization",
    topic: "effect",
  },
  {
    id: "composition",
    title: "Composition",
    topic: "design",
  },
];

type UseClipSelectionResult = {
  enterDeleteMode: () => void;
  exitDeleteMode: () => void;
  isDeleteMode: boolean;
  selectedIds: string[];
  toggleSelected: (clipId: string) => void;
};

function useClipSelection(): UseClipSelectionResult {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  function toggleSelected(clipId: string) {
    setSelectedIds((previous) =>
      previous.includes(clipId)
        ? previous.filter((selectedId) => selectedId !== clipId)
        : [...previous, clipId],
    );
  }

  function enterDeleteMode() {
    setIsDeleteMode(true);
  }

  function exitDeleteMode() {
    setSelectedIds([]);
    setIsDeleteMode(false);
  }

  return {
    enterDeleteMode,
    exitDeleteMode,
    isDeleteMode,
    selectedIds,
    toggleSelected,
  };
}

export default function CustomHookSelectionLab() {
  const selection = useClipSelection();
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const clips = initialClips.filter((clip) => !deletedIds.includes(clip.id));
  const hasSelection = selection.selectedIds.length > 0;
  const canDelete = selection.isDeleteMode && hasSelection;

  function deleteSelected() {
    if (!canDelete) {
      return;
    }

    setDeletedIds((previous) => [...previous, ...selection.selectedIds]);
    selection.exitDeleteMode();
  }

  function reset() {
    setDeletedIds([]);
    selection.exitDeleteMode();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Custom Hook"
          title="선택 상태 전이를 UI에서 분리하기"
          description="삭제 모드 진입, 선택 토글, 종료 규칙을 useClipSelection이 맡고 화면은 그 계약을 사용합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  ClipPageView
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  UI는 Hook이 제공한 상태와 의도 있는 동작만 사용합니다.
                </p>
              </div>
              <StatePill tone={selection.isDeleteMode ? "rose" : "emerald"}>
                {selection.isDeleteMode ? "삭제 모드" : "일반 모드"}
              </StatePill>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {selection.isDeleteMode ? (
                <button
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  type="button"
                  onClick={selection.exitDeleteMode}
                >
                  삭제 모드 종료
                </button>
              ) : (
                <button
                  className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  type="button"
                  onClick={selection.enterDeleteMode}
                >
                  삭제 모드 시작
                </button>
              )}
              <button
                className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canDelete}
                type="button"
                onClick={deleteSelected}
              >
                선택한 {selection.selectedIds.length}개 삭제
              </button>
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={reset}
              >
                목록 초기화
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {clips.map((clip) => {
                const isSelected = selection.selectedIds.includes(clip.id);

                return (
                  <li key={clip.id}>
                    <button
                      aria-pressed={isSelected}
                      className={
                        isSelected
                          ? "flex w-full items-center justify-between rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-3 text-left"
                          : "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      }
                      disabled={!selection.isDeleteMode}
                      type="button"
                      onClick={() => selection.toggleSelected(clip.id)}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {clip.title}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {clip.topic}
                        </span>
                      </span>
                      <StatePill tone={isSelected ? "rose" : "default"}>
                        {isSelected ? "선택됨" : "선택"}
                      </StatePill>
                    </button>
                  </li>
                );
              })}
            </ul>

            {clips.length === 0 && (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                모든 클립을 삭제했습니다. 목록 초기화로 다시 시작할 수 있습니다.
              </p>
            )}
          </article>

          <aside className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-sm font-semibold text-sky-950">
              useClipSelection 계약
            </p>
            <p className="mt-1 text-sm leading-6 text-sky-800">
              선택 상태와 상태 전이 규칙이 한 위치에 모입니다.
            </p>

            <div className="mt-4 grid gap-3">
              <Metric
                label="isDeleteMode"
                tone="sky"
                value={String(selection.isDeleteMode)}
              />
              <Metric
                label="selectedIds"
                tone="sky"
                value={
                  selection.selectedIds.length === 0
                    ? "없음"
                    : selection.selectedIds.join(", ")
                }
              />
              <Metric
                label="UI가 계산한 canDelete"
                tone={canDelete ? "emerald" : "default"}
                value={String(canDelete)}
              />
            </div>

            <div className="mt-4 rounded-xl border border-sky-200 bg-white p-3 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-sky-950">Hook이 맡는 것</p>
              <p className="mt-1">
                enterDeleteMode, toggleSelected, exitDeleteMode라는 상태 전이
              </p>
              <p className="mt-3 font-semibold text-sky-950">페이지가 맡는 것</p>
              <p className="mt-1">
                삭제 요청을 시작하고, 어떤 UI를 보여 줄지 결정하는 일
              </p>
            </div>
          </aside>
        </div>
      </section>

      <PracticeSummary
        points={[
          "Custom Hook은 selectedIds와 삭제 모드의 전이 규칙을 UI에서 분리하지만, 화면 배치와 실제 삭제 요청까지 모두 숨기지 않습니다.",
          "Hook 반환값은 isDeleteMode, selectedIds, enter, exit, toggle처럼 예측 가능한 계약을 유지합니다.",
          "반환값이 selection, pagination, query, modal, permission, form을 모두 포함하기 시작하면 Hook의 책임이 너무 넓어졌는지 점검합니다.",
        ]}
      />
    </div>
  );
}
