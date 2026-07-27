# Day 4 빠른 복습 정리

## 학습 목표

- TypeScript가 런타임 검증 도구가 아니라는 점을 이해한다.
- 유니언과 타입 좁히기를 이용해 안전한 분기를 만든다.
- 일관된 반환 타입으로 잘못된 상태를 줄인다.

## 상세 개념 파일

- [TypeScript 타입 시스템 기본](./typescript-type-system.md)
- [유니언과 타입 좁히기](./union-narrowing.md)
- [반환 타입과 상태 모델링](./return-type-state-modeling.md)
- [제네릭, interface, type](./generics-interface-type.md)

## 실행 예시

- [`unknown`으로 에러 처리](../../playgrounds/ts/1주차/day4/01-error-unknown.ts)
- [Discriminated Union](../../playgrounds/ts/1주차/day4/02-api-result-discriminated-union.ts)
- [비동기 상태 모델링](../../playgrounds/ts/1주차/day4/03-async-state.ts)
- [Exhaustive Check](../../playgrounds/ts/1주차/day4/04-exhaustive-check.ts)
- [Validation 반환 타입](../../playgrounds/ts/1주차/day4/05-validation-result.ts)

```bash
npx nodemon playgrounds/ts/1주차/day4/01-error-unknown.ts
npx nodemon playgrounds/ts/1주차/day4/02-api-result-discriminated-union.ts
npx nodemon playgrounds/ts/1주차/day4/03-async-state.ts
npx nodemon playgrounds/ts/1주차/day4/04-exhaustive-check.ts
npx nodemon playgrounds/ts/1주차/day4/05-validation-result.ts
```

## 1. TypeScript의 역할

TypeScript는 코드를 실행하기 전에 타입 오류 가능성을 찾아주는 정적 타입 검사 도구다. 런타임에 들어온 데이터가 실제로 안전한지 자동으로 검증하지는 않는다.

```ts
type User = {
  id: string;
  name: string;
};

async function loadUser(): Promise<User> {
  const response = await fetch("/api/user");
  return response.json();
}
```

위 함수의 반환 타입이 `Promise<User>`라고 해도 서버 응답이 실제로 `User` 구조인지 런타임에서 보장되지는 않는다. 외부 입력은 별도의 검증이 필요하다.

핵심:

- TypeScript는 컴파일 타임에 타입을 검사한다.
- 타입 정보는 일반적으로 JavaScript로 변환되면서 사라진다.
- API 응답, URL 파라미터, 로컬스토리지, 사용자 입력은 런타임 검증 대상이다.
- 타입 선언은 약속이고, 런타임 검증은 실제 확인이다.

## 2. 타입 추론과 명시적 타입

TypeScript는 초기값과 사용 흐름을 보고 타입을 추론한다.

```ts
const title = "React State"; // string
const count = 3; // number
const isDone = false; // boolean
```

추론이 충분히 명확하면 타입을 반복해서 적지 않아도 된다. 다만 함수의 외부 계약, API 응답, 복잡한 객체, 반환 타입은 명시하는 편이 안전하다.

```ts
function formatClipTitle(title: string): string {
  return title.trim();
}
```

선택 기준:

- 지역 변수는 추론을 우선한다.
- 함수 파라미터는 명시한다.
- 외부에서 호출되는 함수의 반환 타입은 명시하면 변경 실수를 줄일 수 있다.
- 복잡한 데이터 구조는 타입 별칭이나 인터페이스로 분리한다.

## 3. `any`, `unknown`, `never`

| 타입 | 의미 | 실무 기준 |
| --- | --- | --- |
| `any` | 타입 검사를 사실상 끈다 | 가능한 피한다 |
| `unknown` | 아직 모르는 값 | 좁힌 뒤 사용한다 |
| `never` | 발생할 수 없는 값 | 빠진 분기 검사에 사용한다 |

`any`는 어떤 속성 접근이나 함수 호출도 허용하기 때문에 TypeScript의 보호를 잃는다.

```ts
function printTitle(data: any) {
  console.log(data.title.toUpperCase());
}
```

`unknown`은 바로 사용할 수 없고 먼저 검사해야 한다.

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

## 4. 유니언과 타입 좁히기

유니언 타입은 값이 여러 타입 중 하나일 수 있음을 표현한다.

```ts
type ClipStatus = "idle" | "loading" | "success" | "error";
```

유니언을 사용할 때는 분기 안에서 타입을 좁혀야 안전하게 사용할 수 있다.

```ts
type SearchResult =
  | { status: "success"; items: string[] }
  | { status: "error"; message: string };

function renderResult(result: SearchResult) {
  if (result.status === "success") {
    return result.items.join(", ");
  }

  return result.message;
}
```

좁히기 도구:

