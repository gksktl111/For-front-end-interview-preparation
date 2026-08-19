# State Ownership

## State를 만들기 전에 먼저 할 질문

State 설계에서 가장 먼저 판단할 것은 아래 질문이다.

> 이 상태를 누가 소유해야 하는가?

Owner는 단순히 useState를 선언한 컴포넌트가 아니다. 해당 값의 생성, 변경 규칙, 일관성을 책임지는 위치다.

## 가장 가까운 공통 조상 규칙

State를 읽거나 변경해야 하는 컴포넌트가 여러 개라면, 그 컴포넌트들의 가장 가까운 공통 조상이 Owner 후보가 된다.

~~~text
SearchPage
├─ SearchInput
└─ SearchResult
~~~

SearchInput과 SearchResult가 같은 keyword를 써야 한다면 SearchPage가 후보다.

~~~tsx
function SearchPage() {
  const [keyword, setKeyword] = useState("");

  return (
    <>
      <SearchInput keyword={keyword} onKeywordChange={setKeyword} />
      <SearchResult keyword={keyword} />
    </>
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
    <input
      value={keyword}
      onChange={(event) => onKeywordChange(event.target.value)}
    />
  );
}
~~~

핵심은 가장 가까운 공통 조상이다. 모든 State를 App이나 전역 Store에 두라는 뜻이 아니다.

## Local State로 충분한 경우

아래 값은 해당 컴포넌트 밖에서 읽거나 변경할 이유가 없다면 Local State가 자연스럽다.

- 입력창의 일시적인 입력 상태
- tooltip, dropdown, modal의 열림 상태
- hover, focus 같은 UI 상호작용 상태
- 하나의 Row 안에서만 쓰는 펼침 상태

~~~tsx
function SearchInput() {
  const [keyword, setKeyword] = useState("");

  return (
    <input
      value={keyword}
      onChange={(event) => setKeyword(event.target.value)}
    />
  );
}
~~~

검색 결과나 URL, 다른 필터가 keyword를 필요로 하지 않는다면 이것이 과도하게 좁은 설계가 아니다. 가장 작고 응집도 높은 Owner다.

## Owner를 올려야 하는 신호

다음 중 하나라면 Local State만으로는 부족할 수 있다.

| 신호 | 설계 후보 |
| --- | --- |
| 형제 컴포넌트가 같은 값을 읽는다. | 공통 부모로 Lifting State Up |
| 한 컴포넌트의 이벤트가 다른 컴포넌트 UI를 바꾼다. | 공통 부모에서 상태와 callback 관리 |
| 깊은 여러 위치가 같은 인프라 정보를 쓴다. | Composition 또는 Context 검토 |
| 서버 응답이 원본이다. | Server State 캐시 사용 |

## 지나친 Lifting State Up의 문제

공통 부모보다 더 높은 곳으로 State를 올리면 다음 비용이 생길 수 있다.

- 관련 없는 화면까지 State의 존재를 알아야 한다.
- Props 전달 경로가 길어진다.
- 상위 컴포넌트가 여러 도메인의 변경 규칙을 떠안는다.
- UI의 응집도가 낮아지고 변경 영향 범위가 넓어진다.

예를 들어 SearchPage 안에서만 사용하는 검색어를 App에 두면, App은 검색 기능의 내부 UI State까지 알아야 한다. 재사용 가능한 SearchPage를 만들기도 어려워진다.

## Owner 판단 예시

| 상태 | 주로 쓰는 위치 | 적절한 Owner 후보 |
| --- | --- | --- |
| 한 개 Dropdown의 열림 | Dropdown | Dropdown Local State |
| 검색 입력과 검색 결과의 keyword | SearchInput, SearchResult | SearchPage |
| 워크스페이스 선택값 | 여러 페이지의 깊은 하위 컴포넌트 | 페이지 또는 라우트 경계, Workspace Context |
| 로그인 세션 | 앱 전반의 인증 필요 UI | Auth Provider 또는 인증 도구 |
| 클립 목록 | API를 통해 가져온 여러 화면의 데이터 | React Query 등 Server State 캐시 |

## 실습에서 확인할 것

/week2/day10/state-ownership에서 왼쪽과 오른쪽 검색 화면을 비교한다.

- 왼쪽: SearchInput이 keyword를 소유하므로 형제 SearchResult는 검색어를 모른다.
- 오른쪽: SearchPage가 keyword를 소유하므로 입력과 결과가 같은 값을 본다.
- 오른쪽 State를 App으로 더 올렸을 때 실제로 새로 이득을 보는 컴포넌트가 있는지 질문한다.

## 기억할 문장

> State는 가장 넓은 곳이 아니라, 실제 사용 범위를 만족하는 가장 작은 곳에 둔다.
