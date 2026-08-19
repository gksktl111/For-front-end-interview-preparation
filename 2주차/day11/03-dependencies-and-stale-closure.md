# Dependency Array와 stale closure

## Dependency Array는 재동기화 조건이다

기본 형태는 다음과 같다.

~~~tsx
useEffect(() => {
  // 외부 시스템과 동기화
}, [dependency]);
~~~

Dependency Array는 Effect를 "몇 번 실행할지" 임의로 조절하는 옵션이 아니다. Effect가 읽는 Props, State, 컴포넌트 안에서 선언된 함수처럼 reactive value가 바뀌면 외부 시스템을 다시 동기화해야 한다는 선언이다.

| 형태 | 의미 |
| --- | --- |
| `useEffect(() => {})` | 매 Commit 뒤에 이 Effect가 다시 동기화 대상이 될 수 있다. |
| `useEffect(() => {}, [value])` | 최초 setup 뒤 `value`가 달라질 때 cleanup과 새 setup으로 동기화한다. |
| `useEffect(() => {}, [])` | Effect가 컴포넌트의 reactive value에 의존하지 않는 경우의 lifecycle 연결이다. StrictMode 개발 검증은 별도로 고려한다. |

`[]`을 "무조건 한 번만 실행할 코드"로 외우면, 왜 어떤 값을 dependency에 넣거나 빼면 안 되는지를 설명하기 어렵다.

## reactive value 찾기

Effect 본문에서 읽는 다음 값은 기본적으로 dependency 후보다.

- Props
- `useState` State
- 컴포넌트 본문에서 선언한 함수와 객체
- 그 값들을 사용해 만든 계산값

~~~tsx
function UserLogger({ userId }: { userId: string }) {
  useEffect(() => {
    console.log(userId);
  }, [userId]);
}
~~~

ESLint의 exhaustive-deps 경고는 귀찮은 문법 검사가 아니라, 이전 렌더의 값을 계속 참조할 가능성을 알려 주는 설계 피드백이다. 경고를 없애려고 dependency를 빼기보다 Effect가 정말 필요한지, 함수나 객체를 안정화할 필요가 있는지 먼저 본다.

## stale closure란 무엇인가

각 렌더는 그 시점의 State와 Props Snapshot을 가진다. Effect 안에서 만든 callback도 자신이 생성된 렌더의 값을 캡처한다.

~~~tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      console.log(count);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  return <button onClick={() => setCount((previous) => previous + 1)}>{count}</button>;
}
~~~

timer는 첫 Effect가 실행될 때의 `count = 0`을 캡처할 수 있다. 버튼으로 UI의 count가 바뀌어도 callback은 계속 첫 렌더의 0을 출력한다. 이것이 stale closure다.

## 해결은 원하는 동작에서 시작한다

### 1. 외부 연결 자체가 최신 값으로 다시 설정되어야 한다면 dependency를 추가한다

~~~tsx
useEffect(() => {
  const timerId = window.setInterval(() => {
    console.log(count);
  }, 1000);

  return () => window.clearInterval(timerId);
}, [count]);
~~~

count가 바뀔 때 이전 interval을 cleanup하고 최신 count를 캡처한 새 interval을 만든다. 이 재연결이 원하는 동작일 때 맞는 해법이다.

### 2. 이전 State를 기준으로 누적 업데이트만 한다면 함수형 업데이트를 사용한다

~~~tsx
useEffect(() => {
  const timerId = window.setInterval(() => {
    setCount((previous) => previous + 1);
  }, 1000);

  return () => window.clearInterval(timerId);
}, []);
~~~

여기서는 callback이 현재 count를 읽지 않고 React에 "이전 값에서 1 증가"를 요청한다. effect를 매 count마다 다시 연결할 이유가 없다.

## dependency를 숨기지 않는다

다음은 문제를 가리는 방식이다.

~~~tsx
// count를 읽지만 []으로 실행 횟수만 고정했다.
useEffect(() => {
  sendAnalytics(count);
}, []);
~~~

의도는 한 번만 전송하는 것일 수 있지만, 실제로 무엇을 전송해야 하는지부터 다시 정의해야 한다. 첫 count만 보내는 것이 맞다면 effect 밖에서 값을 고정하는 방식, 이벤트 시점 전송, mount 시점 규칙 등을 명시적으로 설계한다.

## 실습에서 확인할 것

`/week2/day11/stale-closure-dependencies`에서 timer를 시작한 뒤 count를 올린다.

- 빈 dependency의 callback이 시작 시점 count를 계속 기록하는 현상
- `[count]` dependency가 cleanup 후 새 timer를 만들며 최신 snapshot을 읽는 현상
- 상황에 따라 함수형 업데이트가 더 알맞을 수 있는 이유

## 기억할 문장

> dependency는 stale closure를 피하기 위한 숫자 조절기가 아니라, 이 Effect가 어떤 reactive 값과 함께 다시 동기화되어야 하는지를 선언하는 목록이다.
