# React 이벤트 처리

## 핵심 개념

React에서 이벤트 핸들러는 사용자의 이벤트가 발생했을 때 실행될 함수를 JSX에 연결하는 방식이다.

```tsx
function SaveButton() {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <button type="button" onClick={handleClick}>
      저장
    </button>
  );
}
```

`onClick`에는 함수 실행 결과가 아니라 함수 자체를 전달한다.

## 핸들러 전달과 호출의 차이

다음 두 코드는 완전히 다르다.

```tsx
<button type="button" onClick={handleClick}>
  저장
</button>
```

```tsx
<button type="button" onClick={handleClick()}>
  저장
</button>
```

첫 번째:

```text
handleClick 함수를 이벤트 핸들러로 전달
→ 클릭할 때 실행
```

두 번째:

```text
렌더링 중 handleClick을 즉시 실행
→ 반환값을 onClick에 전달
```

따라서 일반적인 이벤트 핸들러는 함수 자체를 전달한다.

## 인자가 필요한 이벤트 핸들러

이벤트가 발생했을 때 인자를 넘기고 싶다면 새 함수를 전달한다.

```tsx
function ClipList({ clipIds }: { clipIds: string[] }) {
  const handleSelect = (clipId: string) => {
    console.log("selected:", clipId);
  };

  return (
    <ul>
      {clipIds.map((clipId) => (
        <li key={clipId}>
          <button type="button" onClick={() => handleSelect(clipId)}>
            {clipId}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

핵심은 렌더링 중 `handleSelect(clipId)`를 실행하는 것이 아니라, 클릭 시 실행될 함수를 만들어 전달한다는 점이다.

## 이벤트 객체

React 이벤트 핸들러는 이벤트 객체를 받을 수 있다.

```tsx
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget);
}
```

자주 확인하는 값:

- `event.target`: 실제 이벤트가 발생한 Element
- `event.currentTarget`: 현재 이벤트 핸들러가 등록된 Element

버튼 안에 아이콘이나 텍스트가 있을 때 `target`은 내부 Element일 수 있고, `currentTarget`은 핸들러가 붙은 버튼이다.

## 이벤트 핸들러와 State Snapshot

이벤트 핸들러는 렌더링 중 만들어진 함수다. 따라서 핸들러 내부의 State 값은 그 핸들러가 만들어진 렌더링의 Snapshot이다.

```tsx
const [count, setCount] = useState(0);

function handleClick() {
  console.log("before:", count);
  setCount((previousCount) => previousCount + 1);
  console.log("after:", count);
}
```

함수형 업데이트를 사용해도 같은 핸들러 안의 `count` 변수는 바뀌지 않는다.

```text
before: 0
after: 0
다음 렌더링의 count: 1
```

이유:

- `setCount`는 현재 변수 값을 직접 바꾸지 않는다.
- 이벤트 핸들러는 현재 렌더링의 Snapshot을 참조한다.
- 새로운 State 값은 다음 렌더링에서 사용할 수 있다.

## 실습 코드

```tsx
export function EventExample() {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <>
      <button type="button" onClick={handleClick}>
        정상
      </button>

      {/* 차이를 확인한 뒤 주석 처리 */}
      {/* <button onClick={handleClick()}>잘못된 사용</button> */}
    </>
  );
}
```

확인할 것:

- `handleClick`과 `handleClick()`의 차이는 무엇인가?
- React는 언제 이벤트 핸들러를 실행하는가?
- 렌더링 중 함수를 호출하면 어떤 문제가 발생할 수 있는가?
