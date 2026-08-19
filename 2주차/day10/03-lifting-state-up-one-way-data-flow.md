# Lifting State Up과 단방향 데이터 흐름

## Lifting State Up이란

서로 다른 컴포넌트가 같은 State를 읽거나 변경해야 할 때, State를 가장 가까운 공통 부모로 옮기는 패턴이다.

~~~text
기존

ClipFilter
└─ filter State

ClipList
└─ filter 필요

개선

ClipPage
└─ filter State
   ├─ ClipFilter
   └─ ClipList
~~~

~~~tsx
function ClipPage() {
  const [filter, setFilter] = useState("all");

  return (
    <>
      <ClipFilter filter={filter} onFilterChange={setFilter} />
      <ClipList filter={filter} />
    </>
  );
}
~~~

이 구조에서는 ClipPage가 filter의 유일한 Source of Truth다.

## 공유 Counter로 보는 차이

각 Counter가 자기 State를 가지면 서로 독립적이다.

~~~tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((previous) => previous + 1)}>
      {count}
    </button>
  );
}

function App() {
  return (
    <>
      <Counter />
      <Counter />
    </>
  );
}
~~~

두 Counter가 하나의 값을 보여야 한다면 Owner를 부모로 옮긴다.

~~~tsx
function App() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount((previous) => previous + 1);
  };

  return (
    <>
      <Counter count={count} onIncrease={handleIncrease} />
      <Counter count={count} onIncrease={handleIncrease} />
    </>
  );
}
~~~

## React의 단방향 데이터 흐름

React에서 데이터와 변경 요청은 서로 반대 방향으로 이동한다.

~~~text
Parent State
    ↓ Props
Child UI
    ↓ Event
Child callback 호출
    ↓
Parent State update
    ↓
새 Props
~~~

~~~tsx
function Parent() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount((previousCount) => previousCount + 1);
  };

  return <Child count={count} onIncrease={handleIncrease} />;
}

function Child({
  count,
  onIncrease,
}: {
  count: number;
  onIncrease: () => void;
}) {
  return (
    <button type="button" onClick={onIncrease}>
      {count}
    </button>
  );
}
~~~

자식이 부모 State를 직접 수정하는 것이 아니다. 자식은 이벤트가 발생했다는 사실을 callback으로 알리고, Owner인 부모가 다음 State를 결정한다.

## 장점

- Source of Truth가 하나라서 두 UI가 쉽게 일치한다.
- 변경 규칙을 Owner에서 읽을 수 있다.
- 자식은 Props로 받은 계약만 알면 되어 재사용하기 쉽다.
- 테스트할 때 State 변경과 표시를 분리할 수 있다.

## 너무 많이 올렸다는 신호

Lifting State Up은 기본 도구지만 무한정 적용하지 않는다.

- 상위 컴포넌트가 서로 무관한 UI State를 너무 많이 소유한다.
- State를 위해 많은 중간 Props가 생긴다.
- 특정 영역의 UI가 다른 영역의 구현 세부 사항까지 알아야 한다.

이때 먼저 Component 경계를 재구성하거나 Composition을 검토한다. 깊은 Subtree 전체의 공통 값이라면 Context가 다음 후보가 될 수 있다.

## 실습에서 확인할 것

/week2/day10/lifting-state-up에서 두 패널을 비교한다.

- 독립 Counter는 버튼마다 별도 Source of Truth를 가진다.
- 공유 Counter는 어느 버튼을 눌러도 공통 부모의 count가 갱신된다.
- 버튼 클릭이 callback을 통해 Owner로 돌아가는 흐름을 말로 설명한다.

## 기억할 문장

> 공유가 필요할 때는 State를 공통 부모로 올리고, 자식은 Props를 읽고 callback으로 변경을 요청한다.
