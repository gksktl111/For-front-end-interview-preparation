# Effect는 외부 시스템 동기화다

## useEffect의 목적

`useEffect`는 React 컴포넌트의 렌더링 결과를 React 밖의 시스템과 동기화하기 위한 Escape Hatch다.

~~~text
Render
  ↓
Commit
  ↓
Effect setup
  ↓
외부 시스템과 동기화
~~~

"렌더링 이후 실행된다"는 설명은 시점을 말할 뿐, Effect가 왜 필요한지는 설명하지 못한다. 렌더링 뒤에 실행할 수 있다는 사실만으로 모든 로직을 Effect에 넣으면 데이터 흐름이 불필요하게 복잡해진다.

## 외부 시스템의 예

| 외부 시스템 | Effect가 하는 일 |
| --- | --- |
| HTTP 요청 | 현재 조회 조건에 맞는 데이터를 요청한다. |
| WebSocket, Subscription | 연결을 만들고 메시지를 구독한다. |
| `setInterval`, `setTimeout` | React State에 맞는 timer를 등록하고 해제한다. |
| DOM API | `document.title`, focus, scroll 위치를 맞춘다. |
| 브라우저 Event Listener | resize, online, visibilitychange 등을 구독한다. |
| 외부 라이브러리 | 지도, 차트, 영상 플레이어의 인스턴스를 React 값과 맞춘다. |
| browser storage | localStorage 등 브라우저 API에 값을 기록하거나 읽는다. |

React가 직접 소유하지 않는 대상이 있고, 그 대상이 최신 React 값과 맞아야 할 때 Effect를 검토한다.

## document.title 동기화 예제

~~~tsx
function CounterPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <button type="button" onClick={() => setCount((previous) => previous + 1)}>
      {count}
    </button>
  );
}
~~~

여기서 `count`는 React가 소유하는 State이고, `document.title`은 브라우저가 소유하는 외부 값이다. count가 바뀌면 해당 외부 값을 새 제목으로 맞춰야 하므로 `[count]` Effect가 존재한다.

## Effect를 만들기 전 확인할 질문

~~~text
React 밖의 무엇을 맞추는가?
↓
그 외부 시스템은 어떤 React 값에 따라 달라지는가?
↓
연결을 해제하거나 이전 작업을 취소해야 하는가?
↓
그 값을 dependency에 선언했는가?
~~~

첫 질문에 답하지 못한다면 그 코드는 렌더링 중 계산하거나 Event Handler에서 실행하는 편이 더 자연스러울 수 있다.

## setup은 멱등적으로 설계한다

Effect는 mount만이 아니라 dependency 변경, 개발 환경의 StrictMode 검증으로 다시 setup될 수 있다. 따라서 같은 setup이 다시 실행되어도 연결이 중복되거나 화면이 깨지지 않도록 cleanup과 함께 설계한다.

~~~tsx
useEffect(() => {
  const socket = createSocket(roomId);
  socket.connect();

  return () => {
    socket.disconnect();
  };
}, [roomId]);
~~~

`roomId`가 바뀌면 이전 방 연결을 끊은 뒤 새 방에 연결한다. 한 번만 실행된다고 가정해 cleanup을 생략하면 방이 바뀌었을 때 기존 연결이 남을 수 있다.

## 실습에서 확인할 것

`/week2/day11/effect-synchronization`에서 다음을 비교한다.

- `count`와 브라우저 `document.title`을 Effect로 맞추는 경우
- price와 quantity로 계산 가능한 total을 렌더링 값으로 두는 경우
- 외부 대상이 있는 동기화와 내부 State 중복 저장의 차이

## 기억할 문장

> Effect의 질문은 "언제 실행할까?"보다 "React 밖의 무엇을 최신 React 값과 맞춰야 할까?"에서 시작한다.
