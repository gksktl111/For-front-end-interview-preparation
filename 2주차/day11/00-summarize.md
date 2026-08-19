# Day 11 빠른 개념 복습

## 오늘의 한 문장

> `useEffect`는 State 변화에 반응해서 아무 코드나 실행하는 도구가 아니라, React의 상태를 외부 시스템과 동기화하기 위한 수단이며, 비동기 작업에서는 Cleanup과 요청 수명까지 함께 설계해야 한다.

## 학습 목표

- `useEffect`를 React와 외부 시스템을 동기화하는 Escape Hatch로 설명한다.
- 렌더링 중 계산할 값, Event Handler에서 실행할 로직, Effect가 맡을 동기화를 구분한다.
- Dependency Array와 stale closure가 렌더링 Snapshot에 연결되는 이유를 설명한다.
- Cleanup의 대상과 실행 시점, StrictMode의 개발 환경 재실행 목적을 설명한다.
- 비동기 요청의 Race Condition을 재현하고, 오래된 응답 무시와 `AbortController` 취소를 구분한다.
- `fetch`의 HTTP 오류와 Promise rejection을 구분하고, 서버 상태 도구가 필요한 이유를 설명한다.

## 10분 복습 순서

1. 이 코드는 React 밖의 무엇과 동기화하는지 먼저 말한다.
2. Props나 State에서 계산할 수 있으면 렌더링 중에 계산하고 Effect를 만들지 않는다.
3. 사용자 클릭 때문에 발생하면 Event Handler에 둔다.
4. Effect 안에서 읽는 reactive value가 무엇인지 보고 dependency를 결정한다.
5. 연결, 구독, timer, 요청처럼 해제할 외부 작업이 있는지 찾아 Cleanup을 만든다.
6. 요청이 겹칠 수 있으면 오래된 결과를 무시하거나 이전 요청을 취소한다.
7. 서버 데이터의 loading, error, cache, retry가 커지면 서버 상태 도구를 검토한다.

## 상세 문서와 실습

- [Effect는 외부 시스템 동기화다](./01-effect-as-synchronization.md)
- [Effect가 필요 없는 경우와 Event Handler](./02-you-might-not-need-an-effect.md)
- [Dependency Array와 stale closure](./03-dependencies-and-stale-closure.md)
- [Cleanup과 StrictMode](./04-cleanup-and-strict-mode.md)
- [비동기 Effect, Race Condition, AbortController](./05-async-effects-race-condition.md)
- [프로젝트 연결 분석](./06-project-connection.md)
- [Interview Practice](./07-interview.md)

React playground:

- /week2/day11/effect-synchronization
- /week2/day11/event-handler-vs-effect
- /week2/day11/cleanup-strict-mode
- /week2/day11/stale-closure-dependencies
- /week2/day11/effect-race-condition
- /week2/day11/abort-controller

~~~bash
cd playgrounds/react
npm run dev
~~~

## 핵심 개념 압축

| 개념 | 빠른 정의 | 면접에서 꼭 붙일 말 |
| --- | --- | --- |
| Effect | React 결과를 외부 시스템과 맞추는 동기화 코드 | 렌더링 이후 실행된다는 시점만으로 존재 이유가 되지는 않는다. |
| Derived Value | Props와 State에서 계산 가능한 렌더링 값 | 같은 의미의 값을 State에 다시 저장하면 동기화 책임과 추가 Render가 생긴다. |
| Event Handler | 특정 사용자 행동에서 실행하는 코드 | 클릭 때문에 발생한 구매·삭제·제출은 보통 Effect가 아니라 handler의 책임이다. |
| Dependency | Effect가 읽는 reactive value의 목록 | 임의의 실행 횟수 설정이 아니라 재동기화 조건을 선언하는 값이다. |
| Cleanup | 기존 외부 연결이나 진행 중 작업을 해제하는 함수 | dependency 변경 때 이전 cleanup이 먼저 실행되고 새 setup이 시작된다. |
| stale closure | 이전 렌더가 만든 callback이 오래된 값을 참조하는 현상 | dependency를 추가할지, 함수형 업데이트가 맞는지 Effect의 실제 목적부터 판단한다. |
| Race Condition | 요청 시작 순서와 응답 완료 순서가 달라 최신 UI가 덮이는 문제 | 오래된 결과를 무시하거나 요청 자체를 abort한다. |
| AbortController | 취소 신호를 만드는 브라우저 API | `controller.abort()`가 취소를 발생시키고 `signal`이 fetch에 전달된다. |

