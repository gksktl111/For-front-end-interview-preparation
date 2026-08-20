# 프로젝트 연결 분석

## 분석 목적

Day 12에서는 “파일이 큰가?”가 아니라 “이 코드의 책임과 변경 이유를 한 문장으로 설명할 수 있는가?”를 기준으로 프로젝트를 읽는다. 이 저장소는 학습용 React playground이므로, 일부 비교 코드는 의도적으로 좋지 않은 구조를 재현한다. 실습 목적의 비교 코드와 실제 개선 후보를 구분한다.

## 탐색 명령

~~~bash
rg -n "function use[A-Z]|const use[A-Z]|useState|useQuery|useMutation" playgrounds/react/src
rg -n "isPending|isLoading|error|\\? .*:|&&" playgrounds/react/src --glob "*.tsx"
rg -n "children|ReactNode|sidebar|header|footer" playgrounds/react/src --glob "*.tsx"
rg -n "if \\(!.*\\).*return|\\.map\\(.*use[A-Z]" playgrounds/react/src --glob "*.tsx"
rg -n "selectedIds|isDeleteMode|isOpen|permission|role" playgrounds/react/src --glob "*.tsx"
~~~

## 코드를 읽는 순서

~~~text
이 컴포넌트 또는 Hook의 역할을 한 문장으로 설명할 수 있는가?
↓
State, 서버 데이터, UI, 권한, modal, selection이 함께 있어 서로 다른 변경 이유가 있는가?
↓
독립적인 UI 경계가 있는가?
→ 컴포넌트 분리 후보

독립적인 상태 전이나 외부 연동이 있는가?
→ Custom Hook 또는 순수 함수 후보

중간 컴포넌트가 Props를 전달만 하는가?
→ Composition, 필요하면 Context 후보

조건부 JSX와 boolean 식의 의미가 읽히는가?
→ 결과 컴포넌트와 이름 있는 조건 후보
~~~

## 이 저장소에서 확인한 사례

### 1. App은 현재 라우트 조정자이며, 확장 시 경계를 점검할 후보

파일:

- playgrounds/react/src/App.tsx

관찰:

~~~tsx
const [currentPath, setCurrentPath] = useState(getCurrentPath);

