# TypeScript 타입 시스템 기본

## TypeScript의 컴파일 타임 역할

TypeScript는 JavaScript 코드에 타입 검사를 더해주는 언어다. 핵심 역할은 코드를 실행하기 전에 타입 오류 가능성을 찾는 것이다.

```ts
function formatTitle(title: string) {
  return title.trim();
}

formatTitle("React"); // 정상
formatTitle(123); // 타입 오류
```

중요한 점은 TypeScript가 런타임 검증 도구가 아니라는 것이다. TypeScript 타입은 개발 중 검사에 사용되고, 일반적으로 JavaScript로 변환된 뒤에는 사라진다.

```ts
type User = {
  id: string;
  name: string;
};

const user = JSON.parse(localStorage.getItem("user") ?? "{}") as User;
```

위 코드는 TypeScript에게 `user`를 `User`로 보라고 알려줄 뿐이다. 실제 로컬스토리지 값이 `User` 구조인지 확인하지 않는다.

## 타입 선언과 런타임 값

타입 선언은 코드가 어떤 값을 기대하는지 표현한다. 하지만 외부에서 들어오는 값은 선언과 다를 수 있다.

외부 입력 예시:

- API 응답
- 사용자 입력
- URL 파라미터
- 로컬스토리지
- `postMessage`로 받은 데이터
- 서드파티 라이브러리에서 넘어오는 값

이 값들은 TypeScript 타입만으로 안전하다고 볼 수 없다. 실제 구조를 확인하려면 런타임 검증 코드나 검증 라이브러리가 필요하다.

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
```

## 타입 추론

TypeScript는 값을 보고 타입을 자동으로 추론한다.

```ts
const title = "TypeScript"; // string
const count = 10; // number
const tags = ["react", "typescript"]; // string[]
```

추론이 명확한 지역 변수에는 타입을 반복해서 적지 않아도 된다.

```ts
const clipCount = clips.length;
```

반대로 함수 파라미터, 외부 API 경계, 복잡한 반환 타입은 명시하는 편이 좋다.

```ts
type Clip = {
  id: string;
  title: string;
};

function findClip(clips: Clip[], clipId: string): Clip | undefined {
  return clips.find((clip) => clip.id === clipId);
}
```

## 타입 단언

타입 단언은 TypeScript에게 "이 값을 이 타입으로 취급하라"고 알려주는 문법이다.

```ts
const input = document.querySelector("#title") as HTMLInputElement;
```

주의할 점:

- 타입 단언은 런타임 검사를 수행하지 않는다.
- 잘못 단언해도 TypeScript는 믿고 넘어갈 수 있다.
- 확실하지 않은 외부 값에는 단언보다 검증이 먼저다.

```ts
const value = JSON.parse('{"count":"wrong"}') as { count: number };

console.log(value.count.toFixed(2)); // 런타임 오류 가능
```

## `any`

`any`는 타입 검사를 사실상 끄는 타입이다.

```ts
function printTitle(data: any) {
  console.log(data.title.toUpperCase());
}
```

문제점:

- 존재하지 않는 속성 접근을 막지 못한다.
- 잘못된 함수 호출을 막지 못한다.
- 타입 오류가 호출부로 퍼진다.
- TypeScript를 사용하는 이유가 약해진다.

`any`가 필요한 순간이 있더라도 범위를 좁게 유지해야 한다.

## `unknown`

`unknown`은 아직 타입을 모르는 값을 표현한다. `any`와 달리 바로 사용할 수 없다.

```ts
function printTitle(data: unknown) {
  console.log(data.title);
  // 타입 오류: data가 어떤 값인지 아직 모른다.
}
```

사용하려면 먼저 타입을 좁혀야 한다.

```ts
function printTitle(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "title" in data &&
    typeof data.title === "string"
  ) {
    console.log(data.title.toUpperCase());
  }
}
```

실무 기준:

- 외부에서 들어온 값은 일단 `unknown`으로 받고 검증한다.
- 검증이 끝난 뒤 구체적인 타입으로 좁힌다.
- `catch (error)`의 error도 안전하게 다루려면 `unknown`처럼 접근한다.

## `never`

`never`는 발생할 수 없는 값을 나타낸다. 주로 모든 유니언 분기를 처리했는지 확인할 때 사용한다.

```ts
type Status = "idle" | "loading" | "success";

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function getStatusLabel(status: Status): string {
  switch (status) {
    case "idle":
      return "대기";
    case "loading":
      return "로딩 중";
    case "success":
      return "완료";
    default:
      return assertNever(status);
  }
}
```

나중에 `Status`에 `"error"`를 추가하고 `switch`에 처리를 빠뜨리면 `assertNever(status)` 위치에서 타입 오류를 확인할 수 있다.

## 선택 기준

| 상황 | 권장 타입 |
| --- | --- |
| 값의 타입을 명확히 알고 있음 | 구체적인 타입 |
| 외부에서 들어온 아직 모르는 값 | `unknown` |
| 타입 검사를 의도적으로 우회해야 함 | 제한된 범위의 `any` |
| 도달할 수 없는 분기 확인(완전성 검사) | `never` |

## 면접 답변 핵심

TypeScript는 컴파일 타임에 타입 오류 가능성을 줄여주는 도구다. 하지만 API 응답이나 사용자 입력이 실제로 타입 선언과 같은지는 런타임에서 자동으로 확인하지 않는다. 따라서 외부 입력은 `unknown`으로 받고 타입 가드나 검증 로직으로 좁힌 뒤 사용하는 것이 안전하다.
