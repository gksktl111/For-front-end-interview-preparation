# 비동기 요청 관리

- 비동기 요청은 실행뿐만 아니라 실패, 취소, 응답 순서까지 함께 관리해야 한다.
- 여러 요청이 동시에 실행되면 오래된 응답이 최신 상태를 덮어쓸 수 있다.
- React에서는 로딩과 에러 상태를 제공하고, 필요하지 않은 요청은 정리해야 한다.

## 비동기 에러 처리

- `await`으로 기다리던 Promise가 실패하면 `await` 위치에서 에러가 발생한다.
- `async/await`에서는 `try/catch`를 사용해 에러를 처리한다.
- 에러를 처리하지 않으면 `Unhandled Promise Rejection`이 발생할 수 있다.

```js
async function loadClips() {
  try {
    const response = await fetch("/api/clips");

    if (!response.ok) {
      throw new Error(`클립 조회 실패: ${response.status}`);
    }

    const clips = await response.json();

    return clips;
  } catch (error) {
    console.error("클립 조회 실패", error);
    throw error;
  }
}
```

## fetch 요청의 에러 처리

- `fetch`는 네트워크 요청 자체가 실패했을 때 Promise를 `rejected` 상태로 만든다.
- 서버가 `400`, `404`, `500` 등의 HTTP 오류를 반환해도 `fetch` Promise는 `fulfilled` 상태로 처리된다.
- 따라서 `response.ok`를 직접 확인해야 한다.

```js
async function fetchClips() {
  const response = await fetch("/api/clips");

  if (!response.ok) {
    throw new Error(`클립 조회 실패: ${response.status}`);
  }

  return response.json();
}
```

```text
네트워크 오류
→ fetch Promise가 rejected 상태가 됨

HTTP 오류
→ 서버 응답은 정상적으로 도착함
→ response.ok를 직접 확인해야 함
```

## 레이스 컨디션

- 여러 비동기 요청의 시작 순서와 완료 순서는 다를 수 있다.
- 오래된 요청이 나중에 완료되면 최신 요청의 결과를 덮어쓸 수 있다.
- 이러한 문제를 레이스 컨디션이라고 한다.

```js
async function searchClips(keyword) {
  const response = await fetch(
    `/api/clips/search?q=${keyword}`,
  );

  const clips = await response.json();

  renderClips(clips);
}

searchClips("react");
searchClips("javascript");
```

실제 응답 순서는 다음과 같을 수 있다.

```text
react 요청 시작
→ javascript 요청 시작
→ javascript 요청 완료
→ javascript 결과 반영
→ react 요청 완료
→ 오래된 react 결과가 화면을 덮어씀
```

JavaScript 코드가 한 번에 하나씩 실행되더라도 비동기 작업의 완료 순서는 보장되지 않는다.

### 최신 요청만 반영

각 요청에 번호를 부여하면 오래된 요청의 결과를 무시할 수 있다.

```js
let latestRequestId = 0;

async function searchClips(keyword) {
  const requestId = ++latestRequestId;

  const response = await fetch(
    `/api/clips/search?q=${keyword}`,
  );

  const clips = await response.json();

  if (requestId !== latestRequestId) {
    return;
  }

  renderClips(clips);
}
```

- 응답이 완료됐을 때 자신의 요청 번호가 최신 번호와 다르면 오래된 요청으로 판단한다.
- 오래된 요청의 결과는 화면에 반영하지 않는다.
- 요청 번호 방식은 오래된 응답을 무시하는 방법이고, `AbortController`는 오래된 요청 자체를 취소하는 방법이다.

## 요청 취소 구현

- `AbortController`를 사용하면 진행 중인 `fetch` 요청을 취소할 수 있다.
- 새로운 요청이 이전 요청을 대체하거나 요청 결과가 더 이상 필요하지 않을 때 사용한다.

```js
const controller = new AbortController();

fetch("/api/clips", {
  signal: controller.signal,
});

controller.abort();
```

```text
new AbortController()
→ 요청 취소를 관리하는 객체 생성

controller.signal
→ fetch에 취소 신호 전달

controller.abort()
→ signal과 연결된 요청 취소
```

## React Effect cleanup과 요청 취소

