# 비동기 Effect, Race Condition, AbortController

## Effect callback을 직접 async로 만들지 않는다

Effect callback은 아무것도 반환하지 않거나 cleanup 함수를 반환해야 한다. 하지만 async 함수는 Promise를 반환한다.

~~~tsx
// 잘못된 형태
useEffect(async () => {
  await loadUser();
}, []);
~~~

대신 Effect 안에 async 함수를 만들고 호출한다.

~~~tsx
useEffect(() => {
  async function loadUser() {
    const user = await fetchUser(userId);
    setUser(user);
  }

  void loadUser();
}, [userId]);
~~~

## fetch와 HTTP Error를 구분한다

`fetch`는 네트워크 실패나 Abort에서 reject될 수 있지만, HTTP 400, 404, 500 응답은 Response 객체를 정상적으로 반환할 수 있다. 따라서 status를 직접 확인해야 한다.

~~~tsx
const response = await fetch(url, { signal });

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}

const data = await response.json();
~~~

| 상황 | fetch Promise |
| --- | --- |
| 네트워크 오류, CORS 오류, Abort | reject될 수 있다. |
| HTTP 400 / 404 / 500 | fulfilled될 수 있으므로 `response.ok`를 확인한다. |

## Race Condition이 생기는 과정

조회 조건이 빠르게 바뀌면 요청 시작 순서와 응답 완료 순서가 달라질 수 있다.

~~~text
userId = A
↓
느린 Request A 시작
↓
userId = B
↓
빠른 Request B 시작
↓
Request B 응답 → B 화면 표시
↓
Request A 늦은 응답 → A가 B를 덮어씀
~~~

아래 코드는 응답이 도착한 순서대로 무조건 State에 반영하므로 위험하다.

~~~tsx
useEffect(() => {
  async function loadUser() {
    const user = await fetchUser(userId);
    setUser(user);
  }

  void loadUser();
}, [userId]);
~~~

## 해결 1: 오래된 응답 무시

Cleanup이 실행되면 이전 Effect의 응답을 더 이상 사용하지 않도록 flag를 바꾼다.

~~~tsx
useEffect(() => {
  let ignore = false;

  async function loadUser() {
    const user = await fetchUser(userId);

    if (!ignore) {
      setUser(user);
    }
  }

  void loadUser();

  return () => {
    ignore = true;
  };
}, [userId]);
~~~

이 방식은 요청 자체를 중단하지 않는다. 이전 요청은 끝까지 실행되지만, 오래된 응답이 최신 UI를 덮지 못하게 한다. 취소할 수 없는 Promise에도 적용할 수 있다는 장점이 있다.

## 해결 2: AbortController로 요청 취소

`AbortController`는 취소 신호를 만들고, `signal`은 그 신호를 fetch에 전달한다. 실제 취소를 발생시키는 호출은 `controller.abort()`다.

~~~tsx
useEffect(() => {
  const controller = new AbortController();

  async function loadUser() {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const user = await response.json();
      setUser(user);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  void loadUser();

  return () => {
    controller.abort();
  };
}, [userId]);
~~~

~~~text
Request A 시작
↓
userId 변경
↓
A Effect Cleanup
↓
controller.abort()
↓
Request A 취소
↓
Request B 시작
~~~

## 두 방법의 차이

| 방식 | 이전 요청 | 오래된 결과 | 적합한 상황 |
| --- | --- | --- | --- |
| ignore flag | 계속 진행한다. | State 반영만 막는다. | 취소할 수 없는 비동기 작업, 간단한 최신 결과 보호 |
| AbortController | 가능하면 요청 자체를 중단한다. | AbortError를 정상 취소로 분리한다. | fetch, 검색어·폴더 전환처럼 이전 요청이 더 이상 필요 없는 경우 |

둘 다 Race Condition의 결과 반영을 제어하지만, AbortController는 불필요한 네트워크와 응답 처리도 줄인다.

## 직접 Effect fetch와 서버 상태 도구

학습에서는 `useEffect + fetch`로 요청 수명과 cleanup을 직접 이해해야 한다. 실무의 서버 상태에는 다음 책임도 함께 생긴다.

- loading, error, retry
- cache, stale data, deduplication
- refetch, invalidation
- query별 데이터 분리
- Race Condition과 취소

React Query 같은 도구는 이 책임을 queryKey와 cache, signal 전달 규칙으로 구조화한다.

~~~tsx
const query = useQuery({
  queryKey: ["user", userId],
  queryFn: ({ signal }) => fetchUser(userId, signal),
});
~~~

도구를 쓴다고 Effect의 원리를 몰라도 되는 것은 아니다. 이 Day의 목표는 직접 구현의 어려움을 경험해 왜 서버 상태 도구가 필요한지 이해하는 것이다.

## 실습에서 확인할 것

- `/week2/day11/effect-race-condition`: 느린 A 요청과 빠른 B 요청의 응답 순서를 뒤집고, ignore cleanup이 오래된 응답을 막는 과정을 본다.
- `/week2/day11/abort-controller`: cleanup이 AbortController에 abort를 전달해 이전 fetch를 취소하고, 500 응답은 `response.ok` 검사로 오류가 되는 과정을 본다.

## 기억할 문장

> 비동기 Effect는 요청을 시작하는 코드만이 아니라, dependency 변경과 unmount 뒤 그 요청을 어떻게 무효화하거나 취소할지까지 포함한 수명 설계다.
