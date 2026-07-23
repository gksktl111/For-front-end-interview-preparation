# Promise와 비동기 에러 처리

## Promise

- Promise는 비동기 작업의 상태와 결과를 표현하는 JavaScript 객체다.
- 비동기 함수 자체를 의미하는 것이 아니라, 나중에 완료될 작업의 성공값이나 실패 원인을 나타낸다.

```js
const promise = fetch("/api/clips");
```

- `fetch`는 응답 데이터를 즉시 반환하지 않는다.
- 호출 즉시 Promise를 반환하고, 네트워크 요청이 완료되면 Promise의 상태가 결정된다.

## Promise 상태

Promise는 다음 세 가지 상태 중 하나를 가진다.

| 상태 | 의미 |
| --- | --- |
| `pending` | 작업이 아직 완료되지 않은 상태 |
| `fulfilled` | 작업이 성공한 상태 |
| `rejected` | 작업이 실패한 상태 |

```text
pending
├─ 성공 → fulfilled
└─ 실패 → rejected
```

- Promise가 한 번 성공하거나 실패하면 다시 상태가 변경되지 않는다.
- `fulfilled`와 `rejected`를 합쳐 settled 상태라고 한다.

## `Promise.resolve`

- `Promise.resolve`는 값을 성공한 Promise로 감싸는 메서드다.
- 실제 비동기 작업을 실행하는 것은 아니다.

```js
const promise = Promise.resolve("hello");
```

위 Promise는 이미 다음 상태다.

```text
상태: fulfilled
결과값: "hello"
```

하지만 `then` 콜백은 즉시 실행되지 않고 Microtask Queue에 등록된다.

```js
console.log("A");

Promise.resolve("hello").then((value) => {
  console.log(value);
});

console.log("B");
```

출력 순서는 다음과 같다.

```text
A
B
hello
```

## `then`, `catch`, `finally`

### `then`

- Promise가 성공했을 때 실행할 콜백을 등록한다.
- 성공 결과를 콜백의 인수로 전달받는다.
- `then`은 기존 Promise 자체가 아니라 새로운 Promise를 반환하므로 체이닝이 가능하다.

```js
Promise.resolve("hello").then((value) => {
  console.log(value);
});
```

### `catch`

- Promise가 실패했을 때 에러를 처리한다.
- Promise 체인 중간에서 발생한 에러도 처리할 수 있다.

```js
fetchUser()
  .then((user) => fetchClips(user.id))
  .catch((error) => {
    console.error(error);
  });
```

### `finally`

- 성공과 실패 여부에 관계없이 마지막에 실행된다.
- 로딩 상태 해제와 같은 공통 정리 작업에 적합하다.

```js
setLoading(true);

fetchUser()
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    setLoading(false);
  });
```

## `async`

- `async` 함수는 항상 Promise를 반환한다.
- 일반 값을 반환해도 성공한 Promise로 감싸진다.

```js
async function getMessage() {
  return "hello";
}

const result = getMessage();
```

위 코드는 개념적으로 다음과 비슷하다.

```js
function getMessage() {
  return Promise.resolve("hello");
}
```

- `async` 함수 안에서 에러를 던지면 반환된 Promise는 `rejected` 상태가 된다.

```js
async function loadData() {
  throw new Error("load failed");
}
```

## `await`

- `await`는 Promise가 완료될 때까지 현재 `async` 함수의 실행을 잠시 중단한다.
- Promise가 성공하면 결과값을 반환한다.
- Promise가 실패하면 해당 위치에서 에러가 발생한 것처럼 동작한다.

```js
async function loadUser() {
  const user = await fetchUser();

  console.log(user);
}
```

- `await`가 JavaScript 전체 실행을 멈추는 것은 아니다.
- 현재 `async` 함수의 나머지 실행만 중단된다.

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

출력 순서는 다음과 같다.

```text
A
B
C
D
```

- `await` 이후 코드는 Microtask를 통해 다시 실행된다.

## `.then`과 `async/await`

- `.then`, `.catch`와 `async/await`는 모두 Promise를 기반으로 동작한다.
- `async/await`는 Promise 체인을 동기 코드처럼 읽기 쉽게 작성하는 문법이다.

다음 두 코드는 비슷한 흐름을 가진다.

```js
fetchUser()
  .then((user) => fetchClips(user.id))
  .then((clips) => {
    console.log(clips);
  })
  .catch((error) => {
    console.error(error);
  });
```

```js
async function loadData() {
  try {
    const user = await fetchUser();
    const clips = await fetchClips(user.id);

    console.log(clips);
  } catch (error) {
    console.error(error);
  }
}
```

## 동기 에러와 비동기 에러

### 동기 에러

- 현재 Call Stack에서 즉시 발생하는 에러다.
- 일반적인 `try/catch`로 처리할 수 있다.

```js
try {
  throw new Error("sync failed");
} catch (error) {
  console.error(error);
}
```

### 비동기 에러

- Promise의 실패는 `rejected` 상태로 표현된다.
- `catch`를 연결하거나 `await`과 `try/catch`를 사용해야 한다.

다음 코드는 에러를 처리하지 못한다.

```js
async function loadData() {
  throw new Error("load failed");
}

try {
  loadData();
} catch (error) {
  console.error(error);
}
```

- `loadData()`는 에러를 바로 던지는 것이 아니라 실패한 Promise를 반환한다.
- 따라서 Promise를 기다려야 에러를 처리할 수 있다.

```js
async function run() {
  try {
    await loadData();
  } catch (error) {
    console.error(error);
  }
}
```

또는 다음처럼 처리한다.

