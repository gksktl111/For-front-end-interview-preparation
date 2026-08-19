# 프로젝트 연결 분석

## 분석 목적

Day 11에서는 "Effect가 실행되는가"가 아니라 "외부 시스템 동기화가 실제로 필요한가"를 기준으로 코드를 읽는다. 필요한 Effect라면 dependency, cleanup, 비동기 요청 수명까지 한 덩어리로 확인한다.

## 탐색 명령

~~~bash
rg -n "useEffect|useLayoutEffect" playgrounds/react/src
rg -n "addEventListener|setInterval|setTimeout|WebSocket|subscribe" playgrounds/react/src
rg -n "fetch\(|AbortController|response\.ok" playgrounds/react/src
rg -n "eslint-disable.*exhaustive-deps|exhaustive-deps" playgrounds/react/src
~~~

## 각 Effect를 읽는 순서

~~~text
이 Effect는 왜 존재하는가?
↓
React 밖의 어떤 시스템과 동기화하는가?
↓
렌더링 중 계산하거나 Event Handler에서 처리할 수 없는가?
↓
Effect가 읽는 reactive value는 무엇인가?
↓
dependency가 그것을 모두 선언하는가?
↓
연결, listener, timer, 요청을 해제해야 하는가?
↓
빠른 변경에서 Race Condition이 생길 수 있는가?
~~~

## 이 저장소에서 확인할 사례

### 1. App의 history Event Listener

파일:

- playgrounds/react/src/App.tsx

관찰:

~~~tsx
useEffect(() => {
  const handlePopState = () => {
    setCurrentPath(getCurrentPath());
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);
~~~

분석:

- `window`의 history 이벤트는 React 밖의 브라우저 시스템이다.
- 컴포넌트가 존재하는 동안 popstate를 구독해야 하므로 Effect가 적절하다.
- setup에서 등록한 같은 handler를 cleanup에서 제거하므로 StrictMode 재실행에도 연결이 누적되지 않는다.

### 2. Day 9의 파생 값 비교 실습

파일:

- playgrounds/react/src/examples/2주차/day9/DerivedStateLab.tsx

관찰:

~~~tsx
const [price, setPrice] = useState(12000);
const [quantity, setQuantity] = useState(2);
const derivedTotalPrice = price * quantity;
~~~

분석:

- `derivedTotalPrice`는 두 원천 State에서 계산할 수 있다.
- 실제 기능 코드에서 total을 Effect로 별도 State에 맞추면 동기화 누락과 추가 Render 가능성이 생긴다.
- 이 실습은 stored total과 derived total의 차이를 의도적으로 보여 주므로 수정 대상이 아니라 판단 연습용 긍정 사례다.

### 3. Day 1의 stale closure 실습

파일:

- playgrounds/react/src/examples/1주차/day1/StaleClosure.tsx

분석:

- 빈 dependency에서 만든 interval callback이 첫 렌더의 State Snapshot을 계속 참조하는 예시다.
- 함수형 업데이트가 맞는 상황과, 최신 값으로 외부 연결을 다시 설정해야 하는 상황을 구분하는 데 사용한다.
- 학습을 위한 의도적인 비교 코드이므로 production bug로 오해하지 않는다.

### 4. Day 2의 fetch client

파일:

- playgrounds/react/src/examples/1주차/day2/api/client.ts

관찰:

~~~tsx
if (!response.ok) {
  throw new Error(`면접 질문 조회 실패: ${response.status}`);
}
~~~

분석:

- HTTP 4xx, 5xx가 자동 reject된다고 가정하지 않고 `response.ok`를 확인한다.
- AbortError는 일반 서버 오류와 구분해 호출자에게 전달하거나 정상 취소로 처리해야 한다.

## 발견하면 점검할 위험 신호

| 패턴 | 위험 신호 | 우선 검토할 대안 |
| --- | --- | --- |
| State를 Effect로 다시 저장 | Props나 다른 State에서 계산 가능한 값 | 렌더링 중 계산 |
| 클릭 후 flag State를 Effect가 감시 | 원인이 사용자 Event인데 경로가 우회됨 | Event Handler |
| dependency 누락 | 오래된 Props, State, callback을 읽을 수 있음 | 실제 reactive value 선언, 구조 재검토 |
| listener 또는 timer cleanup 없음 | 재mount 뒤 중복 실행, 메모리 누수 | cleanup에서 정확한 해제 |
| fetch에 최신성 보호 없음 | 느린 이전 응답이 최신 화면을 덮음 | ignore flag 또는 AbortController |
| `response.ok` 확인 없음 | 404, 500 body를 정상 데이터처럼 처리 | status 검사 후 throw |
| AbortError와 일반 오류를 같은 UI로 처리 | 정상 취소를 오류로 노출 | AbortError 분기 |
| 서버 데이터를 Effect + Local State로만 관리 | cache, retry, invalidation, dedupe가 분산됨 | React Query 등 서버 상태 도구 검토 |

## Day 11 실습과 연결

| 실습 | 관찰할 코드 판단 |
| --- | --- |
| effect-synchronization | 브라우저 title처럼 외부 대상이 있을 때만 Effect를 쓴다. |
| event-handler-vs-effect | 삭제처럼 클릭이 원인인 로직은 handler에 둔다. |
| cleanup-strict-mode | listener setup과 cleanup이 짝인지 본다. |
| stale-closure-dependencies | callback이 어떤 렌더 Snapshot을 캡처했는지 본다. |
| effect-race-condition | cleanup이 이전 응답 반영을 막는 이유를 본다. |
| abort-controller | cleanup에서 요청 자체를 abort하고 HTTP 오류를 분리한다. |

## 제출할 분석 템플릿

~~~text
파일:
→

Effect 또는 비동기 작업:
→

동기화하는 외부 시스템:
→

Effect가 아닌 대안이 가능한가:
→ 렌더링 계산 / Event Handler / 해당 없음

reactive value와 dependency:
→

Cleanup 대상과 실행 시점:
→

Race Condition 또는 오류 처리 위험:
→

결론:
→
~~~

## 기억할 기준

코드에서 Effect를 발견했다고 곧바로 dependency를 고치거나 AbortController를 추가하지 않는다. 먼저 그 Effect가 존재하는 이유와 외부 시스템을 확인하고, 그 뒤 dependency·cleanup·요청 수명을 함께 설계한다.
