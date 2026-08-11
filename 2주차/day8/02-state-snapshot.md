# State as a Snapshot

## 핵심 개념

React에서 State는 렌더링마다 고정된 Snapshot처럼 동작한다. 컴포넌트가 한 번 렌더링되면 그 렌더링 안의 변수와 이벤트 핸들러는 해당 시점의 State 값을 바라본다.

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount(count + 1);
    console.log("current snapshot:", count);
  };

  return (
    <button type="button" onClick={handleIncrease}>
      {count}
    </button>
  );
}
```

버튼을 처음 클릭했을 때:

```text
현재 렌더링의 count = 0
setCount(1) 등록
console.log(count) → 0
다음 렌더링에서 count = 1
```

`setCount`가 현재 `count` 변수 자체를 `1`로 바꾸는 것이 아니다.

## 이벤트 핸들러와 Snapshot

이벤트 핸들러는 렌더링 중 만들어진 함수다.

```tsx
const handleIncrease = () => {
  setCount(count + 1);
  console.log(count);
};
```

이 핸들러가 만들어진 렌더링에서 `count`가 `0`이었다면, 핸들러 안의 `count`도 그 렌더링의 Snapshot인 `0`을 참조한다.

다음 렌더링에서 `count`가 `1`이 되면 새로운 `handleIncrease` 함수가 만들어지고, 그 함수는 새로운 Snapshot인 `1`을 참조한다.

```text
Render #1: count = 0, handleIncrease는 count 0을 참조
클릭
setCount(1)
Render #2: count = 1, handleIncrease는 count 1을 참조
```

## `setState`는 현재 변수를 직접 변경하지 않는다

React State 변수는 일반 JavaScript 변수처럼 대입으로 바뀌지 않는다.

```tsx
setCount(count + 1);
console.log(count);
```

위 코드에서 `setCount`는 다음 렌더링을 요청한다. 현재 실행 중인 함수 스코프의 `count` 값은 그대로다.

따라서 다음 설명은 부정확하다.

```text
setState는 비동기라서 바로 값이 안 바뀐다.
```

더 정확한 설명:

```text
현재 이벤트 핸들러는 현재 렌더링의 State Snapshot을 사용한다.
setState는 현재 Snapshot을 바꾸는 것이 아니라 다음 렌더링을 요청한다.
```

## Snapshot이 중요한 이유

Snapshot 모델은 이벤트 처리 중 값이 갑자기 바뀌어 로직이 흔들리는 것을 막는다.

```tsx
function CheckoutButton({ totalPrice }: { totalPrice: number }) {
  const handleClick = () => {
    alert(`결제 금액: ${totalPrice}`);
  };

  return (
    <button type="button" onClick={handleClick}>
      결제
    </button>
  );
}
```

이벤트 핸들러는 자신이 만들어진 렌더링의 `totalPrice`를 기준으로 동작한다. React는 렌더링마다 UI와 이벤트 핸들러가 같은 Snapshot을 바라보게 만든다.

## 실습 1. 로그 확인

```tsx
import { useState } from "react";

export function SnapshotCounter() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount(count + 1);
    console.log("current snapshot:", count);
  };

  return (
    <button type="button" onClick={handleIncrease}>
      Count: {count}
    </button>
  );
}
```

확인할 것:

- 첫 클릭에서 화면은 `1`로 바뀌지만 로그는 `0`인가?
- `setCount`는 현재 `count` 변수를 변경하는가?
- 새로운 `count`는 언제 사용할 수 있는가?

## 실습 2. 같은 핸들러 안에서 여러 번 읽기

```tsx
const handleClick = () => {
  setCount(count + 1);
  console.log("first:", count);
  console.log("second:", count);
};
```

두 로그는 같은 값을 출력한다. 같은 이벤트 핸들러 안에서는 같은 Snapshot을 읽기 때문이다.

## 면접 답변 포인트

`setState` 직후 이전 값이 출력되는 이유를 물으면 다음 순서로 답한다.

1. 컴포넌트 렌더링마다 State Snapshot이 만들어진다.
2. 이벤트 핸들러는 자신이 생성된 렌더링의 Snapshot을 참조한다.
3. `setState`는 현재 변수를 직접 변경하지 않고 다음 렌더링을 요청한다.
4. 그래서 현재 핸들러 안의 State 값은 그대로이며, 업데이트된 값은 다음 렌더링에서 읽을 수 있다.
