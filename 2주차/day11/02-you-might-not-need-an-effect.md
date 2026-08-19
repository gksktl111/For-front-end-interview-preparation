# Effect가 필요 없는 경우와 Event Handler

## 렌더링 중 계산할 수 있는 값

다른 Props나 State로 항상 계산할 수 있는 값은 별도 State에 저장하고 Effect로 맞추지 않는다.

### 불필요한 Derived State

~~~tsx
function PriceCalculator() {
  const [price, setPrice] = useState(1000);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(1000);

  useEffect(() => {
    setTotal(price * quantity);
  }, [price, quantity]);

  return <div>{total}</div>;
}
~~~

### 렌더링 값으로 계산

~~~tsx
function PriceCalculator() {
  const [price, setPrice] = useState(1000);
  const [quantity, setQuantity] = useState(1);
  const total = price * quantity;

  return <div>{total}</div>;
}
~~~

두 번째 구조에서는 렌더링할 때 이미 최신 `price`와 `quantity`를 사용한다. total을 맞추기 위한 추가 업데이트가 없으므로 데이터 흐름도 한 단계 짧아진다.

~~~text
불필요한 Effect
원천 State 변경
↓
Render
↓
Effect가 다른 State 변경
↓
추가 Render

렌더링 중 계산
원천 State 변경
↓
Render하면서 최신 값 계산
~~~

## Event Handler와 Effect의 구분

특정 사용자 행동 때문에 발생하는 작업은 대체로 Event Handler에 둔다.

### 삭제 요청을 Effect로 우회한 구조

~~~tsx
const [shouldDelete, setShouldDelete] = useState(false);

useEffect(() => {
  if (shouldDelete) {
    void deleteClip();
  }
}, [shouldDelete]);
~~~

이 코드는 클릭 → `shouldDelete` 변경 → Render → Effect → 삭제 요청이라는 우회 경로를 만든다. 삭제가 왜 발생했는지도 State 이름과 Effect를 함께 읽어야 알 수 있다.

### 클릭 handler에서 바로 실행

~~~tsx
async function handleDelete() {
  await deleteClip();
}

return <button type="button" onClick={() => void handleDelete()}>삭제</button>;
~~~

코드상으로도 "이 버튼 클릭이 삭제 요청을 발생시킨다"는 사실이 명확하다.

## 판단 기준

| 질문 | 우선 위치 |
| --- | --- |
| 이 값은 현재 Props와 State로 계산 가능한가? | 렌더링 중 계산 |
| 사용자의 클릭, 제출, 선택 때문에 실행되는가? | Event Handler |
| 컴포넌트의 존재나 특정 reactive 값에 맞춰 외부 시스템을 유지해야 하는가? | Effect |
| 비용이 큰 순수 계산인가? | 먼저 일반 계산, 실제 병목일 때 `useMemo` 검토 |

Effect를 줄인다는 것은 Effect를 금지하는 일이 아니다. 코드가 실제 원인과 가까운 위치에 있게 만드는 일이다.

## 흔한 오해

| 오해 | 정리 |
| --- | --- |
| State가 바뀌면 무조건 Effect에서 처리한다. | State 변경 뒤에 계산 가능한 값은 렌더링으로, 클릭 때문에 실행되는 일은 handler로 둔다. |
| derived value는 항상 `useMemo`가 필요하다. | 보통의 계산은 렌더링 중 직접 계산한다. `useMemo`는 성능 측정 뒤 검토한다. |
| handler가 async이면 Effect가 필요하다. | async 여부가 아니라 사용자 행동이 원인인지, 외부 동기화가 원인인지가 기준이다. |

## 실습에서 확인할 것

- `/week2/day11/effect-synchronization`: total을 State로 저장하지 않고 렌더링에서 계산하는 이유를 본다.
- `/week2/day11/event-handler-vs-effect`: 같은 삭제 작업을 Effect 우회 구조와 Event Handler 구조로 비교한다.

## 기억할 문장

> "이 값은 렌더링 중 계산할 수 있는가?"와 "이 작업은 어떤 사용자 행동 때문에 발생하는가?"를 먼저 묻으면 많은 불필요한 Effect를 피할 수 있다.
