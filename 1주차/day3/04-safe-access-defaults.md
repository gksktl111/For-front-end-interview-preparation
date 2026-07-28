# 안전한 접근과 기본값 처리

## Optional Chaining

Optional Chaining은 중간 값이 `null` 또는 `undefined`일 수 있을 때 안전하게 접근하는 문법이다.

```js
const folderName = clip.folder?.name;
```

`clip.folder`가 없으면 에러를 던지지 않고 `undefined`를 반환한다.

메서드 호출에도 사용할 수 있다.

```js
const normalizedTitle = clip.title?.trim();
```

주의할 점:

- Optional Chaining은 `null` 또는 `undefined` 접근 에러를 막기 위한 문법이다.
- 값이 반드시 있어야 하는 상황에서 무조건 `?.`를 붙이면 데이터 문제를 늦게 발견할 수 있다.
- 없어도 되는 값인지, 반드시 있어야 하는 값인지 먼저 구분해야 한다.

## Nullish Coalescing

Nullish Coalescing은 값이 `null` 또는 `undefined`일 때만 기본값을 사용한다.

```js
const pageSize = userSetting.pageSize ?? 20;
```

`0`, `""`, `false`는 기본값으로 대체되지 않는다.

## Truthy와 Falsy

JavaScript 조건문에서는 Boolean이 아닌 값도 참/거짓처럼 평가된다.

Falsy 값:

```text
false, 0, -0, 0n, "", null, undefined, NaN
```

나머지 대부분의 값은 Truthy다.

## `||`와 `??`

`||`는 왼쪽 값이 Falsy이면 오른쪽 값을 사용한다. `??`는 왼쪽 값이 `null` 또는 `undefined`일 때만 오른쪽 값을 사용한다.

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
- 모든 Falsy 값을 기본값으로 대체하고 싶을 때만 `||`를 사용한다.
- 페이지 번호, 검색어, 표시 개수, 토글 값 기본값에는 `??`가 더 안전한 경우가 많다.

## 실무 예시

페이지 번호:

```ts
const page = query.page ?? 1;
```

검색어:

```ts
const keyword = query.keyword ?? "";
```

표시 개수:

```ts
const pageSize = userSetting.pageSize ?? 20;
```

boolean 설정:

```ts
const showArchived = userSetting.showArchived ?? false;
```

위 값들은 `0`, `""`, `false`가 유효할 수 있으므로 `||`보다 `??`가 의도를 더 정확하게 표현한다.