useEffect(() => {
  const handlePopState = () => {
    setCurrentPath(getCurrentPath());
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

const activeRoute = useMemo(() => resolveRoute(currentPath), [currentPath]);
~~~

현재 역할은 “브라우저 history의 경로를 읽고, 활성화된 학습 화면을 조합한다”라고 한 문장으로 설명할 수 있다. popstate listener도 외부 브라우저 시스템을 동기화하므로 적절한 Effect이며 cleanup이 있다. LandingPage, WeekPage, DayPage, PracticePage도 화면 역할별 함수로 이미 나뉘어 있다.

다만 이 파일은 경로 해석, navigation, 공통 frame, 카드 UI, 각 화면 분기를 함께 보유한다. 현재 규모에서는 한 파일에서 흐름을 읽는 장점이 더 크므로 즉시 분리할 문제라고 단정하지 않는다. 아래 신호가 생기면 분리를 검토한다.

- route 전환 정책이나 history 처리 방식이 자주 바뀐다.
- Landing, Week, Day 화면의 UI가 독립적으로 커진다.
- 권한, progress, 검색, analytics 같은 화면 외 책임이 App에 추가된다.

개선 방향은 모든 것을 반환하는 useApp Hook을 만드는 것이 아니다. 경로 해석은 순수 route 모듈, 활성 화면 선택은 RouterView, 각 목록 UI는 페이지 컴포넌트처럼 변경 이유별 경계를 만드는 것이다.

### 2. PropsCompositionLab은 Composition의 의도적인 비교 사례

파일:

- playgrounds/react/src/examples/2주차/day10/PropsCompositionLab.tsx

관찰:

~~~tsx
function CompositionTree({ user }: { user: User }) {
  return (
    <section>
      <CompositionLayout sidebar={<UserProfile user={user} />} />
    </section>
  );
}

function CompositionLayout({ sidebar }: { sidebar: ReactNode }) {
  return <TreeNode name="Layout">{sidebar}</TreeNode>;
}
~~~

분석:

- Layout은 sidebar라는 UI 영역을 배치하고, UserProfile만 user를 사용한다.
- user를 전달만 하던 중간 계층의 도메인 의존성을 slot으로 없앤다.
- 같은 파일 안의 Props Drilling 트리는 학습을 위한 비교 대상이다. 실제로 나쁜 코드를 발견했다는 뜻이 아니다.

### 3. useRenderCount는 작지만 한 문장으로 설명되는 Hook

파일:

- playgrounds/react/src/examples/2주차/day10/ContextScopeLab.tsx

관찰:

~~~tsx
function useRenderCount() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return renderCount.current;
}
~~~

분석:

- 역할은 “해당 컴포넌트의 render 횟수를 관찰용으로 제공한다”이다.
- useRef와 증가 규칙이 한 목적에 응집되어 있고 반환값도 number 하나로 안정적이다.
- selection, context, page state까지 함께 반환하지 않으므로 과도한 Hook이 아니다.

### 4. EffectSynchronizationLab의 작은 UI·상태 혼합은 의도적이다

파일:

- playgrounds/react/src/examples/2주차/day11/EffectSynchronizationLab.tsx

관찰:

~~~tsx
const [count, setCount] = useState(0);
const [price, setPrice] = useState(12000);
const [quantity, setQuantity] = useState(2);
const total = price * quantity;
~~~

분석:

- 이 실습의 역할은 Effect가 필요한 외부 동기화와 렌더링 중 계산할 파생 값을 한 화면에서 비교하는 것이다.
- count, price, quantity를 각각 Hook으로 감추면 비교가 멀어져 학습 목적의 응집도가 떨어질 수 있다.
- 따라서 State가 여러 개라는 이유만으로 분리하지 않는 긍정 사례다.

## 개선 후보를 기록하는 템플릿

실제 기능 코드에서 다음 양식을 채운다.

~~~text
파일:
→

컴포넌트 또는 Hook의 현재 역할:
→

State·데이터·UI 의존성:
→

서로 다른 변경 이유:
→

현재 구조의 장점:
→

위험 신호 또는 개선 가능성:
→

검토한 경계:
→ 컴포넌트 / Custom Hook / 순수 함수 / Composition / Context / 유지

State Owner:
→

결론과 적용하지 않는 이유:
→
~~~

## 발견하면 점검할 위험 신호

| 패턴 | 확인할 질문 | 우선 검토할 대안 |
| --- | --- | --- |
| 하나의 페이지가 query, mutation, modal, selection, form, permission을 모두 처리 | 각 항목이 같은 이유로 바뀌는가? | 결과 컴포넌트, dialog, form, 목적별 Hook |
| usePage Hook이 많은 State와 함수를 반환 | 한 문장으로 역할을 말할 수 있는가? | useSelection, usePagination, 순수 permission 함수 |
| Hook 반환 타입이 조건마다 다름 | 호출자가 매번 반환 형태를 방어해야 하는가? | 안정적인 객체 또는 값 계약 |
| Hook이 if, loop, handler 안에 있음 | 렌더마다 순서가 바뀔 수 있는가? | 최상위 호출, 내부 enabled 또는 조건 |
| 긴 Props 전달 체인 | 중간 컴포넌트가 값을 실제로 쓰는가? | children 또는 named slot Composition |
| Context를 곧바로 추가 | 필요한 UI를 상위에서 조합할 수 있는가? | Composition 먼저, Provider 범위 축소 |
| 중첩 삼항과 긴 boolean 식 | 상태 우선순위와 도메인 의미가 보이는가? | Results 컴포넌트, is/has/can 변수, 순수 함수 |
| 아주 작은 파일이 지나치게 많음 | 이름이 책임을 설명하는가, HTML만 분산했는가? | 가까운 문맥으로 다시 합치기 |

## 제출할 분석 과제

프로젝트에서 컴포넌트 또는 Hook 하나를 골라 다음을 설명한다.

1. 역할을 한 문장으로 쓴다.
2. State, 데이터 요청, mutation, modal, selection, 권한, UI 중 무엇을 다루는지 표시한다.
3. 서로 다른 변경 이유가 두 개 이상인지 판단한다.
4. 분리한다면 컴포넌트, Custom Hook, 순수 함수, Composition 중 무엇이 맞는지 이유를 쓴다.
5. 분리하지 않는다면 현재 응집도가 더 좋은 이유를 쓴다.

## 기억할 기준

> 코드에서 큰 컴포넌트나 많은 Hook을 발견했다고 바로 쪼개지 않는다. 먼저 역할, 변경 이유, State Owner, 의존성 흐름을 확인한 뒤 가장 작은 유효 경계를 선택한다.
