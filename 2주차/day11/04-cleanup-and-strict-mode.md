# Cleanup과 StrictMode

## Cleanup이 필요한 이유

Effect가 만든 외부 연결, 구독, timer, 요청은 React가 자동으로 모두 해제해 주지 않는다. Effect는 cleanup 함수를 반환해 이전 setup이 만든 작업을 직접 정리할 수 있다.

~~~tsx
useEffect(() => {
  const handleResize = () => {
    console.log(window.innerWidth);
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
~~~

이 코드는 브라우저의 resize Event Listener를 등록하고, 더 이상 이 연결이 유효하지 않을 때 같은 handler를 제거한다.

## Cleanup 실행 순서

~~~text
Effect setup
↓
외부 연결 생성

dependency 변경
↓
이전 Cleanup
↓
새 Effect setup

컴포넌트 제거
↓
마지막 Cleanup
~~~

예를 들어 `roomId`에 따라 WebSocket 방을 연결하면, roomId가 바뀌는 순간 이전 방을 먼저 끊고 새 방에 연결해야 한다.

~~~tsx
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();

  return () => {
    connection.disconnect();
  };
}, [roomId]);
~~~

Cleanup은 "컴포넌트가 사라질 때만 실행되는 코드"가 아니다. dependency가 바뀔 때 이전 setup을 되돌리는 짝이다.

## 대표적인 Cleanup 대상

| 대상 | setup | cleanup |
| --- | --- | --- |
| Event Listener | `addEventListener` | `removeEventListener` |
| Timer | `setInterval`, `setTimeout` | `clearInterval`, `clearTimeout` |
| WebSocket | `connect` | `disconnect`, `close` |
| Subscription | `subscribe` | unsubscribe 함수 호출 |
| 진행 중 HTTP 요청 | fetch에 signal 전달 | `controller.abort()` |
| 외부 라이브러리 | 인스턴스 또는 리스너 생성 | destroy, dispose, off 호출 |

## Timer 예제

~~~tsx
useEffect(() => {
  const timerId = window.setInterval(() => {
    setElapsed((previous) => previous + 1);
  }, 1000);

  return () => {
    window.clearInterval(timerId);
  };
}, []);
~~~

component가 사라진 뒤에도 timer가 남으면 필요 없는 작업이 계속된다. dependency가 timer의 설정값을 읽는다면 그 값이 바뀔 때도 기존 timer를 정리한 뒤 새로 등록한다.

## StrictMode에서 Effect가 다시 실행되는 이유

개발 환경의 React StrictMode는 Effect의 cleanup 누락을 빨리 드러내기 위해 다음과 비슷한 검증 흐름을 만들 수 있다.

~~~text
Effect setup
↓
Cleanup
↓
Effect setup
~~~

따라서 개발 중 API 요청이나 listener 등록이 두 번 보인다고 해서 무조건 React 버그라고 판단하면 안 된다. 중요한 것은 setup이 반복되어도 외부 시스템이 올바른 상태에 남는가, cleanup이 이전 setup을 정확히 되돌리는가다.

production build에서는 이 개발 전용 검증 흐름이 그대로 적용되지 않는다. 그러나 StrictMode를 피해 가기 위해 cleanup을 제거하거나 ref로 억지로 한 번만 실행시키는 것은 문제를 숨기는 방식이다.

## StrictMode에서 확인해야 할 것

- setup마다 연결 하나가 늘어나지 않는가?
- cleanup이 setup과 정확히 짝을 이루는가?
- API 요청이 재실행되어도 오래된 결과가 화면을 덮지 않는가?
- 비동기 요청의 AbortError를 일반 오류처럼 사용자에게 표시하지 않는가?
- 외부 라이브러리 인스턴스가 두 개 남지 않는가?

## Cleanup을 생략하면 생길 수 있는 일

| 상황 | 생길 수 있는 문제 |
| --- | --- |
| Event Listener | component가 사라진 뒤에도 callback이 실행되거나 같은 이벤트가 중복 처리된다. |
| interval | 화면을 떠난 뒤에도 timer가 계속 실행된다. |
| WebSocket | 이전 방의 메시지가 계속 들어오거나 연결이 누적된다. |
| fetch | 더 이상 필요 없는 응답이 늦게 와서 최신 화면을 덮을 수 있다. |
| 외부 위젯 | DOM과 메모리 리소스가 중복으로 남는다. |

## 실습에서 확인할 것

`/week2/day11/cleanup-strict-mode`에서 subscriber를 mount와 unmount하고, 브라우저 resize 이벤트를 발생시킨다.

- 현재 연결이 mount 상태에서만 이벤트를 받는지
- trace에서 setup → cleanup → setup이 보일 수 있는 이유
- StrictMode가 개발 단계에서 cleanup 누락을 찾는 데 어떤 도움을 주는지

## 기억할 문장

> Cleanup은 Effect의 부가 기능이 아니라, 이전 setup이 만든 외부 시스템 상태를 새 setup 또는 unmount 전에 정확히 되돌리는 계약이다.
