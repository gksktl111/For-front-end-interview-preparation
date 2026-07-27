# 유니언과 타입 좁히기

## 유니언 타입

유니언 타입은 값이 여러 타입 중 하나일 수 있음을 표현한다.

```ts
type ClipId = string | number;

function normalizeClipId(id: ClipId): string {
  return String(id);
}
```

유니언은 상태, 응답 결과, 옵션처럼 가능한 값의 범위가 정해져 있을 때 유용하다.

```ts
type ClipStatus = "draft" | "published" | "deleted";
```

## 타입 좁히기

타입 좁히기는 넓은 타입을 분기 조건 안에서 더 구체적인 타입으로 줄이는 것이다.

```ts
function formatValue(value: string | number) {
  if (typeof value === "string") {
    return value.trim();
  }

  return value.toFixed(2);
}
```

`if` 안에서는 `value`가 `string`으로 좁혀지고, 그 밖의 분기에서는 `number`로 좁혀진다.

## `typeof`

`typeof`는 원시 타입을 구분할 때 사용한다.

```ts
function toDisplayText(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return value ? "예" : "아니오";
}
```

주의할 점:

- `typeof null`은 `"object"`다.
- 배열도 `typeof`로는 `"object"`다.
- 객체 구조 확인에는 `typeof value === "object"`와 `value !== null`을 함께 확인한다.

## `in`

`in` 연산자는 객체에 특정 프로퍼티가 있는지 확인할 때 사용한다.

```ts
type Clip = {
  id: string;
  title: string;
};

type Folder = {
  id: string;
  name: string;
};

function getLabel(item: Clip | Folder): string {
  if ("title" in item) {
    return item.title;
  }

  return item.name;
}
```

`"title" in item` 조건 안에서는 `item`이 `Clip`으로 좁혀진다.

## 사용자 정의 타입 가드

반복되는 검증 로직은 사용자 정의 타입 가드로 분리할 수 있다.

```ts
type Clip = {
  id: string;
  title: string;
};

function isClip(value: unknown): value is Clip {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    typeof value.id === "string" &&
    typeof value.title === "string"
  );
}

function parseClip(value: unknown): Clip | null {
  if (isClip(value)) {
    return value;
  }

  return null;
}
```

`value is Clip`은 이 함수가 `true`를 반환하면 인자가 `Clip`이라고 볼 수 있다는 의미다.

## Discriminated Union

Discriminated Union은 공통 판별 필드를 가진 유니언 타입이다. 보통 `status`, `type`, `kind` 같은 필드를 사용한다.

```ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };
```

분기 처리:

```ts
function renderRequestState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "검색어를 입력하세요.";
    case "loading":
      return "불러오는 중입니다.";
    case "success":
      return `${state.data.length}개 결과`;
    case "error":
      return state.message;
  }
}
```

좋은 점:

- 상태별로 필요한 값만 가질 수 있다.
- 성공 상태에서만 `data`에 접근할 수 있다.
- 실패 상태에서만 `message`에 접근할 수 있다.
- 불가능한 상태 조합을 줄일 수 있다.

## 잘못된 상태 모델링

피해야 할 코드:

```ts
type RequestState = {
  isLoading: boolean;
  data?: string[];
  error?: string;
};
```

이 구조는 다음 같은 잘못된 상태를 허용한다.

```ts
const state: RequestState = {
  isLoading: true,
  data: ["React"],
  error: "실패했습니다.",
};
```

로딩 중이면서 데이터와 에러가 동시에 있는 상태가 가능해진다.

권장 방식:

```ts
type RequestState =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; message: string };
```

상태를 유니언으로 나누면 각 상태가 어떤 값을 가져야 하는지 명확해진다.

## 인터섹션 타입

인터섹션 타입은 여러 타입을 합친다.

```ts
type Identifiable = {
  id: string;
};

type Timestamped = {
  createdAt: string;
  updatedAt: string;
};

type Clip = Identifiable &
  Timestamped & {
    title: string;
  };
```

사용 기준:

- 공통 필드를 조합할 때 적합하다.
- 유니언은 "여러 가능성 중 하나"를 표현한다.
- 인터섹션은 "여러 조건을 모두 만족"해야 한다.
- 상태 분기에는 인터섹션보다 유니언이 더 자연스러운 경우가 많다.

## 빠진 분기 확인

유니언에 새 상태가 추가됐을 때 빠진 분기를 잡고 싶다면 `never`를 사용할 수 있다.

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderRequestState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "검색어를 입력하세요.";
    case "loading":
      return "불러오는 중입니다.";
    case "success":
      return `${state.data.length}개 결과`;
    case "error":
      return state.message;
    default:
      return assertNever(state);
  }
}
```

## 면접 답변 핵심

유니언은 값이 여러 형태 중 하나일 수 있음을 표현한다. 안전하게 사용하려면 `typeof`, `in`, 사용자 정의 타입 가드, 판별 필드 등을 이용해 타입을 좁힌 뒤 각 타입에 맞는 속성에 접근해야 한다. 특히 상태 모델링에서는 Discriminated Union을 사용하면 불가능한 상태 조합을 타입으로 막을 수 있다.
