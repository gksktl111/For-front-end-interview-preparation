# 배열 메서드 선택

## 변경 메서드와 비변경 메서드

배열 메서드는 원본 배열을 변경하는지, 새 배열을 반환하는지 반드시 구분해야 한다.

## 원본을 변경하는 메서드

| 메서드 | 동작 | React 상태에 직접 사용 여부 |
| --- | --- | --- |
| `push` | 끝에 요소 추가 | 피해야 함 |
| `pop` | 마지막 요소 제거 | 피해야 함 |
| `splice` | 요소 추가/삭제/교체 | 피해야 함 |
| `sort` | 배열 정렬 | 피해야 함 |
| `reverse` | 배열 순서 뒤집기 | 피해야 함 |

```js
clips.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
```

`sort()`는 원본 배열 자체를 정렬한다. `clips`가 React 상태라면 기존 상태를 직접 바꾸는 코드가 된다.

## 새로운 배열을 반환하는 메서드

| 메서드 | 동작 |
| --- | --- |
| `map` | 각 요소를 변환한 새 배열 반환 |
| `filter` | 조건을 만족하는 요소만 담은 새 배열 반환 |
| `slice` | 일부 구간을 복사한 새 배열 반환 |
| `toSorted` | 정렬된 새 배열 반환 |
| `toReversed` | 뒤집힌 새 배열 반환 |
| `toSpliced` | 추가/삭제/교체 결과를 담은 새 배열 반환 |

정렬 불변성:

```js
const sortedClips = clips.toSorted(
  (left, right) => right.createdAt.localeCompare(left.createdAt),
);
```

`toSorted()`는 원본을 바꾸지 않고 정렬된 새 배열을 반환한다.

`toSorted`를 사용할 수 없는 환경에서는 복사 후 정렬한다.

```js
const sortedClips = [...clips].sort(
  (left, right) => right.createdAt.localeCompare(left.createdAt),
);
```

## 배열 고차 함수

배열 고차 함수는 함수를 인자로 받아 배열을 탐색하거나 변환한다.

예시 데이터:

```ts
type Clip = {
  id: string;
  title: string;
  folderId: string;
  isFavorite: boolean;
  isDeleted: boolean;
  isSynced: boolean;
  createdAt: string;
};

const clips: Clip[] = [
  {
    id: "clip-1",
    title: "React State",
    folderId: "frontend",
    isFavorite: true,
    isDeleted: false,
    isSynced: true,
    createdAt: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "clip-2",
    title: "Array Methods",
    folderId: "javascript",
    isFavorite: false,
    isDeleted: true,
    isSynced: false,
    createdAt: "2026-07-24T09:00:00.000Z",
  },
];
```

## 클립 목록 실습

즐겨찾기만 필터링:

```ts
const favoriteClips = clips.filter((clip) => clip.isFavorite);
```

특정 클립 찾기:

```ts
const selectedClip = clips.find((clip) => clip.id === selectedClipId);
```

삭제 대상이 하나라도 있는지 확인:

```ts
const hasDeletedClip = clips.some((clip) => clip.isDeleted);
```

모든 클립이 동기화됐는지 확인:

```ts
const everyClipSynced = clips.every((clip) => clip.isSynced);
```

폴더별 클립 수 집계:

```ts
const clipCountByFolder = clips.reduce<Record<string, number>>((acc, clip) => {
  acc[clip.folderId] = (acc[clip.folderId] ?? 0) + 1;
  return acc;
}, {});
```

## `map`과 부수효과

`map`은 새 배열을 만들기 위한 메서드다.

피해야 할 코드:

```ts
clips.map((clip) => {
  analytics.track("clip_viewed", clip.id);
});
```

위 코드는 `map`의 반환값을 사용하지 않는다. 부수효과만 목적이라면 `forEach`가 의도를 더 잘 드러낸다.

```ts
clips.forEach((clip) => {
  analytics.track("clip_viewed", clip.id);
});
```

선택 기준:

- 새 배열 변환: `map`
- 조건 필터링: `filter`
- 특정 요소 찾기: `find`
- 하나라도 존재하는지 확인: `some`
- 모두 만족하는지 확인: `every`
- 집계나 누적 결과 생성: `reduce`
- 부수효과 실행: `forEach`
