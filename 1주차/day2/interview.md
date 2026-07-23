# Day 2 Interview Practice

면접 질문을 보고 바로 아래 `내 답변` 칸에 스스로 답변을 적는 용도입니다.

---

## 1. Promise 콜백과 `setTimeout` 콜백 중 무엇이 먼저 실행되는가?

### 내 답변
- Promise 콜백이 먼저 실행된다. 다만 동기 코드보다 먼저 실행되는 것은 아니고, 현재 실행 중인 동기 코드가 모두 끝난 이후에 실행된다. 이유는 `then`, `catch`, `finally`, `await` 이후 콜백은 Microtask Queue에 적재되고, `setTimeout` 콜백은 Task Queue에 적재되기 때문이다. Event Loop는 Call Stack이 비면 Task Queue보다 Microtask Queue를 먼저 모두 비우므로 Promise 콜백이 먼저 콜스택에 올라가게 된다.

### 체크 포인트

- 동기 코드가 먼저 실행된 뒤 비동기 콜백이 처리된다는 점
- Promise 후속 처리(`then`, `catch`, `finally`, `await` 이후)는 Microtask Queue에 들어간다는 점
- `setTimeout` 콜백은 Task Queue에 들어간다는 점
- Event Loop는 Task Queue보다 Microtask Queue를 먼저 비운다는 점

---

## 2. `try/catch`가 Promise 에러를 잡지 못하는 경우는 언제인가?

### 내 답변
- Promise 호출 앞에 `await`을 사용하지 않거나 Promise 체인에 `.catch()`를 연결하지 않은 경우에는 바깥 `try/catch`가 에러를 잡지 못할 수 있다. 이유는 `try/catch`가 현재 실행 흐름에서 발생한 동기 에러를 잡는 방식인데, Promise의 실패는 나중에 `rejected` 상태로 결정되기 때문이다. 그래서 Promise 에러를 잡으려면 `try` 안에서 `await`으로 기다리거나, Promise에 `.catch()`를 연결해서 처리해야 한다. 처리하지 않으면 Unhandled Promise Rejection이 발생할 수 있다.

### 체크 포인트

- `try/catch`는 현재 실행 흐름에서 발생한 동기 에러를 잡는다는 점
- Promise 실패를 잡으려면 `await`과 함께 `try/catch`를 사용하거나 `.catch()`를 연결해야 한다는 점
- Promise를 생성만 하고 기다리지 않으면 바깥 `try/catch`가 rejection을 잡지 못할 수 있다는 점
- 처리되지 않은 Promise 실패는 Unhandled Promise Rejection이 될 수 있다는 점

---

## 3. `AbortController`는 어떤 문제를 해결하는가?

### 내 답변
- `AbortController`는 더 이상 필요하지 않은 진행 중 요청을 취소할 때 사용한다. 예를 들어 같은 상태값을 변경하는 비동기 요청이 여러 번 호출되면, 오래된 요청의 응답이 나중에 도착해서 최신 상태를 덮어쓸 수 있다. 이때 `fetch`에 `controller.signal`을 전달해 두고, 새 요청이 생기거나 컴포넌트가 unmount될 때 `controller.abort()`를 호출하여 이전 요청을 취소할 수 있다. 취소된 요청은 `AbortError`로 rejected될 수 있는데, 이는 의도된 취소이므로 일반 서버 에러와 구분해야 한다.

### 체크 포인트

- 진행 중인 `fetch` 요청에 취소 신호를 전달할 수 있다는 점
- 새 요청이 이전 요청을 대체하거나 컴포넌트가 unmount될 때 불필요한 요청을 중단할 수 있다는 점
- 요청 취소 시 `fetch` Promise는 rejected 상태가 될 수 있다는 점
- `AbortError`는 의도된 취소이므로 일반 서버 오류와 구분해야 한다는 점

---

## 4. `fetch`에서 HTTP 500 응답은 왜 `catch`로 바로 가지 않는가?

