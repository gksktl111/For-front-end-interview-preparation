# 제네릭, interface, type

## 제네릭 기초

제네릭은 타입을 사용하는 시점에 전달할 수 있게 해주는 문법이다. 같은 로직을 여러 타입에 재사용하면서도 타입 정보를 잃지 않게 해준다.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = first(["Minkyu", "React"]);
const firstCount = first([1, 2, 3]);
```

`firstName`은 `string | undefined`, `firstCount`는 `number | undefined`로 추론된다.

## 제네릭이 필요한 이유

`any`로 만들면 재사용은 가능하지만 타입 정보를 잃는다.

```ts
function first(items: any[]): any {
  return items[0];
}

const value = first(["React"]);
value.toFixed(2); // 타입 오류를 잡지 못한다.
```

제네릭을 사용하면 입력 타입과 반환 타입의 관계를 유지할 수 있다.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

핵심은 단순히 "아무 타입이나 받기"가 아니라 "입력과 출력의 타입 관계를 표현하기"다.

## 제네릭 타입 별칭

반복되는 응답 형태도 제네릭으로 표현할 수 있다.

```ts
type ApiResponse<T> = {
  data: T;
  requestedAt: string;
};

type Clip = {
  id: string;
  title: string;
};

type ClipResponse = ApiResponse<Clip>;
type ClipListResponse = ApiResponse<Clip[]>;
```

Result 타입도 제네릭과 잘 어울린다.

```ts
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
```

## 제네릭 제약

타입 파라미터가 특정 구조를 가져야 한다면 `extends`로 제약을 줄 수 있다.

```ts
type Identifiable = {
  id: string;
};

function findById<T extends Identifiable>(
  items: T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}
```

`T`는 어떤 타입이든 될 수 있지만, 최소한 `id: string`은 가져야 한다.

## `interface`

`interface`는 객체의 형태를 정의할 때 자주 사용한다.

```ts
interface User {
  id: string;
  name: string;
}
```

확장:

```ts
interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

interface Clip extends Timestamped {
  id: string;
  title: string;
}
```

`interface`는 객체 모델이 확장되는 구조에서 읽기 쉽다.

## `type`

`type`은 타입 별칭을 만든다. 객체 타입뿐 아니라 유니언, 인터섹션, 함수 타입, 튜플, 원시값 조합을 표현할 수 있다.

```ts
type ClipStatus = "idle" | "loading" | "success" | "error";

type Point = [number, number];

type ClickHandler = (event: MouseEvent) => void;
```

객체 타입도 표현할 수 있다.

```ts
type Clip = {
  id: string;
  title: string;
};
```

## 실무적 사용 기준

| 상황 | 우선 고려 |
| --- | --- |
| 확장 가능한 객체 모델 | `interface` |
| 유니언 타입 | `type` |
| 인터섹션 조합 | `type` |
| 함수 타입 별칭 | `type` |
| 튜플 | `type` |
| React props | 팀 컨벤션 우선 |

React props는 둘 다 가능하다.

```tsx
interface ClipCardProps {
  title: string;
  isFavorite: boolean;
}

function ClipCard({ title, isFavorite }: ClipCardProps) {
  return <article>{title}</article>;
}
```

유니언 props가 필요하면 `type`이 자연스럽다.

```tsx
type ButtonProps =
  | { variant: "link"; href: string; onClick?: never }
  | { variant: "button"; onClick: () => void; href?: never };
```

## `interface`와 `type`을 섞을 때 기준

중요한 것은 둘 중 하나만 쓰는 것이 아니라 기준을 일관되게 유지하는 것이다.

권장 기준 예시:

- 도메인 객체는 `interface`
- 상태 유니언은 `type`
- API Result, 옵션 유니언은 `type`
- 확장 목적이 분명한 객체는 `interface extends`
- 조합 타입은 `type`과 인터섹션

```ts
interface Clip {
  id: string;
  title: string;
}

type ClipsState =
  | { status: "loading" }
  | { status: "success"; clips: Clip[] }
  | { status: "error"; message: string };
```

## 과한 제네릭 피하기

제네릭은 타입 관계를 표현할 때 유용하지만, 필요 없는 제네릭은 코드를 어렵게 만든다.

이점이 작은 예:

```ts
function wrap<T>(value: T): { value: T } {
  return { value };
}
```

이 코드는 틀린 코드는 아니지만, 호출부에서 타입 관계를 얻는 이점이 크지 않다면 단순한 타입이 더 읽기 쉽다.

좋은 제네릭 사용:

```ts
function mapById<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
```

입력 배열의 요소 타입 `T`가 반환 객체의 값 타입으로 이어진다.

## 면접 답변 핵심

제네릭은 입력과 출력의 타입 관계를 보존하면서 로직을 재사용하기 위한 문법이다. `interface`와 `type`은 둘 다 객체 타입을 표현할 수 있지만, 확장 가능한 객체 모델은 `interface`, 유니언이나 인터섹션, 함수 타입, 튜플 같은 조합은 `type`이 더 자연스럽다. 실무에서는 팀 컨벤션과 일관성을 우선한다.
