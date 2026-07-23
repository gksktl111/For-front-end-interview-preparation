
## JavaScript 실행 환경

- JavaScript는 기본적으로 한 번에 하나의 작업만 처리하는 **싱글 스레드 언어**다.
- JavaScript 코드는 하나의 Call Stack에서 순서대로 실행된다.
- 타이머, 네트워크 요청, 사용자 이벤트 같은 작업은 브라우저가 제공하는 기능을 이용해 비동기적으로 처리할 수 있다.
- 브라우저 환경에서는 Call Stack, Web API, Task Queue, Microtask Queue, Event Loop가 함께 동작해 비동기 코드의 실행 순서를 관리한다.

## Call Stack

- Call Stack은 현재 실행 중인 코드와 함수의 실행 순서를 관리하는 자료구조다.
- 함수가 호출되면 Call Stack에 추가된다.
- 함수 실행이 끝나면 Call Stack에서 제거된다.
- 마지막에 들어온 함수가 가장 먼저 실행을 마치는 LIFO 구조로 동작한다.
- JavaScript의 동기 코드는 Call Stack에서 위에서 아래로 순서대로 실행된다.

```js
function second() {
  console.log("second");
}

function first() {
  console.log("first");
  second();
}

first();
```

실행 흐름은 다음과 같다.

```text
전역 코드 실행
→ first() 추가
→ second() 추가
→ second() 제거
→ first() 제거
→ 전역 코드 종료
```

- Call Stack에서 하나의 작업이 오래 실행되면 다른 JavaScript 코드는 실행되지 못한다.
- 이처럼 하나의 작업이 Call Stack을 오래 점유하는 상태를 블로킹이라고 한다.

## Web API

- Web API는 브라우저가 JavaScript에 제공하는 기능이다.
- JavaScript 엔진 자체에 포함된 기능이 아니라 브라우저 실행 환경에서 제공된다.
- 타이머, 네트워크 요청, DOM 이벤트 같은 작업을 브라우저가 대신 처리하도록 맡길 수 있다.

대표적인 Web API는 다음과 같다.

- `setTimeout`
- `setInterval`
- `fetch`
- DOM 이벤트
- `AbortController`

```js
setTimeout(() => {
  console.log("timer");
}, 1000);
```

- `setTimeout`이 호출되면 타이머 처리는 Web API에 맡겨진다.
- 지정된 시간이 지나더라도 콜백이 즉시 실행되는 것은 아니다.
- 타이머가 끝난 콜백은 Task Queue에 들어간다.
- 이후 Call Stack이 비고, 실행 순서가 되었을 때 Call Stack으로 이동해 실행된다.

## Task Queue

- Task Queue는 실행할 준비가 된 일반 비동기 콜백이 대기하는 공간이다.
- Macrotask Queue 또는 Callback Queue라고 부르기도 한다.
- `setTimeout`, `setInterval`, DOM 이벤트의 콜백 등이 주로 들어간다.

```js
setTimeout(() => {
  console.log("task");
}, 0);
```

- `setTimeout(..., 0)`을 사용해도 콜백은 즉시 실행되지 않는다.
- `0`은 콜백을 바로 실행하라는 의미가 아니라, 최소한의 대기 시간이 지난 뒤 Task Queue에 등록할 수 있다는 의미다.
- Call Stack에 실행 중인 코드가 있다면 해당 코드가 모두 끝날 때까지 기다려야 한다.
- Microtask Queue에 작업이 있다면 Task Queue의 작업보다 먼저 처리된다.

## Microtask Queue

- Microtask Queue는 Promise와 관련된 콜백처럼 우선순위가 높은 비동기 작업이 대기하는 공간이다.
- 현재 동기 코드가 끝난 뒤 Task Queue보다 먼저 처리된다.

대표적으로 다음 작업이 Microtask Queue에 들어간다.

- `Promise.then`
- `Promise.catch`
- `Promise.finally`
- `queueMicrotask`
- `await` 이후의 코드

```js
Promise.resolve().then(() => {
  console.log("promise");
});

queueMicrotask(() => {
  console.log("microtask");
});
```

