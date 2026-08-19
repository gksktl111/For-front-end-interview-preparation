import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchClips } from "./api/client";
import { INITIAL_CLIPS } from "./api/fixtures";
import type { Clip } from "./api/types";
import { Metric, PanelHeading, PracticeSummary } from "./shared";

export default function ServerStateCopyLab() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ServerStateCopyLabInner />
    </QueryClientProvider>
  );
}

function ServerStateCopyLabInner() {
  const [revision, setRevision] = useState(0);
  const [copySession, setCopySession] = useState(0);
  const query = useQuery({
    initialData: INITIAL_CLIPS,
    queryKey: ["day10-clips", revision],
    queryFn: () => fetchClips(revision),
  });
  const serverClips = query.data;
  const serverVersion = revision + 1;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Server State"
          title="query data를 Local State로 복사하면 생기는 차이"
          description="Mock API의 서버 버전을 바꾸면 query data를 직접 표시한 목록은 갱신되고, mount 시 복사한 목록은 기존 값을 유지합니다."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
            type="button"
            onClick={() => setRevision((previousRevision) => (previousRevision + 1) % 3)}
          >
            서버 데이터 다음 버전으로 갱신
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => {
              setRevision(0);
              setCopySession((previousSession) => previousSession + 1);
            }}
          >
            처음 상태로 재시작
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <QueryDataPanel
            clips={serverClips}
            isFetching={query.isFetching}
            serverVersion={serverVersion}
          />
          <CopiedStatePanel
            clips={serverClips}
            key={copySession}
            serverVersion={serverVersion}
          />
        </div>

        <button
          className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          type="button"
          onClick={() => setCopySession((previousSession) => previousSession + 1)}
        >
          현재 query data로 Local 복사본 다시 만들기
        </button>
      </section>

      <PracticeSummary
        points={[
          "단순 목록 표시라면 query.data가 Server State의 Source of Truth입니다.",
          "useState(clips)는 mount 시점의 값만 초기값으로 사용하므로 이후 query data 변경을 자동으로 반영하지 않습니다.",
          "로컬 복사본이 필요한 편집 draft라면 원본과 다른 의미, 저장 시점, 취소와 재동기화 규칙을 명확히 해야 합니다.",
        ]}
      />
    </div>
  );
}

function QueryDataPanel({
  clips,
  isFetching,
  serverVersion,
}: {
  clips: Clip[];
  isFetching: boolean;
  serverVersion: number;
}) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-950">권장: query data를 직접 표시</p>
      <p className="mt-1 text-sm leading-6 text-emerald-800">
        목록의 Source of Truth는 React Query 캐시입니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="서버 요청 버전" tone="emerald" value={"v" + serverVersion} />
        <Metric
          label="query 상태"
          tone="emerald"
          value={isFetching ? "새 응답 요청 중" : "응답 반영됨"}
        />
      </div>

      <ClipList clips={clips} />
    </section>
  );
}

function CopiedStatePanel({
  clips,
  serverVersion,
}: {
  clips: Clip[];
  serverVersion: number;
}) {
  const [localClips] = useState(clips);
  const [copiedAtVersion] = useState(serverVersion);

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-950">주의: query data를 Local State로 복사</p>
      <p className="mt-1 text-sm leading-6 text-rose-800">
        이 Local State는 mount 때만 query data를 복사했고 이후 서버 갱신을 구독하지 않습니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="현재 서버 요청 버전" tone="rose" value={"v" + serverVersion} />
        <Metric label="Local 복사 시점" tone="rose" value={"v" + copiedAtVersion} />
      </div>

      <ClipList clips={localClips} />
    </section>
  );
}

function ClipList({ clips }: { clips: Clip[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {clips.map((clip) => (
        <li
          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
          key={clip.id}
        >
          <span className="text-sm font-medium text-slate-800">{clip.title}</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {clip.updatedAt}
          </span>
        </li>
      ))}
    </ul>
  );
}