```js
loadData().catch((error) => {
  console.error(error);
});
```

## Unhandled Promise Rejection

- 실패한 Promise에 적절한 에러 처리가 연결되지 않은 상태다.

```js
async function loadData() {
  throw new Error("load failed");
}

loadData();
```

- `loadData()`가 반환한 Promise는 실패하지만 이를 처리하는 코드가 없다.
- `catch` 또는 `await`과 `try/catch`를 사용해야 한다.

```js
loadData().catch((error) => {
  console.error(error);
});
```

또는 다음처럼 처리한다.

```js
async function run() {
  try {
    await loadData();
  } catch (error) {
    console.error(error);
  }
}
```

## 순차 실행

- 앞선 작업의 결과가 다음 작업에 필요할 때 사용한다.

```js
const user = await fetchUser();
const clips = await fetchClips(user.id);
```

실행 흐름은 다음과 같다.

```text
fetchUser 시작
→ fetchUser 완료
→ fetchClips 시작
→ fetchClips 완료
```

## 병렬 실행

- 서로 독립적인 비동기 작업은 동시에 시작할 수 있다.
- 일반적으로 `Promise.all`을 사용한다.

```js
const [user, clips] = await Promise.all([
  fetchUser(),
  fetchClips(),
]);
```

실행 흐름은 다음과 같다.

```text
fetchUser 시작
fetchClips 시작
→ 두 작업이 모두 완료될 때까지 대기
→ 결과 반환
```

- 독립적인 요청을 병렬로 실행하면 전체 대기 시간을 줄일 수 있다.

## `Promise.all`

- 모든 Promise가 성공할 때까지 기다린다.
- 하나라도 실패하면 전체 Promise가 실패한다.
- 결과 배열은 완료 순서가 아니라 입력 순서를 따른다.

```js
try {
  const [user, clips] = await Promise.all([
    fetchUser(),
    fetchClips(),
  ]);

  console.log(user, clips);
} catch (error) {
  console.error(error);
}
```

- 하나의 Promise가 실패해도 이미 시작된 다른 작업이 자동으로 취소되지는 않는다.

## `Promise.allSettled`

- 모든 Promise가 성공하거나 실패할 때까지 기다린다.
- 일부 작업이 실패해도 전체 결과를 확인할 수 있다.

```js
const results = await Promise.allSettled([
  fetchUser(),
  fetchClips(),
]);
```

결과는 다음과 같은 구조를 가진다.

```js
[
  {
    status: "fulfilled",
    value: user,
  },
  {
    status: "rejected",
    reason: error,
  },
]
```

각 결과의 상태를 확인해서 처리한다.

```js
for (const result of results) {
  if (result.status === "fulfilled") {
    console.log(result.value);
    continue;
  }

  console.error(result.reason);
}
```

## `Promise.all`과 `Promise.allSettled`

| 상황 | 선택 |
| --- | --- |
| 모든 작업이 성공해야 함 | `Promise.all` |
| 하나라도 실패하면 전체 실패 처리 | `Promise.all` |
| 일부 실패해도 나머지 결과가 필요함 | `Promise.allSettled` |
| 여러 파일의 결과를 각각 표시해야 함 | `Promise.allSettled` |

```text
전체 성공이 하나의 작업인가?
├─ 예 → Promise.all
└─ 아니오 → Promise.allSettled
```

## `fetch` 에러 처리

- `fetch`는 서버가 `404`, `401`, `500`을 반환해도 네트워크 통신이 완료되면 Promise를 성공 상태로 처리한다.
- 따라서 `response.ok`를 직접 확인해야 한다.

```js
async function fetchUser() {
  const response = await fetch("/api/users/me");

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`,
    );
  }

  return response.json();
}
```

- 네트워크 연결 실패나 요청 중단은 Promise rejection이 될 수 있다.
- HTTP 오류 응답은 애플리케이션 코드에서 직접 에러로 변환해야 한다.

## 순차 실행과 병렬 실행 선택 기준

```text
다음 작업이 이전 작업의 결과를 필요로 하는가?
├─ 예 → 순차 await
└─ 아니오 → Promise.all 고려
```

- 의존성이 있는 작업은 순차 실행한다.
- 독립적인 작업은 병렬 실행을 고려한다.
- 매우 많은 작업을 한 번에 `Promise.all`로 실행하면 메모리와 서버 부하가 증가할 수 있다.
- 대량 작업에는 동시성 제한이 적용된 작업 큐가 필요하다.

## 핵심 정리

- Promise는 비동기 작업의 상태와 결과를 표현한다.
- Promise는 `pending`, `fulfilled`, `rejected` 상태를 가진다.
- `then`은 성공 결과를 처리한다.
- `catch`는 실패 결과를 처리한다.
- `finally`는 성공과 실패에 관계없이 실행된다.
- `async` 함수는 항상 Promise를 반환한다.
- `await`는 Promise의 완료를 기다린다.
- `await`한 Promise가 실패하면 해당 위치에서 에러가 발생한 것처럼 동작한다.
- 비동기 에러는 `catch` 또는 `await`과 `try/catch`로 처리한다.
- 처리되지 않은 Promise 실패는 Unhandled Promise rejection이 된다.
- 의존성이 있는 작업은 순차 실행한다.
- 독립적인 작업은 병렬 실행을 고려한다.
- 모든 작업의 성공이 필요하면 `Promise.all`을 사용한다.
- 일부 실패가 허용되면 `Promise.allSettled`를 사용한다.
- `fetch` 사용 시 HTTP 오류를 확인하려면 `response.ok`를 검사해야 한다.
