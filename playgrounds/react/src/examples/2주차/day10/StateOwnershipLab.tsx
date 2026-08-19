import { useState } from "react";
import { ClipRows, Metric, PanelHeading, PracticeSummary } from "./shared";

const clips = [
  "React State Ownership",
  "Lifting State Up",
  "Composition과 Context",
  "Server State 캐시",
];

export default function StateOwnershipLab() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="State Ownership"
          title="검색어는 누가 소유해야 할까?"
          description="SearchInput과 SearchResult가 같은 keyword를 써야 하는 상황을 두 구조로 비교합니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <InputOwnsKeyword />
          <SearchPageOwnsKeyword />
        </div>
      </section>

      <PracticeSummary
        points={[
          "SearchInput 하나만 keyword를 사용한다면 Input Local State가 가장 작은 Owner입니다.",
          "입력값과 결과가 함께 keyword를 써야 한다면 두 컴포넌트의 가장 가까운 공통 조상인 SearchPage가 Owner 후보입니다.",
          "공유가 필요하다고 해서 App이나 Context로 바로 올리지 않습니다. 새로 이 값을 쓰는 범위까지만 올립니다.",
        ]}
      />
    </div>
  );
}

function InputOwnsKeyword() {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-950">
        SearchInput이 Local State를 소유
      </p>
      <p className="mt-1 text-sm leading-6 text-rose-800">
        입력은 바뀌지만 형제 SearchResult에 keyword를 전달할 Owner가 없습니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="Source of Truth" tone="rose" value="SearchInput" />
        <Metric label="SearchResult가 아는 keyword" tone="rose" value="없음" />
      </div>

      <div className="mt-4 rounded-xl border border-rose-200 bg-white p-3">
        <InputWithLocalKeyword />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-rose-700">
          SearchResult
        </p>
        <ClipRows clips={clips} emptyMessage="검색 결과가 없습니다." />
      </div>
    </section>
  );
}

function InputWithLocalKeyword() {
  const [keyword, setKeyword] = useState("");

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">SearchInput keyword</span>
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        placeholder="예: context"
        type="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <span className="mt-2 block text-xs text-slate-500">
        Input 내부 State: {keyword || "빈 문자열"}
      </span>
    </label>
  );
}

function SearchPageOwnsKeyword() {
  const [keyword, setKeyword] = useState("");
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredClips = clips.filter((clip) =>
    clip.toLowerCase().includes(normalizedKeyword),
  );

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-semibold text-emerald-950">
        SearchPage가 공유 State를 소유
      </p>
      <p className="mt-1 text-sm leading-6 text-emerald-800">
        공통 부모가 keyword를 한 번만 관리하고 두 자식에 Props로 내려줍니다.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="Source of Truth" tone="emerald" value="SearchPage" />
        <Metric
          label="공유 keyword"
          tone="emerald"
          value={keyword || "빈 문자열"}
        />
      </div>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3">
        <SearchInput keyword={keyword} onKeywordChange={setKeyword} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
          SearchResult keyword: {keyword || "빈 문자열"}
        </p>
        <ClipRows
          clips={filteredClips}
          emptyMessage="이 keyword와 일치하는 결과가 없습니다."
        />
      </div>
    </section>
  );
}

function SearchInput({
  keyword,
  onKeywordChange,
}: {
  keyword: string;
  onKeywordChange: (nextKeyword: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">SearchInput keyword</span>
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        placeholder="예: context"
        type="search"
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
      />
      <span className="mt-2 block text-xs text-slate-500">
        이벤트는 callback으로 SearchPage에 전달됩니다.
      </span>
    </label>
  );
}