- Effect의 cleanup 함수는 컴포넌트가 제거될 때 실행된다.
- 의존성 값이 변경되면 새로운 Effect가 실행되기 전에 이전 cleanup이 실행된다.
- cleanup에서 이전 요청을 취소하면 오래된 응답이 최신 상태를 덮어쓰는 문제를 막을 수 있다.

```tsx
import { useEffect, useState } from "react";

type Clip = {
  id: string;
  content: string;
};

type ClipListProps = {
  folderId: string;
};

export function ClipList({ folderId }: ClipListProps) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClips() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/folders/${folderId}/clips`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            `클립 조회 실패: ${response.status}`,
          );
        }

        const data: Clip[] = await response.json();

        setClips(data);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error
            : new Error("알 수 없는 오류가 발생했습니다."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadClips();

    return () => {
      controller.abort();
    };
  }, [folderId]);

  if (isLoading) {
    return <p>클립을 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <ul>
      {clips.map((clip) => (
        <li key={clip.id}>{clip.content}</li>
      ))}
    </ul>
  );
}
```

`folderId`가 변경되면 다음 순서로 동작한다.

```text
폴더 A 요청 시작
→ folderId가 폴더 B로 변경
→ 이전 Effect cleanup 실행
→ 폴더 A 요청 취소
→ 새로운 Effect 실행
→ 폴더 B 요청 시작
→ 폴더 B 결과만 반영
```

## 요청 취소 에러 처리

- 요청을 취소하면 `fetch` Promise는 `rejected` 상태가 된다.
- 요청 취소는 의도된 동작이므로 일반적인 서버 오류와 구분해야 한다.

```js
try {
  const response = await fetch("/api/clips", {
    signal: controller.signal,
  });

  return await response.json();
} catch (error) {
  if (
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return;
  }

  throw error;
}
```

- `AbortError`를 구분하지 않으면 페이지 이동이나 검색어 변경 때 불필요한 오류 메시지가 표시될 수 있다.

## 로딩·성공·실패 상태 관리

- 비동기 요청은 데이터와 함께 요청 상태도 관리해야 한다.

```text
idle
→ loading
→ success

또는

idle
→ loading
→ error
```

- 요청 중에는 로딩 UI를 제공한다.
- 요청에 실패하면 에러 UI를 제공한다.
- `finally`는 성공과 실패 여부에 관계없이 실행되므로 로딩 상태를 종료할 때 사용할 수 있다.

```tsx
try {
  setIsLoading(true);
  setError(null);

  const data = await fetchClips();

  setClips(data);
} catch (error) {
  setError(
    error instanceof Error
      ? error
      : new Error("알 수 없는 오류가 발생했습니다."),
  );
} finally {
  setIsLoading(false);
}
```

## 중복 요청과 재시도

- 여러 컴포넌트가 동일한 데이터를 각각 조회하면 중복 요청이 발생할 수 있다.
- React Query는 쿼리 키를 기준으로 캐시와 요청 상태를 공유해 중복 요청을 줄인다.
- 직접 로딩, 에러, 캐시, 중복 요청을 모두 관리하면 복잡해지므로 React Query 같은 서버 상태 관리 도구를 사용할 수 있다.
- 조회 요청은 일시적인 네트워크 오류에 한해 제한적으로 재시도할 수 있다.
- 생성, 결제와 같은 요청은 중복 처리될 수 있으므로 자동 재시도에 주의해야 한다.

```text
조회 요청
→ 제한적인 재시도 가능

사용자 입력 오류
→ 자동 재시도 불필요

생성·결제 요청
→ 멱등성이 보장될 때만 재시도
```

## 핵심 정리

- `try/catch`로 비동기 에러를 처리한다.
- `fetch`에서는 `response.ok`를 직접 확인한다.
- 비동기 요청의 완료 순서는 보장되지 않는다.
- 오래된 요청이 최신 상태를 덮어쓰는 레이스 컨디션을 고려한다.
- `AbortController`로 필요하지 않은 요청을 취소한다.
- React에서는 Effect cleanup과 요청 취소를 연결한다.
- 요청 취소와 실제 요청 오류를 구분한다.
- 로딩과 에러 상태에 맞는 UI를 제공한다.
- 요청의 성격에 따라 중복 요청과 재시도 정책을 결정한다.
