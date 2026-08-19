# Day 10 빠른 개념 복습

## 오늘의 한 문장

> React의 좋은 상태 설계는 State를 어디서든 접근 가능하게 만드는 일이 아니라, 하나의 명확한 Source of Truth를 가장 적절한 Owner에 두고 Props와 이벤트로 예측 가능한 단방향 데이터 흐름을 만드는 일이다.

## 학습 목표

- 특정 State의 적절한 Owner를 판단한다.
- 여러 컴포넌트가 같은 데이터를 써야 할 때 필요한 만큼만 State를 끌어올린다.
- Props, Lifting State Up, Composition, Context의 역할과 선택 기준을 구분한다.
- Local State, Shared Client State, Server State를 같은 방식으로 다루지 않는다.

## 10분 복습 순서

1. State를 쓰는 컴포넌트들의 가장 가까운 공통 조상을 찾는다.
2. 같은 의미의 값이 Props, Local State, 서버 캐시에 중복되어 있지 않은지 확인한다.
3. 형제 컴포넌트가 함께 써야 할 값은 공통 부모가 소유하고 Props와 callback으로 연결한다.
4. Props 전달 단계가 몇 개인지보다 중간 컴포넌트가 그 데이터를 실제로 알아야 하는지 본다.
5. Composition으로 충분한지, 특정 Subtree 전체에 Context가 필요한지 판단한다.
6. 서버에서 온 데이터는 서버 State 도구의 캐시를 Source of Truth로 유지할 수 있는지 확인한다.

## 상세 문서와 실습

- [State Ownership](./01-state-ownership.md)
- [Single Source of Truth](./02-single-source-of-truth.md)
- [Lifting State Up과 단방향 데이터 흐름](./03-lifting-state-up-one-way-data-flow.md)
- [Props Drilling과 Composition](./04-props-drilling-composition.md)
- [Context와 상태 종류](./05-context-and-state-types.md)
- [프로젝트 연결 분석](./06-project-connection.md)
- [Interview Practice](./07-interview.md)

React playground:

- /week2/day10/state-ownership
- /week2/day10/single-source-of-truth
- /week2/day10/lifting-state-up
- /week2/day10/props-composition
- /week2/day10/context-scope
- /week2/day10/server-state-copy

~~~bash
cd playgrounds/react
npm run dev
~~~

## 핵심 개념 압축

| 개념 | 빠른 정의 | 면접에서 꼭 붙일 말 |
| --- | --- | --- |
| State Ownership | State를 생성하고 변경 규칙을 결정하는 컴포넌트의 책임 | 사용하는 컴포넌트들의 가장 가까운 공통 조상이 우선 후보지만, 무조건 최상위는 아니다. |
| Single Source of Truth | 같은 의미의 데이터에 하나의 권위 있는 값만 두는 원칙 | 값이 두 개면 동기화 책임과 불일치 가능성이 생긴다. |
| Lifting State Up | 공유가 필요한 Local State를 공통 부모로 옮기는 패턴 | 부모는 State와 callback을 내려주고, 자식은 Props와 이벤트로 상호작용한다. |
| One-Way Data Flow | State는 부모에서 자식으로 Props를 통해 흐르고, 변경 요청은 callback으로 위로 전달되는 흐름 | 자식은 부모 State를 직접 바꾸지 않는다. |
| Props Drilling | 중간 컴포넌트가 사용하지 않는 Props를 전달만 하는 구조 | 몇 단계의 명시적 Props 전달은 문제일 필요가 없으며, 깊이와 변경 비용을 함께 본다. |
| Composition | 필요한 UI 또는 slot을 중간 컴포넌트에 주입하는 방식 | 중간 계층이 데이터 자체를 알 필요 없게 만들 수 있다. |
| Context | 깊은 하위 트리에 공통 값을 전달하는 React 기능 | Context는 전역 상태 관리와 동의어가 아니며 Provider 범위와 변경 빈도를 고려한다. |
| Server State | 서버가 권위 있는 원본을 가진 데이터 | React Query 등의 캐시 값을 Local State로 불필요하게 복제하지 않는다. |

## 코드로 바로 설명하기

### 1. SearchInput 하나만 쓰는 값은 Local State

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

- keyword를 SearchInput만 사용하면 이 위치가 가장 작은 Owner다.
- 단지 나중에 공유할 가능성이 있다는 이유로 부모나 Context에 올릴 필요는 없다.

### 2. 형제가 함께 쓰면 공통 부모가 Source of Truth

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
~~~

~~~text
SearchPage State
    ↓ Props
SearchInput / SearchResult
    ↑ Event callback
SearchPage State update
~~~

