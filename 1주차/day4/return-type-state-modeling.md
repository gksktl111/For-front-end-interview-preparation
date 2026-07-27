# 반환 타입과 상태 모델링

## 함수 반환 타입

함수 반환 타입은 함수가 외부에 제공하는 계약이다.

```ts
type Clip = {
  id: string;
  title: string;
};

function findClip(clips: Clip[], clipId: string): Clip | undefined {
  return clips.find((clip) => clip.id === clipId);
}
```

반환 타입을 명시하면 함수 내부 구현이 바뀌더라도 외부 계약을 유지하는지 확인할 수 있다.

## 반환 타입을 명시하면 좋은 경우

항상 모든 함수에 반환 타입을 적어야 하는 것은 아니다. 하지만 다음 경우에는 명시하는 편이 안전하다.

- 외부에서 호출되는 함수
- API 클라이언트 함수
- 상태를 만드는 함수
- 성공/실패를 함께 다루는 함수
- 여러 분기를 가진 함수
- 재사용되는 유틸 함수

```ts
async function fetchClips(): Promise<Clip[]> {
  const response = await fetch("/api/clips");
  const data = await response.json();

  return data;
}
```

## 일관되지 않은 반환 타입 문제

피해야 할 코드:

```ts
async function loadClips() {
  try {
    return await fetchClips();
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

이 함수는 성공하면 `Clip[]`, 실패하면 `null`을 반환한다. 호출부는 매번 `null`을 확인해야 하고, 실패 이유도 사라진다.

더 나쁜 예:

```ts
function getClipTitle(clip?: Clip) {
  if (!clip) {
    return false;
  }

  return clip.title;
}
```

문자열을 기대하는 함수가 실패 시 `false`를 반환하면 호출부의 분기가 복잡해진다.

## Result 타입

성공과 실패를 명확히 표현하려면 Result 형태의 유니언을 사용할 수 있다.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

사용 예시:

```ts
async function loadClips(): Promise<Result<Clip[]>> {
  try {
    const clips = await fetchClips();
    return { ok: true, data: clips };
  } catch {
    return { ok: false, error: "클립 목록을 불러오지 못했습니다." };
  }
}
```

호출부:

```ts
const result = await loadClips();

if (result.ok) {
  renderClips(result.data);
} else {
  showError(result.error);
}
```

`ok` 필드가 판별자 역할을 하므로 `result.ok`가 `true`인 분기에서는 `data`를 안전하게 사용할 수 있다.

## 상태 모델링

UI 상태도 성공/실패/로딩을 하나의 객체에 섞기보다 상태별 타입으로 나누는 편이 안전하다.

피해야 할 코드:

```ts
type ClipsState = {
  isLoading: boolean;
  clips?: Clip[];
  error?: string;
};
```

이 타입은 다음 상태를 허용한다.

```ts
const state: ClipsState = {
  isLoading: true,
  clips: [],
  error: "실패했습니다.",
};
```

로딩, 성공 데이터, 실패 메시지가 동시에 존재하는 잘못된 상태다.

권장 방식:

```ts
type ClipsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; clips: Clip[] }
  | { status: "error"; message: string };
```

렌더링:

```tsx
function ClipsPanel({ state }: { state: ClipsState }) {
  switch (state.status) {
    case "idle":
      return <p>클립을 검색하세요.</p>;
    case "loading":
      return <p>불러오는 중입니다.</p>;
    case "success":
      return <ClipList clips={state.clips} />;
    case "error":
      return <p>{state.message}</p>;
  }
}
```

## `null`과 `undefined` 반환 기준

`null`이나 `undefined`가 항상 나쁜 것은 아니다. 단, 의미가 명확해야 한다.

```ts
function findClip(clips: Clip[], clipId: string): Clip | undefined {
  return clips.find((clip) => clip.id === clipId);
}
```

위 함수에서 `undefined`는 "찾지 못함"이라는 자연스러운 의미를 가진다.

반면 비동기 요청 실패를 `null`로 반환하면 실패 이유가 사라질 수 있다.

```ts
async function loadClip(): Promise<Clip | null> {
  // null이 "없음"인지 "요청 실패"인지 모호할 수 있다.
}
```

선택 기준:

- 단순 조회에서 없음을 표현할 때는 `undefined` 또는 `null`을 사용할 수 있다.
- 실패 이유가 필요하면 Result 유니언을 사용한다.
- UI 상태는 Discriminated Union으로 모델링한다.
- 함수마다 실패 표현 방식을 섞지 않는다.

## 에러를 던질지 반환할지

에러를 던지는 방식:

```ts
async function fetchClipsOrThrow(): Promise<Clip[]> {
  const response = await fetch("/api/clips");

  if (!response.ok) {
    throw new Error("클립 목록 요청에 실패했습니다.");
  }

  return response.json();
}
```

Result를 반환하는 방식:

```ts
async function fetchClipsResult(): Promise<Result<Clip[]>> {
  try {
    return { ok: true, data: await fetchClipsOrThrow() };
  } catch {
    return { ok: false, error: "클립 목록 요청에 실패했습니다." };
  }
}
```

선택 기준:

- 호출부가 예외 흐름으로 처리하는 구조라면 throw를 사용할 수 있다.
- 화면에서 성공/실패 상태를 값으로 다루려면 Result가 편하다.
- 어떤 방식을 선택하든 한 계층 안에서는 일관성을 유지한다.

## 면접 답변 핵심

함수 반환 타입은 호출부와의 계약이다. 성공과 실패를 서로 다른 형태로 섞어 반환하면 호출부가 복잡해지고 실패 의미가 흐려진다. `ok`, `status`, `kind` 같은 판별 필드를 가진 유니언으로 반환 타입과 UI 상태를 모델링하면 잘못된 상태 조합을 줄이고 안전한 분기를 만들 수 있다.
