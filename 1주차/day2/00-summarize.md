# Day 2 빠른 복습 정리

## 1. Event Loop

JavaScript는 기본적으로 하나의 Call Stack에서 동기 코드를 순서대로 실행한다. 타이머, 네트워크 요청, DOM 이벤트 같은 작업은 브라우저의 Web API에 맡기고, 완료된 콜백은 Queue에서 대기한다.

실행 순서 판단 기준:

1. 동기 코드를 위에서 아래로 먼저 실행한다.
2. `Promise.then`, `catch`, `finally`, `await` 이후 코드는 Microtask Queue로 간다.
3. `setTimeout`, `setInterval`, DOM 이벤트 콜백은 Task Queue로 간다.
4. 동기 코드가 끝나면 Microtask Queue를 모두 비운다.
5. 그 다음 Task Queue에서 작업을 하나 실행한다.
6. Task 하나가 끝나면 다시 Microtask Queue를 확인한다.

핵심:

- `setTimeout(..., 0)`은 즉시 실행이 아니라 Task Queue로 미루는 것이다.
- Promise 콜백은 동기 코드보다 먼저 실행되지 않는다.
- 동기 코드가 끝난 뒤에는 Task보다 Microtask가 먼저 실행된다.
- Microtask가 계속 추가되면 Task와 렌더링이 지연될 수 있다.
- Call Stack을 오래 점유하는 동기 작업은 화면 렌더링과 사용자 입력도 막는다.

예상 출력:

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");
```

```text
A
D
C
B
```

## 2. Promise

Promise는 비동기 작업의 상태와 결과를 표현하는 객체다. 비동기 함수 자체가 아니라, 나중에 완료될 작업의 성공값이나 실패 원인을 담는 약속이다.

상태:

| 상태 | 의미 |
| --- | --- |
| `pending` | 아직 완료되지 않음 |
| `fulfilled` | 성공 |
| `rejected` | 실패 |

핵심:

- Promise는 한 번 `fulfilled` 또는 `rejected`가 되면 다시 바뀌지 않는다.
- `then`은 성공 결과를 처리한다.
- `catch`는 실패 결과를 처리한다.
- `finally`는 성공/실패와 관계없이 마지막 정리 작업에 사용한다.
- `then`, `catch`, `finally`는 새 Promise를 반환하므로 체이닝할 수 있다.
- `Promise.resolve(value)`는 값을 성공한 Promise로 감싼다.
- 이미 fulfilled된 Promise라도 `then` 콜백은 즉시 실행되지 않고 Microtask Queue에서 실행된다.

## 3. async / await

`async` 함수는 항상 Promise를 반환한다. 일반 값을 반환해도 fulfilled Promise로 감싸지고, 함수 안에서 에러를 던지면 rejected Promise가 된다.

`await`는 Promise가 끝날 때까지 현재 `async` 함수의 나머지 실행을 잠시 멈춘다.

핵심:

- `await`는 JavaScript 전체를 멈추는 것이 아니다.
- 현재 `async` 함수의 이후 코드만 중단된다.
- `await` 이후 코드는 Microtask로 다시 실행된다.
- `await`한 Promise가 실패하면 그 위치에서 에러가 발생한 것처럼 동작한다.

```js
async function run() {
  console.log("B");
  await Promise.resolve();
  console.log("D");
}

console.log("A");
run();
console.log("C");
```

```text
A
B
C
D
```

## 4. 비동기 에러 처리

동기 에러는 현재 Call Stack에서 바로 발생하므로 `try/catch`로 잡을 수 있다. Promise의 실패는 `rejected` 상태로 표현되므로 `await + try/catch` 또는 `.catch()`로 처리해야 한다.

잘못된 예:

```js
try {
  loadData();
} catch (error) {
  console.error(error);
}
```

`loadData()`가 Promise를 반환하면, 나중에 발생한 rejection은 바깥 `try/catch`가 잡지 못할 수 있다.

올바른 예:

```js
try {
  await loadData();
} catch (error) {
  console.error(error);
}
```

또는:

```js
loadData().catch((error) => {
  console.error(error);
});
```

핵심:

- `try/catch`는 현재 실행 흐름의 에러를 잡는다.
- Promise 실패를 잡으려면 Promise를 기다리거나 `.catch()`를 연결해야 한다.
- 처리하지 않은 Promise 실패는 Unhandled Promise Rejection이 된다.

## 5. 순차 실행과 병렬 실행

앞 작업의 결과가 다음 작업에 필요하면 순차 실행한다.

```js
const user = await fetchUser();
const clips = await fetchClips(user.id);
```

서로 독립적인 작업이면 병렬 실행을 고려한다.

```js
const [user, clips] = await Promise.all([
  fetchUser(),
  fetchClips(),
]);
```

선택 기준:

- 의존성이 있으면 순차 `await`
- 독립적이면 `Promise.all`
- 모든 작업이 성공해야 하면 `Promise.all`
- 일부 실패해도 결과를 각각 확인해야 하면 `Promise.allSettled`
- `Promise.all`에서 하나가 실패해도 이미 시작된 다른 작업이 자동 취소되지는 않는다.
- 너무 많은 요청을 한 번에 병렬 실행하면 서버 부하가 커질 수 있다.

## 6. fetch 에러 처리

`fetch`는 네트워크 요청 자체가 실패했을 때 주로 rejected Promise가 된다. 서버가 `400`, `404`, `500` 같은 HTTP 오류 응답을 보내도 응답 자체가 도착했다면 Promise는 fulfilled 상태가 된다.

따라서 HTTP 오류는 직접 검사해야 한다.

```js
const response = await fetch("/api/clips");

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}