- 검색어를 입력하는 쪽과 결과를 표시하는 쪽이 같은 값을 본다.
- App까지 올릴 이유는 없다. SearchPage가 두 컴포넌트의 가장 가까운 공통 조상이기 때문이다.

### 3. Props를 다시 Local State로 복사하지 않기

~~~tsx
function UserProfile({ user }: { user: User }) {
  const [selectedUser, setSelectedUser] = useState(user);
  // user와 selectedUser가 같은 의미라면 두 Source of Truth가 된다.
}
~~~

~~~tsx
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
~~~

- Props 변경은 Local State를 자동으로 덮어쓰지 않는다.
- 단, 편집 중인 임시 입력값처럼 원본과 다른 의미의 draft가 필요하다면 별도 Local State가 가능하다. 이때 저장, 취소, 재초기화 규칙을 명확히 정한다.

### 4. 서버 데이터는 서버 캐시를 그대로 쓰기

~~~tsx
const { data: clips = [] } = useClips();

return <ClipList clips={clips} />;
~~~

~~~tsx
const { data: clips = [] } = useClips();
const [localClips, setLocalClips] = useState(clips);
~~~

- 두 번째 코드는 query 결과와 Local State가 서로 달라질 수 있다.
- 정렬, 선택, 입력 draft처럼 별도 의미가 없으면 query 결과를 그대로 렌더링한다.

## 상태 Owner 판단 순서

~~~text
이 값은 Props나 다른 State에서 항상 계산 가능한가?
↓ Yes
State로 저장하지 말고 계산한다.

↓ No
누가 이 값을 사용하는가?
↓
하나의 컴포넌트
→ 그 컴포넌트의 Local State 후보

여러 형제 또는 가까운 Subtree
→ 가장 가까운 공통 조상으로 Lifting State Up 후보

깊은 여러 위치의 공통 인프라 값
→ Composition을 먼저 검토하고, 필요하면 Context 후보

서버가 권위 있는 원본
→ Server State 캐시 또는 도구의 데이터 후보
~~~

## 헷갈리기 쉬운 표현 교정

| 부정확한 표현 | 더 정확한 표현 |
| --- | --- |
| State는 App에 하나로 모아야 한다. | State는 실제 사용 범위를 만족하는 가장 작은 Owner에 둔다. |
| Props Drilling은 무조건 나쁘다. | 사용하지 않는 중간 전달이 깊고 자주 바뀌면 비용이 커질 수 있다. 몇 단계의 Props는 명시적이고 읽기 쉽다. |
| Context는 전역 상태 관리다. | Context는 트리 아래에 값을 전달하는 기능이다. 상태의 범위와 갱신 빈도까지 설계해야 한다. |
| Context를 쓰면 리렌더링 문제가 해결된다. | Provider value가 바뀌면 해당 Context Consumer가 리렌더링 대상이 된다. |
| 서버 데이터를 useState로 복사하면 안전하다. | 복제본은 서버 캐시 갱신과 별개로 남을 수 있으므로 의미와 동기화 전략이 필요하다. |
| Props를 State로 초기화하면 계속 동기화된다. | useState의 초기값은 처음 마운트할 때만 사용된다. |

## 프로젝트 점검 질문

새 State 또는 Context를 만들기 전에 아래 질문에 답한다.

~~~text
이 데이터는 누가 생성하는가?
↓
누가 읽고 변경하는가?
↓
몇 개의 컴포넌트가 사용하는가?
↓
가장 가까운 공통 조상은 어디인가?
↓
Local State로 충분한가?
↓
Composition으로 중간 의존성을 없앨 수 있는가?
↓
Context 또는 Store가 정말 필요한가?
↓
서버 캐시에 이미 같은 데이터가 있는가?
~~~

## 완료 체크

- [ ] 특정 State의 적절한 Owner를 판단할 수 있다.
- [ ] Local State를 유지할지 공통 부모로 올릴지 판단할 수 있다.
- [ ] Lifting State Up과 단방향 데이터 흐름을 설명할 수 있다.
- [ ] 하나의 데이터에 하나의 Source of Truth가 필요한 이유를 설명할 수 있다.
- [ ] Props Drilling이 문제인 경우와 아닌 경우를 구분할 수 있다.
- [ ] Composition으로 중간 컴포넌트의 불필요한 의존성을 없앨 수 있다.
- [ ] Context의 역할, Provider 범위, 리렌더링 영향을 설명할 수 있다.
- [ ] Local State, Shared Client State, Server State를 구분할 수 있다.
- [ ] 프로젝트 코드에서 State Ownership 또는 데이터 흐름 사례를 하나 분석할 수 있다.