- Call Stack이 비면 Event Loop는 Task Queue보다 Microtask Queue를 먼저 확인한다.
- Microtask Queue에 들어 있는 작업은 등록된 순서대로 실행된다.
- 현재 Microtask Queue에 있는 작업을 모두 실행한 뒤 다음 Task를 처리한다.

## Event Loop

- Event Loop는 Call Stack과 각 Queue의 상태를 확인하면서 다음에 실행할 작업을 결정하는 동작 구조다.
- 비동기 작업 자체를 실행하는 것이 아니라, 실행이 준비된 콜백을 적절한 순서에 따라 Call Stack으로 이동시키는 역할을 한다.

기본 실행 순서는 다음과 같다.

```text
1. Call Stack의 동기 코드를 모두 실행한다.
2. Call Stack이 비었는지 확인한다.
3. Microtask Queue의 작업을 모두 실행한다.
4. Task Queue에서 작업 하나를 실행한다.
5. 다시 Microtask Queue를 확인한다.
6. 같은 과정을 반복한다.
```

- 동기 코드가 가장 먼저 실행된다.
- 동기 코드가 끝나면 Microtask Queue가 먼저 처리된다.
- Microtask Queue가 비면 Task Queue의 작업이 실행된다.
- 하나의 Task가 끝난 뒤에는 다음 Task를 실행하기 전에 다시 Microtask Queue를 확인한다.

## 비동기 코드의 실행 순서

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

queueMicrotask(() => {
  console.log("D");
});

console.log("E");
```

출력 순서는 다음과 같다.

```text
A
E
C
D
B
```

### 실행 과정

1. `console.log("A")`는 동기 코드이므로 바로 실행된다.
2. `setTimeout`이 호출되고 타이머 처리는 Web API에 맡겨진다.
3. 타이머가 끝나면 `setTimeout` 콜백은 Task Queue에 들어간다.
4. `Promise.then` 콜백은 Microtask Queue에 들어간다.
5. `queueMicrotask` 콜백도 Microtask Queue에 들어간다.
6. `console.log("E")`는 동기 코드이므로 바로 실행된다.
7. 전역 동기 코드가 끝나면서 Call Stack이 비게 된다.
8. Event Loop는 Microtask Queue를 먼저 확인한다.
9. 먼저 등록된 `Promise.then` 콜백이 실행되어 `C`가 출력된다.
10. 다음으로 등록된 `queueMicrotask` 콜백이 실행되어 `D`가 출력된다.
11. Microtask Queue가 비면 Task Queue의 `setTimeout` 콜백이 실행된다.
12. 마지막으로 `B`가 출력된다.

## Microtask가 먼저 실행되는 이유

- Event Loop는 Call Stack의 동기 코드가 끝난 뒤 Task Queue보다 Microtask Queue를 먼저 처리한다.
- Promise의 후속 처리처럼 현재 작업과 밀접하게 연결된 비동기 작업을 다음 Task보다 먼저 마무리하기 위한 실행 규칙이다.
- 따라서 `Promise.then`과 `queueMicrotask`의 콜백은 `setTimeout` 콜백보다 먼저 실행된다.

```js
setTimeout(() => {
  console.log("task");
}, 0);

Promise.resolve().then(() => {
  console.log("microtask");
});
```

출력 순서는 다음과 같다.

```text
microtask
task
```

- `setTimeout`의 대기 시간이 `0`이어도 콜백은 Task Queue에 들어간다.
- Promise의 콜백은 Microtask Queue에 들어간다.
- Event Loop가 Microtask Queue를 먼저 처리하므로 Promise 콜백이 먼저 실행된다.

## `setTimeout(..., 0)`이 즉시 실행되지 않는 이유

- `setTimeout(..., 0)`은 콜백을 즉시 실행하는 함수가 아니다.
- 콜백 실행을 현재 동기 코드 이후로 미루는 함수에 가깝다.
- 타이머가 끝나면 콜백은 Task Queue에 등록된다.
- 실제 실행을 위해서는 Call Stack이 비어야 한다.
- Microtask Queue에 작업이 있다면 해당 작업도 모두 끝나야 한다.

```js
setTimeout(() => {
  console.log("timeout");
}, 0);