### 내 답변
- `fetch`에서는 500 에러 같은 HTTP 오류 응답도 서버 응답 자체는 정상적으로 도착한 것으로 보기 때문에 Promise가 fulfilled 상태가 된다. 그래서 바로 `catch`로 넘어가지 않는다. `catch`는 주로 네트워크 오류, CORS 오류, 요청 취소처럼 요청 자체가 실패한 경우에 실행된다. 하여 프론트에서는 `response.ok`나 `response.status`로 HTTP 상태를 직접 검증하고, 실패 상태라면 직접 에러를 던져 별도로 처리해야 한다.

### 체크 포인트

- `fetch`는 네트워크 요청 자체가 실패했을 때 주로 Promise를 rejected 상태로 만든다는 점
- 서버가 `400`, `404`, `500` 같은 HTTP 오류 응답을 보내도 응답 자체는 정상 도착한 것으로 본다는 점
- HTTP 오류를 애플리케이션 에러로 처리하려면 `response.ok`를 직접 확인해야 한다는 점
- 네트워크 오류, 요청 취소, HTTP 오류 응답을 구분해서 처리할 수 있어야 한다는 점

---

## 5. 비동기 요청 레이스 컨디션은 언제 발생하고 어떻게 방지할 수 있는가?

### 내 답변
- 비동기 요청 레이스 컨디션은 주로 같은 상태값이나 UI를 변경하는 요청이 동시에 또는 여러 번 호출될 때 발생할 수 있다. 비동기 요청은 시작 순서와 완료 순서가 항상 같지 않기 때문에, 오래된 요청이 늦게 완료되면서 최신 결과를 덮어쓸 수 있다. 이에 대한 방지책으로는 각 요청에 번호를 부여하여 상태 변경 전에 해당 요청이 최신 요청인지 검증하는 요청 번호 방식이 있다. 다른 방법으로는 최신 요청 사항이 생길 경우 `AbortController`를 이용해 이전 요청 자체를 취소하는 방식이 있다.

### 체크 포인트

- 여러 요청의 시작 순서와 완료 순서는 다를 수 있다는 점
- 오래된 요청이 늦게 완료되면 최신 상태나 UI를 덮어쓸 수 있다는 점
- 요청 번호를 비교하면 오래된 응답을 무시할 수 있다는 점
- `AbortController`를 사용하면 더 이상 필요하지 않은 이전 요청 자체를 취소할 수 있다는 점

---

## 6. TanStack Query의 `queryKey`와 `AbortSignal`은 레이스 컨디션 대응에서 각각 어떤 역할을 하는가?

### 내 답변
- `queryKey`는 TanStack Query 요청에 대한 응답을 각 조건에 맞는 캐시에 저장하기 위한 구분점이 되어준다. 검색어, 필터, id 같은 조회 조건을 `queryKey`에 포함하면 조건별로 캐시가 분리되므로, 오래된 응답이라도 `queryKey`가 다르다면 현재 데이터 값을 덮어쓰지 않는다. 다만 `queryKey`가 다르다고 요청 완료 순서가 보장되거나 이전 요청이 항상 자동으로 취소되는 것은 아니다. 이전 요청 자체를 중단하려면 `queryFn`에서 전달받은 `signal`을 실제 `fetch` 요청에 넘겨줘야 한다.

### 체크 포인트

- `queryKey`에는 검색어, 필터, id 같은 모든 조회 조건을 포함해야 한다는 점
- `queryKey`가 다르면 캐시가 분리되어 오래된 응답이 현재 queryKey의 데이터를 덮어쓰지 않는다는 점
- `queryKey` 변경이 요청 완료 순서를 보장하거나 이전 요청을 항상 자동 취소한다는 뜻은 아니라는 점
- 이전 요청 자체를 중단하려면 `queryFn`이 받은 `signal`을 실제 요청 함수에 전달해야 한다는 점
