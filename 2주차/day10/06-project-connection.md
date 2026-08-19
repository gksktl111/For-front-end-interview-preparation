# 프로젝트 연결 분석

## 분석 목적

Day 10에서는 State가 누구의 책임인지, 같은 의미의 값이 중복되어 있지 않은지, 데이터 전달 구조가 필요 이상으로 넓지 않은지 확인한다.

## 탐색 명령

~~~bash
rg -n "useState|createContext|useContext|useQuery|useMutation" playgrounds/react/src
rg -n "useState\\([^)]*(data|user|clips|props)" playgrounds/react/src
rg -n "Provider|value=" playgrounds/react/src
~~~

## 점검 순서

~~~text
이 데이터는 누가 생성하는가?
↓
누가 읽고 변경하는가?
↓
동일한 의미의 State 또는 Props 복사본이 있는가?
↓
가장 가까운 공통 조상은 어디인가?
↓
Local State, 부모 State, Composition, Context, Server State 중 무엇이 적절한가?
~~~

## 이 저장소에서 확인한 사례

### 1. 의도적으로 중복 State를 재현한 Day 9 실습

파일:

- playgrounds/react/src/examples/2주차/day9/DerivedStateLab.tsx

관찰:

~~~tsx
const [price, setPrice] = useState(12000);
const [quantity, setQuantity] = useState(2);
const [storedTotalPrice, setStoredTotalPrice] = useState(24000);

const derivedTotalPrice = price * quantity;
~~~

이 파일은 학습 목적으로 storedTotalPrice와 derivedTotalPrice를 함께 두고, price만 변경했을 때 불일치를 화면에 보여 준다.

분석:

- price와 quantity가 원천 State다.
- totalPrice는 두 값에서 계산할 수 있는 파생 값이다.
- 실제 제품 코드에서 storedTotalPrice까지 같은 의미로 유지하면, 갱신을 빠뜨렸을 때 화면이 어긋난다.

개선 방향:

~~~tsx
const totalPrice = price * quantity;
~~~

학습 코드에서는 의도된 비교이므로 수정 대상이 아니다. 실제 기능 코드에서 같은 패턴을 발견하면 파생 값으로 바꾸는 후보가 된다.

### 2. Query 결과를 직접 사용하는 Day 2 실습

파일:

- playgrounds/react/src/examples/1주차/day2/TanStackQueryRaceConditionSolutions.tsx

관찰:

~~~tsx
const query = useQuery({
  queryKey: currentQueryKey,
  queryFn: ...,
});

const displayedResult = query.data ?? initialResult;
~~~

분석:

- query.data가 Server State의 Source of Truth다.
- 화면용 displayedResult는 별도 useState가 아니라 fallback을 포함한 렌더링 값이다.
- 서버 응답을 result Local State로 복사하지 않아 캐시와 화면 사이에 두 번째 권위 값이 생기지 않는다.

이것은 Day 10에서 권장하는 Server State 처리의 긍정 사례다.

### 3. 라우트 경로의 Owner

파일:

- playgrounds/react/src/App.tsx

관찰:

~~~tsx
const [currentPath, setCurrentPath] = useState(getCurrentPath);
~~~

분석:

- currentPath는 Landing, Week, Day, Practice 화면 선택에 모두 필요하다.
- 이 화면들의 가장 가까운 공통 Owner는 App이다.
- 따라서 App Local State인 것은 합리적이다.
- 더 하위 화면으로 옮기면 다른 화면이 현재 경로를 공유할 수 없고, 전역 Context로 넓혀도 이 작은 트리에서는 이득이 없다.

## 찾을 패턴

다음 패턴을 실제 기능 코드에서 발견하면 아래 템플릿으로 기록한다.

| 패턴 | 위험 신호 | 우선 검토할 대안 |
| --- | --- | --- |
| Props를 useState 초기값으로 복사 | Props 변경 뒤 Local State가 오래된 값 | Props 직접 사용, 의도된 draft라면 생명주기 명시 |
| 형제마다 같은 선택값 보유 | 선택 UI가 서로 어긋남 | 공통 부모로 Lifting State Up |
| 서버 목록을 Local State로 복사 | refetch 뒤 오래된 목록 표시 | query data 직접 사용 |
| 긴 Props 전달 체인 | 중간 컴포넌트가 값을 사용하지 않음 | Composition, 필요 시 Context |
| 거대한 Context | 관련 없는 변경이 많은 Consumer에 전달 | 책임별 Context 또는 Provider 범위 조정 |
| 한 UI의 토글이 페이지 전체 State | Owner가 불필요하게 넓음 | 해당 UI 또는 가까운 부모 Local State |

## 제출할 분석 템플릿

~~~text
파일:
→

State 또는 데이터:
→

현재 Owner:
→

실제 사용자:
→

문제 또는 장점:
→

Source of Truth:
→

검토한 대안:
→ Local State / Lifting State Up / Composition / Context / Server State

결론:
→
~~~

## 기억할 기준

코드를 발견했다고 바로 State를 위로 올리거나 Context로 바꾸지 않는다. 먼저 값의 의미와 사용 범위를 확인한 뒤, 가장 작은 유효한 Owner를 선택한다.
