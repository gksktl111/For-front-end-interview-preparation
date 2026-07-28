# React 상태와 불변성

## 불변성이란

불변성은 기존 값을 직접 바꾸지 않고, 변경 결과를 담은 새 값을 만드는 방식이다.

React 상태에서 불변성이 중요한 이유는 React가 이전 상태와 다음 상태의 **참조 동일성**을 비교해서 변경 여부를 판단하기 때문이다.

```js
Object.is(1, 1); // true
Object.is({}, {}); // false

const clips = [];
Object.is(clips, clips); // true
```

객체와 배열은 내용이 같아도 참조가 다르면 다른 값으로 본다. 반대로 같은 객체를 직접 수정한 뒤 다시 전달하면 참조는 같기 때문에 변경을 감지하기 어렵다.

## 상태 직접 변경 문제

피해야 할 코드:

```tsx
const handleAddClip = (clip: Clip) => {
  clips.push(clip);
  setClips(clips);
};
```

문제점:

- `push`는 기존 배열을 직접 변경한다.
- `setClips(clips)`는 변경된 내용이 들어 있어도 같은 배열 참조를 다시 전달한다.
- React가 이전 상태와 다음 상태를 같은 값으로 판단해 렌더링을 생략할 수 있다.
- 이전 상태가 몰래 바뀌어 디버깅과 상태 추적이 어려워진다.

권장 방식:

```tsx
const handleAddClip = (clip: Clip) => {
  setClips((previousClips) => [...previousClips, clip]);
};
```

좋은 점:

- 기존 배열을 직접 변경하지 않는다.
- 새 배열 참조를 React에 전달한다.
- 이전 상태를 기준으로 다음 상태를 계산하므로 stale closure 위험을 줄일 수 있다.

## 객체 상태 업데이트

객체 상태도 기존 객체를 직접 바꾸지 않고 새 객체를 만들어야 한다.

피해야 할 코드:

```tsx
clip.title = "Updated";
setClip(clip);
```

권장 방식:

```tsx
setClip((previousClip) => ({
  ...previousClip,
  title: "Updated",
}));
```

## 중첩 객체 업데이트

중첩 객체를 바꿀 때는 변경되는 경로의 객체를 모두 새로 만들어야 한다.

```tsx
setClip((previousClip) => ({
  ...previousClip,
  folder: {
    ...previousClip.folder,
    name: "Frontend",
  },
}));
```

위 코드에서 새로 만들어지는 값:

- 바깥 `clip` 객체
- 내부 `folder` 객체

그대로 유지되는 값:

- 변경되지 않은 다른 프로퍼티
- 변경 경로 밖에 있는 객체 참조

## 배열 상태 업데이트 패턴

배열 상태를 업데이트할 때 핵심은 **기존 배열을 직접 바꾸지 않고 새 배열을 만들어 `setState`에 전달하는 것**이다.

React는 상태 업데이트 시 이전 상태와 다음 상태의 참조가 같은지 비교한다. 배열 안에 요소가 추가되거나 삭제됐더라도 배열 참조가 그대로라면 React는 변경이 없다고 판단할 수 있다.

```tsx
clips.push(clip);
setClips(clips);
```

위 코드는 배열 내용은 바뀌지만 `clips` 참조는 그대로다. 그래서 React 상태 업데이트에서는 `push`, `splice`, `sort`, `reverse`처럼 원본을 변경하는 메서드를 직접 쓰기보다, `map`, `filter`, `toSorted` 또는 Spread 문법처럼 새 배열을 반환하는 방식으로 다음 상태를 만들어야 한다.

정리하면 배열 상태 업데이트의 흐름은 다음과 같다.

1. 이전 배열을 직접 변경하지 않는다.
2. 원하는 변경 결과가 반영된 새 배열을 만든다.
3. 새 배열 참조를 `setState`에 전달한다.

추가:

```tsx
setClips((previousClips) => [...previousClips, clip]);
```

삭제:

```tsx
setClips((previousClips) =>
  previousClips.filter((previousClip) => previousClip.id !== clipId),
);
```

수정:

```tsx
setClips((previousClips) =>
  previousClips.map((previousClip) =>
    previousClip.id === clipId
      ? { ...previousClip, title: "Updated" }
      : previousClip,
  ),
);
```

정렬:

```tsx
setClips((previousClips) =>
  previousClips.toSorted(
    (left, right) => right.createdAt.localeCompare(left.createdAt),
  ),
);
```

`toSorted`를 사용할 수 없는 환경에서는 복사 후 정렬한다.

```tsx
setClips((previousClips) =>
  [...previousClips].sort(
    (left, right) => right.createdAt.localeCompare(left.createdAt),
  ),
);
```

## 면접 답변 핵심

React 상태를 직접 변경하면 같은 참조를 다시 전달하게 될 수 있다. React는 상태 변경 여부를 참조 동일성으로 판단하기 때문에 변경을 감지하지 못하거나 렌더링이 생략될 수 있다. 따라서 기존 상태를 직접 바꾸지 않고 새 객체나 새 배열을 만들어 전달해야 한다.
