# Day 3 빠른 복습 정리

## 학습 목표

- JavaScript의 값과 참조를 구분한다.
- React 상태를 불변하게 다뤄야 하는 이유를 설명한다.
- 배열 메서드의 변경 여부를 구분한다.

## 상세 개념 파일

- [값, 참조, 복사](./value-reference-copy.md)
- [React 상태와 불변성](./react-immutability.md)
- [배열 메서드 선택](./array-methods.md)
- [안전한 접근과 기본값 처리](./safe-access-defaults.md)

## 실행 예시

- [얕은 복사](../../playgrounds/js/1주차/day3/01-shallow-copy.js)
- [참조 동일성](../../playgrounds/js/1주차/day3/02-reference-identity.js)
- [배열 메서드](../../playgrounds/js/1주차/day3/03-array-methods.js)
- [`||`와 `??`](../../playgrounds/js/1주차/day3/04-nullish-vs-or.js)

```bash
node playgrounds/js/1주차/day3/01-shallow-copy.js
node playgrounds/js/1주차/day3/02-reference-identity.js
node playgrounds/js/1주차/day3/03-array-methods.js
node playgrounds/js/1주차/day3/04-nullish-vs-or.js
```

## 1. 값과 복사 핵심

원시값은 값 자체가 복사되고 비교된다. 객체, 배열, 함수 같은 참조값은 값이 들어있는 위치에 대한 참조가 복사되고 비교된다.

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

왜 원본까지 바뀌는가?

- Spread 문법은 일반적으로 한 단계만 복사하는 얕은 복사다.
- `copied`는 새 객체지만 `copied.user`와 `original.user`는 같은 객체를 가리킨다.
- 중첩 객체를 안전하게 바꾸려면 변경되는 경로의 객체도 새로 만들어야 한다.

```js
const copied = {
  ...original,
  user: {
    ...original.user,
    name: "Changed",
  },
};
```

## 2. React 불변성 핵심

React 상태는 직접 변경하지 않고 새 값으로 교체해야 한다. React는 이전 상태와 다음 상태의 참조 동일성을 비교해서 변경 여부를 판단하기 때문이다.

피해야 할 코드:

```tsx
const handleAddClip = (clip: Clip) => {
  clips.push(clip);
  setClips(clips);
};
```

권장 코드:

```tsx
const handleAddClip = (clip: Clip) => {
  setClips((previousClips) => [...previousClips, clip]);
};
```

핵심:

- 같은 객체나 배열 참조를 다시 `setState`에 전달하면 React가 변경을 감지하지 못할 수 있다.
- `Object.is({}, {})`는 `false`이고, 같은 배열 참조끼리는 `true`다.
- 이전 상태를 기준으로 다음 상태를 만들 때는 함수형 업데이트가 안전하다.

## 3. 배열 메서드 핵심

배열 메서드는 원본을 변경하는지 반드시 구분해야 한다.

| 원본 변경 | 새 배열 반환 |
| --- | --- |
| `push` | `map` |
| `pop` | `filter` |
| `splice` | `slice` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
|  | `toSpliced` |

정렬은 특히 주의한다.

```js
const sortedClips = clips.toSorted(
  (left, right) => right.createdAt.localeCompare(left.createdAt),
);
```

`toSorted()`를 사용할 수 없는 환경에서는 복사 후 정렬한다.

```js
const sortedClips = [...clips].sort(
  (left, right) => right.createdAt.localeCompare(left.createdAt),
);
```

배열 고차 함수 선택:

- 즐겨찾기만 필터링: `filter`
- 특정 클립 찾기: `find`
- 삭제 대상이 하나라도 있는지 확인: `some`
- 모든 클립이 동기화됐는지 확인: `every`
- 폴더별 클립 수 집계: `reduce`
- 각 요소를 새 값으로 변환: `map`

## 4. 기본값 처리 핵심

Optional Chaining은 중간 값이 `null` 또는 `undefined`여도 안전하게 접근한다.

```js
const folderName = clip.folder?.name;
```

`??`는 왼쪽 값이 `null` 또는 `undefined`일 때만 기본값을 사용한다. `||`는 모든 Falsy 값을 기본값으로 바꾼다.

```js
const firstPage = page || 1;
const secondPage = page ?? 1;
```

| `page` 값 | `page \|\| 1` | `page ?? 1` |
| --- | ---: | ---: |
| `0` | `1` | `0` |
| `null` | `1` | `1` |
| `undefined` | `1` | `1` |
| `""` | `1` | `""` |

선택 기준:

- `0`, `""`, `false`도 유효한 값이면 `??`를 사용한다.
- Falsy 값 전체를 대체해야 할 때만 `||`를 사용한다.

## 프로젝트 연결 점검

다음 코드를 찾으면 day3 개념으로 설명하고 개선할 수 있어야 한다.

- 배열을 직접 정렬하는 코드
- 중첩 객체를 Spread로만 복사하는 코드
- `||`를 기본값 처리에 사용한 코드
- `map` 안에서 부수효과를 실행하는 코드
- 동일 객체를 다시 `setState`에 전달하는 코드

## 면접 직전 체크

- Spread 문법은 깊은 복사를 수행하는가?
  - 아니다. 일반적으로 한 단계만 복사하는 얕은 복사다.
- React 상태를 직접 변경하면 왜 문제가 되는가?
  - 같은 참조를 다시 전달하면 React가 변경을 감지하기 어렵고, 상태 변경 흐름이 예측하기 어려워진다.
- `sort()`는 원본을 변경하는가?
  - 그렇다. 원본 배열을 직접 정렬한다.
- `toSorted()`는 `sort()`와 무엇이 다른가?
  - `toSorted()`는 원본을 바꾸지 않고 정렬된 새 배열을 반환한다.
- `||`와 `??`의 차이는?
  - `||`는 Falsy 값을 기본값으로 대체하고, `??`는 `null` 또는 `undefined`만 기본값으로 대체한다.

## 완료 조건

- [ ] `sort()`가 원본을 변경한다는 것을 설명할 수 있다.
- [ ] 불변성과 참조 동일성을 React 렌더링과 연결할 수 있다.
- [ ] 얕은 복사와 깊은 복사를 코드로 구분할 수 있다.