const data = await response.json();
```

구분:

- 네트워크 오류: `catch`로 이동할 수 있음
- 요청 취소: `AbortError`로 reject될 수 있음
- HTTP 오류 응답: `response.ok`를 직접 확인해야 함

## 7. 레이스 컨디션

비동기 요청은 시작 순서와 완료 순서가 다를 수 있다. 오래된 요청이 나중에 완료되면 최신 상태나 UI를 덮어쓸 수 있는데, 이것이 비동기 요청 레이스 컨디션이다.

예:

```text
react 검색 요청 시작
javascript 검색 요청 시작
javascript 응답 먼저 도착
javascript 결과 표시
react 응답 늦게 도착
오래된 react 결과가 화면을 덮어씀
```

방지 방법:

- 요청 번호를 부여하고 최신 요청의 응답만 반영한다.
- 새 요청이 이전 요청을 대체하면 `AbortController`로 이전 요청을 취소한다.
- React에서는 Effect cleanup에서 이전 요청을 정리한다.

요청 번호 방식:

```js
let latestRequestId = 0;

async function search(keyword) {
  const requestId = ++latestRequestId;
  const result = await fetchSearchResult(keyword);

  if (requestId !== latestRequestId) {
    return;
  }

  render(result);
}
```

## 8. AbortController

`AbortController`는 진행 중인 요청에 취소 신호를 보내는 도구다. 주로 `fetch`에 `signal`을 전달해서 사용한다.

```js
const controller = new AbortController();

fetch("/api/clips", {
  signal: controller.signal,
});

controller.abort();
```

핵심:

- `controller.signal`을 요청에 전달해야 취소할 수 있다.
- `controller.abort()`를 호출하면 연결된 요청이 취소된다.
- 취소된 `fetch`는 `AbortError`로 rejected될 수 있다.
- `AbortError`는 의도된 취소이므로 일반 서버 에러와 구분해야 한다.
- 검색어 변경, 탭 변경, 컴포넌트 unmount처럼 이전 요청 결과가 필요 없어질 때 유용하다.

React Effect에서의 흐름:

```text
이전 요청 시작
의존성 변경
이전 Effect cleanup 실행
이전 요청 abort
새 Effect 실행
새 요청 시작
최신 결과만 반영
```

## 9. 로딩, 에러, 재시도

비동기 요청은 데이터뿐 아니라 상태도 함께 관리해야 한다.

기본 상태:

```text
idle → loading → success
idle → loading → error
```

핵심:

- 요청 시작 시 로딩 상태를 켠다.
- 요청 성공 시 데이터를 반영한다.
- 요청 실패 시 에러 상태를 반영한다.
- `finally`는 로딩 종료 같은 공통 정리에 적합하다.
- 요청 취소는 사용자에게 보여줄 오류가 아닐 수 있다.
- 조회 요청은 제한적인 재시도가 가능하다.
- 생성, 결제 요청은 중복 처리 위험이 있으므로 자동 재시도에 주의한다.

## 10. React Query / TanStack Query 관점

직접 요청 상태, 캐시, 중복 요청, 재시도를 모두 관리하면 복잡해진다. TanStack Query는 서버 상태를 query key 기준으로 관리한다.

핵심:

- `queryKey`는 조회 조건을 식별하는 키다.
- 검색어, 필터, id 같은 조건은 `queryKey`에 포함해야 한다.
- `queryKey`가 다르면 캐시가 분리된다.
- 캐시가 분리되면 오래된 응답이 다른 조건의 현재 데이터를 덮어쓰는 문제를 줄일 수 있다.
- `queryKey` 변경이 요청 완료 순서를 보장하는 것은 아니다.
- 이전 요청을 실제로 취소하려면 `queryFn`이 받은 `signal`을 요청 함수에 전달해야 한다.

## 면접 직전 체크

- Promise 콜백과 `setTimeout` 중 무엇이 먼저인가?
  - 동기 코드 이후 Promise Microtask가 먼저다.
- `try/catch`가 Promise 에러를 못 잡는 경우는?
  - Promise를 `await`하지 않거나 `.catch()`를 연결하지 않은 경우다.
- `fetch`의 500 응답은 왜 `catch`로 가지 않는가?
  - HTTP 응답 자체는 정상 도착했기 때문에 fulfilled 상태가 된다.
- 레이스 컨디션은 왜 생기는가?
  - 요청 시작 순서와 완료 순서가 다를 수 있기 때문이다.
- `AbortController`는 무엇을 해결하는가?
  - 더 이상 필요 없는 진행 중 요청을 취소한다.
- `Promise.all`과 `allSettled` 차이는?
  - `all`은 하나라도 실패하면 전체 실패, `allSettled`는 모든 성공/실패 결과를 각각 확인한다.
