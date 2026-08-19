# Day 11 Interview Practice

면접 질문을 보고 먼저 직접 답한 뒤, 아래 예시 답변과 체크 포인트를 비교한다. 카테고리는 여섯 개로 제한한다.

---

## 1. useEffect의 목적

### useEffect는 왜 사용하는가? 단순히 "렌더링 후 실행되는 함수"라고 설명하면 왜 부족한가?

#### 내 답변

- useEffect는 React가 렌더링한 결과를 브라우저 API, 네트워크, WebSocket, timer, 외부 라이브러리처럼 React 밖의 시스템과 동기화하기 위해 사용한다. 렌더링 뒤 실행된다는 말은 timing만 설명한다. 그 설명만 따르면 파생 값 계산이나 클릭 로직까지 Effect로 옮기게 되어 불필요한 State와 Render가 생긴다.

#### 체크 포인트

- 외부 시스템 동기화
- Escape Hatch
- 실행 시점이 아니라 존재 이유
- derived value와 Event Handler를 구분

### Effect가 필요 없는 대표적인 사례는 무엇인가?

#### 내 답변

- 다른 Props나 State로 항상 계산 가능한 값이다. 예를 들어 price와 quantity의 total은 렌더링 중 계산한다. 사용자의 클릭 때문에 발생하는 구매, 삭제, 제출도 Event Handler에서 처리한다. Effect는 컴포넌트 존재나 reactive 값 변화에 맞춰 외부 시스템을 유지해야 할 때 사용한다.

#### 체크 포인트

- 렌더링 중 계산
- Event Handler
- 중복 State 제거
- 외부 대상 유무

---

## 2. Dependency와 stale closure

### Dependency Array는 어떤 역할을 하는가? 빈 배열은 무엇을 의미하는가?

#### 내 답변

- Dependency Array는 Effect가 읽는 reactive value가 바뀔 때 외부 시스템을 다시 동기화하는 조건이다. Props, State, 컴포넌트 내부 함수나 객체를 읽으면 기본적으로 dependency 후보가 된다. 빈 배열은 그 Effect가 컴포넌트의 reactive 값에 의존하지 않는 lifecycle 연결이라는 뜻이며, 무조건 한 번만 실행된다고 단순화하면 StrictMode 개발 검증과 dependency의 의미를 놓친다.

#### 체크 포인트

- reactive value
- 재동기화 조건
- exhaustive-deps
- `[]`의 정확한 의미

### stale closure란 무엇이며 dependency와 어떤 관계가 있는가?

#### 내 답변

- stale closure는 이전 렌더가 만든 callback이 그 시점의 State나 Props Snapshot을 계속 참조하는 현상이다. 예를 들어 빈 dependency의 interval callback이 최초 count를 캡처하면 UI count가 바뀌어도 로그는 오래된 값을 출력할 수 있다. 외부 연결을 최신 값으로 다시 설정해야 하면 dependency에 넣고 cleanup 후 재연결한다. 이전 State를 기준으로 누적 업데이트만 한다면 함수형 업데이트가 더 적절할 수 있다.

#### 체크 포인트

- 렌더 Snapshot
- callback 캡처
- dependency 재연결
- 함수형 업데이트의 용도

---

## 3. Cleanup과 StrictMode

### Effect Cleanup은 언제 실행되며 왜 필요한가?

#### 내 답변

- Cleanup은 component unmount 때뿐 아니라 dependency 변경으로 새 Effect가 실행되기 직전에 기존 Effect를 정리할 때도 실행된다. Event Listener, timer, subscription, WebSocket, 진행 중 요청처럼 Effect가 만든 외부 작업을 해제해 중복 연결, 메모리 누수, 이전 작업의 늦은 반영을 막는다.

#### 체크 포인트

- cleanup → 새 setup 순서
- unmount
- listener, timer, subscription, request
- setup과 정확한 짝

### StrictMode에서 개발 환경의 Effect가 다시 실행될 수 있는 이유는 무엇인가?

#### 내 답변

- React StrictMode는 setup → cleanup → setup과 유사한 개발 전용 검증으로 cleanup 누락과 멱등적이지 않은 외부 연결을 빨리 발견하도록 돕는다. 그래서 API나 listener가 두 번 보인다고 무조건 버그라고 단정하지 않는다. 핵심은 Effect가 다시 실행되어도 연결이 하나만 남고, cleanup이 이전 setup을 되돌리는 구조인지다.