for (let index = 0; index < 3; index += 1) {
  console.log(index);
}
```

출력 순서는 다음과 같다.

```text
0
1
2
timeout
```

- 타이머의 대기 시간이 `0`이어도 현재 실행 중인 반복문을 중단할 수 없다.
- 동기 코드가 모두 실행된 뒤에야 `setTimeout` 콜백이 실행된다.

## Microtask 실행 중 새로운 Microtask가 추가되는 경우

- Microtask를 실행하는 도중 새로운 Microtask가 추가될 수 있다.
- 새로 추가된 Microtask도 현재 Microtask Queue가 비워질 때까지 계속 실행된다.
- 따라서 Microtask가 계속 추가되면 Task Queue의 실행이 지연될 수 있다.

```js
Promise.resolve().then(() => {
  console.log("A");

  queueMicrotask(() => {
    console.log("B");
  });
});

setTimeout(() => {
  console.log("C");
}, 0);
```

출력 순서는 다음과 같다.

```text
A
B
C
```

- 첫 번째 Promise 콜백이 실행되면서 새로운 Microtask가 추가된다.
- Event Loop는 Microtask Queue가 완전히 빌 때까지 처리한다.
- 따라서 새로 추가된 `B`도 Task Queue의 `C`보다 먼저 실행된다.

## 브라우저 렌더링과 Event Loop

- 브라우저는 JavaScript 실행뿐 아니라 화면 렌더링도 처리해야 한다.
- 일반적으로 하나의 Task와 Microtask 처리가 끝난 뒤 브라우저가 화면을 렌더링할 기회를 얻는다.
- Call Stack을 오래 점유하거나 Microtask를 지나치게 많이 생성하면 화면 렌더링과 사용자 입력 처리가 지연될 수 있다.
- 따라서 무거운 동기 작업은 메인 스레드를 막아 화면이 멈춘 것처럼 보이게 할 수 있다.

```js
while (true) {
  // Call Stack을 계속 점유한다.
}
```

- 위 코드처럼 동기 작업이 끝나지 않으면 Event Loop는 다음 작업으로 넘어갈 수 없다.
- 타이머, 클릭 이벤트, Promise 콜백, 화면 렌더링도 처리되지 못한다.

## 전체 실행 구조

```text
JavaScript 동기 코드
        ↓
    Call Stack
        ↓
비동기 작업을 실행 환경에 위임
        ↓
      Web API
        ↓
완료된 콜백을 Queue에 등록
        ↓
┌─────────────────┬─────────────────┐
│ Microtask Queue │   Task Queue    │
│ Promise         │ setTimeout      │
│ queueMicrotask  │ DOM Event       │
│ await 이후 코드 │ setInterval     │
└─────────────────┴─────────────────┘
        ↓
    Event Loop
        ↓
Microtask를 모두 처리
        ↓
Task를 하나 처리
        ↓
같은 과정 반복
```

## 실행 순서 판단 기준

비동기 코드의 출력 순서를 판단할 때는 다음 순서로 확인한다.

1. 먼저 동기 코드를 위에서 아래로 실행한다.
2. 각 비동기 콜백이 어떤 Queue에 들어가는지 구분한다.
3. Promise 관련 콜백은 Microtask Queue에 넣는다.
4. 타이머와 이벤트 콜백은 Task Queue에 넣는다.
5. 동기 코드가 끝나면 Microtask Queue를 모두 처리한다.
6. 이후 Task Queue에서 작업 하나를 처리한다.
7. Task가 끝나면 다시 Microtask Queue를 확인한다.

## 핵심 정리

- JavaScript의 동기 코드는 Call Stack에서 실행된다.
- 브라우저의 Web API가 타이머, 네트워크 요청, 이벤트 같은 작업을 처리한다.
- `Promise.then`, `queueMicrotask`, `await` 이후 코드는 Microtask Queue에서 대기한다.
- `setTimeout`, `setInterval`, DOM 이벤트 콜백은 Task Queue에서 대기한다.
- Event Loop는 동기 코드가 끝난 뒤 Microtask Queue를 먼저 처리한다.
- Microtask Queue를 모두 비운 뒤 Task Queue의 작업을 하나씩 처리한다.
- `setTimeout(..., 0)`은 즉시 실행되는 것이 아니라 실행을 Task Queue로 미루는 방식이다.
- Call Stack을 오래 점유하면 비동기 콜백과 화면 렌더링도 함께 지연된다.
