# State Update Queue와 Batching

## State Update는 Queue에 등록된다

`setState`를 호출하면 React는 State Update를 Queue에 등록한다. 등록된 업데이트는 다음 렌더링에서 처리된다.

```tsx
setCount(count + 1);
```

이 코드는 현재 `count` 값을 즉시 바꾸는 것이 아니라 "다음 State를 이 값으로 계산해 달라"는 업데이트를 등록한다.

## 값 기반 업데이트

```tsx
const handleValueUpdate = () => {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
};
```

현재 렌더링의 `count`가 `0`이면 위 코드는 모두 같은 Snapshot을 참조한다.

```text
현재 Snapshot: count = 0

setCount(count + 1) → setCount(1)
setCount(count + 1) → setCount(1)
setCount(count + 1) → setCount(1)
```

결과는 `+3`이 아니라 `+1`이다.

## 함수형 업데이트

이전 State를 기반으로 다음 State를 계산해야 하면 함수형 업데이트를 사용한다.

```tsx
const handleFunctionalUpdate = () => {
  setCount((previousCount) => previousCount + 1);
  setCount((previousCount) => previousCount + 1);
  setCount((previousCount) => previousCount + 1);
};
```

React는 Queue에서 이전 업데이트 결과를 다음 업데이트의 입력으로 넘긴다.

```text
0 → 1 → 2 → 3
```

따라서 결과는 `+3`이다.

## 값 기반 업데이트와 함수형 업데이트 비교

| 구분 | 코드 | 기준 값 | 결과 |
| --- | --- | --- | --- |
| 값 기반 업데이트 | `setCount(count + 1)` | 현재 렌더링의 Snapshot | 같은 Snapshot을 반복 참조 |
| 함수형 업데이트 | `setCount((prev) => prev + 1)` | Queue에서 전달된 이전 결과 | 업데이트 결과를 누적 |

## Batching

Batching은 여러 State Update를 모아 한 번의 렌더링으로 반영하는 처리다.

예:

```tsx
const handleClick = () => {
  setCount((count) => count + 1);
  setIsOpen(true);
  setMessage("updated");
};
```

React는 위 업데이트들을 각각 즉시 렌더링하지 않고 모아서 처리할 수 있다.

```text
이벤트 핸들러 실행
→ State Update 여러 개 등록
→ React가 업데이트를 모음
→ 한 번의 렌더링으로 다음 UI 계산
→ Commit
```

## Snapshot과 Batching은 다른 개념이다

Snapshot은 업데이트가 어떤 값을 읽는지에 대한 개념이다.

```text
State Snapshot
→ 현재 렌더링 안의 count는 무엇인가?
```

Batching은 업데이트를 언제 렌더링에 반영하는지에 대한 개념이다.

```text
Batching
→ 여러 setState를 한 번의 렌더링으로 모을 수 있는가?
```

둘을 섞어서 설명하면 면접 답변이 흐려진다.

## 실습 코드

```tsx
import { useState } from "react";

export function UpdateQueueCounter() {
  const [count, setCount] = useState(0);

  const handleValueUpdate = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  const handleFunctionalUpdate = () => {
    setCount((previousCount) => previousCount + 1);
    setCount((previousCount) => previousCount + 1);
    setCount((previousCount) => previousCount + 1);
  };

  return (
    <section>
      <p>Count: {count}</p>
      <button type="button" onClick={handleValueUpdate}>
        값 기반 업데이트
      </button>
      <button type="button" onClick={handleFunctionalUpdate}>
        함수형 업데이트
      </button>
    </section>
  );
}
```

확인할 것:

- 값 기반 업데이트 버튼은 왜 `+1`인가?
- 함수형 업데이트 버튼은 왜 `+3`인가?
- Snapshot은 어떤 값을 참조하는 문제인가?
- Batching은 몇 번 렌더링하는 문제인가?

## 함수형 업데이트를 우선 고려할 때

다음 상황에서는 함수형 업데이트가 안전하다.

- 이전 State를 기반으로 증가, 감소, 토글, 누적할 때
- 같은 이벤트에서 같은 State를 여러 번 업데이트할 때
- 타이머, Promise, 구독 콜백처럼 나중에 실행되는 함수에서 이전 State가 필요할 때
- 배열이나 객체 State에 항목을 추가·삭제·수정할 때

예:

```tsx
setItems((previousItems) => [
  ...previousItems,
  {
    id: crypto.randomUUID(),
    title: "New item",
  },
]);
```

## 면접 답변 포인트

`setCount(count + 1)`을 세 번 호출했는데 왜 `1`만 증가하는지 물으면 다음처럼 답한다.

> 세 호출이 모두 같은 렌더링의 `count` Snapshot을 참조하기 때문이다. 현재 `count`가 `0`이면 세 업데이트는 모두 `setCount(1)`처럼 등록된다. React가 batching으로 여러 업데이트를 모아 처리할 수 있지만, `+1`이 되는 핵심 이유는 값 기반 업데이트가 같은 Snapshot을 참조하기 때문이다. 이전 업데이트 결과를 이어받으려면 `setCount((prev) => prev + 1)` 형태를 사용해야 한다.
