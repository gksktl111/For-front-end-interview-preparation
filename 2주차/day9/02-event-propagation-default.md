# 이벤트 전파와 기본 동작

## 이벤트 전파

중첩된 Element에서 이벤트가 발생하면 일반적으로 자식에서 부모 방향으로 전파된다.

```tsx
export function EventPropagationExample() {
  const handleParentClick = () => {
    console.log("parent");
  };

  const handleChildClick = () => {
    console.log("child");
  };

  return (
    <div onClick={handleParentClick}>
      <button type="button" onClick={handleChildClick}>
        Click
      </button>
    </div>
  );
}
```

버튼 클릭 흐름:

```text
button click
↓
child handler
↓
이벤트 전파
↓
parent handler
```

## `stopPropagation`

부모 핸들러까지 실행되어서는 안 되는 명확한 이유가 있다면 전파를 중단할 수 있다.

```tsx
const handleChildClick = (
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.stopPropagation();
  console.log("child");
};
```

주의:

- `stopPropagation()`을 습관적으로 사용하지 않는다.
- 부모의 클릭 로직까지 실행되면 실제로 문제가 되는지 먼저 판단한다.
- 예: 카드 전체 클릭은 상세 이동, 카드 안 삭제 버튼은 삭제만 수행해야 하는 경우

## `target`과 `currentTarget`

```tsx
function handleClick(event: React.MouseEvent<HTMLDivElement>) {
  console.log(event.target);
  console.log(event.currentTarget);
}
```

차이:

```text
target
→ 실제 이벤트가 발생한 Element

currentTarget
→ 현재 이벤트 핸들러가 등록된 Element
```

중첩 구조에서 `target`과 `currentTarget`은 다를 수 있다.

## 브라우저 기본 동작

브라우저 자체가 제공하는 기본 동작이 있다.

대표적으로:

- `<form>` submit
- `<a>` 페이지 이동
- `<input type="checkbox">` 체크 상태 변경

기본 동작을 막아야 할 때는 `preventDefault()`를 사용한다.

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  // 별도의 submit 처리
}
```

## `stopPropagation`과 `preventDefault`

둘은 서로 다른 개념이다.

```text
stopPropagation()
→ 이벤트가 부모로 전파되는 것을 막음

preventDefault()
→ 브라우저의 기본 동작을 막음
```

예를 들어 `<form>` 제출로 페이지가 새로고침되는 것을 막고 싶다면 `preventDefault()`를 써야 한다. 부모 클릭 핸들러 실행을 막고 싶다면 `stopPropagation()`을 써야 한다.

## 실습 포인트

확인할 것:

- 버튼을 클릭했을 때 child 로그와 parent 로그가 어떤 순서로 찍히는가?
- `stopPropagation()`을 추가하면 부모 로그가 사라지는가?
- `event.target`과 `event.currentTarget`은 언제 다른가?
- 링크 클릭에서 `preventDefault()`를 사용하면 URL hash 변경이 막히는가?
