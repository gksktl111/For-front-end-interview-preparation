# 값, 참조, 복사

## 원시값과 참조값

JavaScript의 값은 크게 **원시값**과 **참조값**으로 나눌 수 있다.

| 구분 | 예시 | 비교/복사 기준 |
| --- | --- | --- |
| 원시값 | `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint` | 값 자체가 비교되고 복사된다 |
| 참조값 | 객체, 배열, 함수 | 값이 들어있는 메모리 위치에 대한 참조가 비교되고 복사된다 |

```js
const name = "Minkyu";
const copiedName = name;

const original = { user: { name: "Minkyu" } };
const copied = { ...original };
```

`copiedName`은 문자열 값 자체가 복사된다. 반면 `copied`는 바깥 객체만 새로 만들고, `user` 객체는 기존 참조를 그대로 공유한다.

## 얕은 복사

얕은 복사는 한 단계만 새로 복사한다. Spread 문법과 `Object.assign`은 일반적으로 얕은 복사를 수행한다.

```js
const original = {
  user: {
    name: "Minkyu",
  },
};

const copied = { ...original };

copied.user.name = "Changed";

console.log(original.user.name); // "Changed"
```

원본까지 바뀌는 이유:

- `{ ...original }`은 `original`의 1단계 프로퍼티만 새 객체에 복사한다.
- `user` 프로퍼티의 값은 객체이므로 객체 자체가 아니라 참조가 복사된다.
- `original.user`와 `copied.user`는 같은 객체를 가리킨다.
- 그래서 `copied.user.name`을 바꾸면 같은 객체를 공유하는 `original.user.name`도 바뀐다.

## 깊은 복사

깊은 복사는 중첩된 객체까지 새로 복사한다. 모든 상황에서 Spread만으로는 깊은 복사가 되지 않는다.

```js
const copied = {
  ...original,
  user: {
    ...original.user,
  },
};
```

단순 데이터라면 `structuredClone`도 사용할 수 있다.

```js
const copied = structuredClone(original);
```

선택 기준:

- 중첩 객체의 특정 부분만 바꿀 때는 필요한 깊이까지만 Spread로 새로 만든다.
- 날짜, 함수, 클래스 인스턴스, 순환 참조처럼 특수한 값이 있으면 복사 방식의 제약을 확인해야 한다.
- React 상태에서는 변경되는 경로의 모든 객체/배열 참조를 새로 만들어야 한다.

## 구조 분해 할당

구조 분해 할당은 객체나 배열에서 값을 꺼내는 문법이다.

```js
const clip = {
  id: "clip-1",
  title: "React State",
  folder: {
    id: "frontend",
    name: "Frontend",
  },
};

const { title, folder } = clip;
const [firstClip] = clips;
```

주의할 점:

- 구조 분해 할당은 값을 꺼내는 문법이지 깊은 복사 문법이 아니다.
- `folder`가 객체라면 `folder`에는 기존 객체의 참조가 들어간다.

## Spread 문법

Spread 문법은 객체나 배열의 요소를 펼친다. 객체나 배열 상태를 업데이트할 때 자주 사용한다.

```js
const nextClip = {
  ...clip,
  title: "React Immutability",
};

const nextClips = [...clips, nextClip];
```

주의할 점:

- Spread는 한 단계만 펼친다.
- 중첩 객체를 안전하게 바꾸려면 바뀌는 경로를 따라 새 객체를 만들어야 한다.

```js
const nextClip = {
  ...clip,
  folder: {
    ...clip.folder,
    name: "Frontend",
  },
};
```

## 확인 코드

```js
const original = {
  user: {
    name: "Minkyu",
  },
};

const shallowCopied = { ...original };
const copiedWithNestedUser = {
  ...original,
  user: {
    ...original.user,
  },
};

console.log(original === shallowCopied); // false
console.log(original.user === shallowCopied.user); // true
console.log(original.user === copiedWithNestedUser.user); // false
```