## 먼저 판단하는 흐름

~~~text
이 값 또는 작업은 렌더링 중 Props/State에서 계산 가능한가?
↓ Yes
렌더링 중 계산한다. Effect가 필요하지 않을 가능성이 높다.

↓ No
특정 사용자 행동 때문에 실행되는가?
↓ Yes
Event Handler에 둔다.

↓ No
React 밖의 시스템(브라우저 API, 네트워크, timer, 구독)을 맞춰야 하는가?
↓ Yes
Effect 후보다.

Effect 안에서 읽는 reactive value는 무엇인가?
↓
dependency를 선언하고, 연결·구독·요청이면 cleanup도 설계한다.
~~~

## 코드로 바로 설명하기

### 1. document.title은 외부 시스템과 동기화한다

~~~tsx
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
~~~

- `count`는 React State이고 `document.title`은 브라우저 DOM API다.
- count가 바뀔 때 제목을 새 값으로 맞추므로 Effect가 자연스럽다.

### 2. 합계는 렌더링 중에 계산한다

~~~tsx
const [price, setPrice] = useState(1000);
const [quantity, setQuantity] = useState(1);
const total = price * quantity;
~~~

- total은 이미 있는 두 원천 값으로 계산된다.
- `setTotal`을 위한 Effect를 만들면 Render → Effect → 추가 Render 흐름이 생긴다.

### 3. 클릭 때문에 삭제하면 Event Handler에서 실행한다

~~~tsx
async function handleDelete() {
  await deleteClip(clipId);
}
~~~

- `shouldDelete` State를 만들고 Effect가 감시하게 할 이유가 없다.
- 어떤 행동 때문에 요청이 생겼는지가 코드에 바로 드러난다.

### 4. 요청은 cleanup에서 취소한다

~~~tsx
useEffect(() => {
  const controller = new AbortController();

  void loadUser(userId, controller.signal);

  return () => {
    controller.abort();
  };
}, [userId]);
~~~

- userId가 바뀌면 기존 cleanup이 먼저 실행되어 이전 요청을 취소한다.
- 새 Effect가 최신 userId로 새 요청을 시작한다.

## 헷갈리기 쉬운 표현 교정

| 부정확한 표현 | 더 정확한 표현 |
| --- | --- |
| Effect는 렌더링 뒤에 실행할 코드를 넣는 곳이다. | Effect는 React와 외부 시스템을 동기화하는 곳이다. |
| `[]`은 무조건 한 번만 실행하는 코드다. | Effect가 어떤 reactive value에도 의존하지 않는다는 선언이며, StrictMode 개발 검증은 별도로 고려한다. |
| dependency가 불편하면 빼도 된다. | Effect가 읽는 Props, State 등 reactive value는 dependency에 포함해야 오래된 closure를 피할 수 있다. |
| cleanup은 unmount 때만 실행된다. | dependency가 바뀔 때도 기존 cleanup 후 새 setup이 실행된다. |
| fetch는 404나 500이면 자동으로 throw한다. | 네트워크 실패·Abort는 reject될 수 있지만 HTTP 상태는 `response.ok`로 직접 확인한다. |
| Abort는 에러 처리 실패다. | `AbortError`는 정상적인 취소 흐름으로 분리해 처리한다. |

## 완료 체크

- [ ] `useEffect`를 외부 시스템 동기화 관점에서 설명할 수 있다.
- [ ] Effect가 필요한 경우와 필요 없는 경우를 구분할 수 있다.
- [ ] Event Handler와 Effect의 책임을 구분할 수 있다.
- [ ] Dependency Array와 stale closure의 관계를 설명할 수 있다.
- [ ] Cleanup의 실행 시점과 StrictMode 재실행 목적을 설명할 수 있다.
- [ ] Event Listener와 Timer의 Cleanup을 구현할 수 있다.
- [ ] Race Condition을 재현하고 오래된 응답 무시와 AbortController의 차이를 설명할 수 있다.
- [ ] `fetch`의 HTTP Error와 Promise rejection을 구분할 수 있다.
- [ ] React Query 같은 서버 상태 도구를 검토할 시점을 설명할 수 있다.