- `typeof`: 원시 타입 구분
- `in`: 객체에 특정 프로퍼티가 있는지 확인
- 사용자 정의 타입 가드: 반복되는 검증 로직을 함수로 분리
- Discriminated Union: 공통 판별 필드로 상태를 구분

## 5. 인터섹션 타입

인터섹션 타입은 여러 타입을 합쳐서 모두 만족하는 타입을 만든다.

```ts
type Clip = {
  id: string;
  title: string;
};

type Timestamped = {
  createdAt: string;
  updatedAt: string;
};

type ClipWithTimestamp = Clip & Timestamped;
```

주의할 점:

- 인터섹션은 "둘 중 하나"가 아니라 "둘 다"다.
- 객체 타입 조합에는 유용하지만, 무리하게 겹치면 읽기 어려워질 수 있다.
- 상태 분기에는 보통 인터섹션보다 유니언이 더 적합하다.

## 6. 반환 타입과 잘못된 상태 줄이기

성공과 실패가 섞이는 함수는 반환 타입을 일관되게 설계해야 한다.

피해야 할 코드:

```ts
async function loadClips() {
  try {
    return await fetchClips();
  } catch {
    return null;
  }
}
```

호출부는 배열인지 `null`인지 매번 확인해야 한다. 실패 이유도 사라진다.

권장 방식:

```ts
type LoadClipsResult =
  | { ok: true; data: Clip[] }
  | { ok: false; error: string };

async function loadClips(): Promise<LoadClipsResult> {
  try {
    return { ok: true, data: await fetchClips() };
  } catch {
    return { ok: false, error: "클립 목록을 불러오지 못했습니다." };
  }
}
```

좋은 점:

- 호출부가 `ok` 기준으로 안전하게 분기할 수 있다.
- 성공 데이터와 실패 정보가 동시에 존재하는 잘못된 상태를 막을 수 있다.
- 함수의 외부 계약이 명확해진다.

## 7. 제네릭 기초

제네릭은 타입을 함수나 타입을 사용하는 시점에 전달할 수 있게 해준다.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstTitle = first(["React", "TypeScript"]);
const firstCount = first([1, 2, 3]);
```

핵심:

- `T`는 타입을 담는 파라미터다.
- 같은 로직을 여러 타입에 재사용할 수 있다.
- 타입을 너무 넓게 만들면 오히려 호출부가 불편해진다.
- 제네릭은 타입 관계를 표현할 때 사용한다.

## 8. `interface`와 `type`의 실무 기준

둘 다 객체 타입을 표현할 수 있다.

```ts
interface User {
  id: string;
  name: string;
}

type ClipStatus = "idle" | "loading" | "success" | "error";
```

실무 기준:

- 객체 모델을 확장 가능하게 표현할 때는 `interface`가 자연스럽다.
- 유니언, 인터섹션, 함수 타입, 튜플, 원시값 조합은 `type`이 적합하다.
- 팀이나 프로젝트 컨벤션이 있으면 일관성을 우선한다.
- React props는 둘 다 가능하지만, 유니언 props가 필요하면 `type`이 편하다.

## 프로젝트 연결 점검

다음 코드를 찾으면 day4 개념으로 설명하고 개선할 수 있어야 한다.

- API 응답을 타입 단언만 하고 검증하지 않는 코드
- `any`로 에러를 숨기는 코드
- 성공/실패 반환 형태가 매번 다른 함수
- `status`, `type`, `kind` 같은 판별 필드 없이 복잡하게 분기하는 상태
- `interface`와 `type`을 기준 없이 섞어 쓰는 코드

## 면접 직전 체크

- TypeScript 타입은 런타임에도 남아 있는가?
  - 아니다. 일반적으로 JavaScript로 변환되면서 타입 정보는 사라진다.
- `any`와 `unknown`의 차이는?
  - `any`는 타입 검사를 우회하고, `unknown`은 타입을 좁히기 전까지 사용할 수 없다.
- Discriminated Union이 왜 유용한가?
  - 공통 판별 필드로 안전하게 분기할 수 있고, 성공/실패 같은 상태를 명확하게 표현할 수 있다.
- `never`는 언제 쓰는가?
  - 도달할 수 없는 값이나 빠진 유니언 분기를 검사할 때 쓴다.
- `interface`와 `type`은 어떻게 선택하는가?
  - 객체 확장 모델은 `interface`, 유니언/인터섹션/함수 타입 조합은 `type`을 우선 고려한다.

## 완료 조건

- [ ] TypeScript가 런타임 검증을 대신하지 않는다는 점을 설명할 수 있다.
- [ ] `any`, `unknown`, `never`의 차이를 코드로 구분할 수 있다.
- [ ] 유니언과 타입 좁히기로 안전한 분기를 만들 수 있다.
- [ ] 일관된 반환 타입으로 성공/실패 상태를 모델링할 수 있다.
- [ ] `interface`와 `type`의 선택 기준을 설명할 수 있다.