#### 체크 포인트

- 개발 전용 검증
- setup / cleanup 대칭
- production과 구분
- 문제를 ref로 숨기지 않음

---

## 4. 비동기 요청과 Race Condition

### Effect에서 Race Condition이 발생하는 이유는 무엇인가?

#### 내 답변

- dependency인 userId나 검색 조건이 빠르게 바뀌면 이전 요청과 최신 요청이 동시에 진행될 수 있고, 시작 순서와 완료 순서는 다를 수 있다. 빠른 최신 B 응답을 먼저 표시한 뒤 느린 이전 A 응답이 늦게 도착해 setState하면 A가 B 화면을 덮는다. 그래서 요청 수명과 응답의 유효성을 Effect cleanup과 함께 설계해야 한다.

#### 체크 포인트

- 요청 시작·완료 순서 차이
- 늦은 이전 응답
- 최신 UI 덮어쓰기
- dependency 변경

### 오래된 응답 무시와 요청 취소 방식의 차이는 무엇인가?

#### 내 답변

- ignore flag 방식은 cleanup에서 이전 Effect의 flag를 바꾸고, 완료된 응답이 오래됐으면 State 반영만 막는다. 요청 자체는 계속 실행되므로 취소할 수 없는 Promise에도 쓸 수 있다. AbortController 방식은 cleanup에서 abort를 호출해 fetch 요청 자체를 취소하므로 네트워크와 응답 처리 비용도 줄인다. 두 방식 모두 최신 UI 보호가 목적이지만 제어하는 범위가 다르다.

#### 체크 포인트

- ignore는 결과 무시
- abort는 요청 취소
- 취소 불가능한 작업
- 네트워크 비용

---

## 5. AbortController와 fetch 오류

### AbortController와 signal은 각각 어떤 역할을 하는가?

#### 내 답변

- AbortController는 취소 신호를 만들고 `controller.abort()`로 취소를 발생시킨다. controller.signal을 fetch 옵션에 전달해야 fetch가 그 신호를 받는다. dependency가 바뀌거나 component가 unmount될 때 cleanup에서 abort하면 더 이상 필요 없는 이전 요청을 취소할 수 있다. catch에서는 AbortError를 일반 서버·네트워크 오류와 분리해 정상 취소로 처리한다.

#### 체크 포인트

- controller
- signal 전달
- cleanup abort
- AbortError 분기

### fetch는 HTTP 500에서 자동으로 reject되는가? Effect callback을 async로 만들면 안 되는 이유는 무엇인가?

#### 내 답변

- HTTP 400, 404, 500은 fetch Promise가 fulfilled된 Response를 줄 수 있으므로 `response.ok`를 직접 검사해 throw한다. 네트워크 오류와 Abort는 reject될 수 있다. 또한 Effect callback은 void 또는 cleanup 함수를 반환해야 하지만 async 함수는 Promise를 반환하므로, Effect 내부에서 별도 async 함수를 선언하고 호출한다.

#### 체크 포인트

- response.ok
- HTTP 오류와 reject 구분
- Effect 반환 계약
- 내부 async 함수

---

## 6. 실무 서버 상태 처리

### 직접 useEffect + fetch 대신 React Query 같은 서버 상태 도구를 사용하는 이유는 무엇인가?

#### 내 답변

- 서버 데이터는 loading, error, retry, cache, stale data, refetch, invalidation, deduplication, Race Condition까지 함께 관리해야 한다. 직접 Effect와 useState로 모두 구현하면 조건별 캐시와 요청 수명 규칙이 흩어진다. React Query는 queryKey로 데이터 범위를 분리하고, queryFn에 제공되는 AbortSignal을 fetch에 전달하며, cache와 재요청 정책을 한곳에서 관리한다. 단순 학습에서는 직접 Effect를 이해한 뒤 이런 도구가 해결하는 책임을 연결해서 설명한다.

#### 체크 포인트

- Server State의 수명
- queryKey
- cache, retry, invalidation
- AbortSignal 전달
- 직접 구현의 비용

## 마무리 질문

다음 한 문장으로 답해 본다.

> useEffect는 State 변화에 반응해서 아무 코드나 실행하는 도구가 아니라, React 상태와 외부 시스템을 동기화하는 수단이다. 따라서 렌더링 계산과 사용자 이벤트를 먼저 분리하고, 비동기 작업에는 dependency, cleanup, 최신성 또는 취소 전략까지 함께 설계한다.
