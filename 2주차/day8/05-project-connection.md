# 프로젝트 연결 분석

## 분석 목적

Day 8에서는 프로젝트 코드를 고치기 전에 React가 왜 그렇게 동작하는지 먼저 설명한다.

분석 순서:

```text
현재 동작
↓
React가 이렇게 동작하는 이유
↓
실제로 문제가 되는가?
↓
수정이 필요한가?
```

## 탐색할 코드

현재 저장소에서는 먼저 React playground를 확인한다.

- `playgrounds/react/src/App.tsx`
- `playgrounds/react/src/examples/routes.tsx`
- `playgrounds/react/src/examples/1주차/day1/StaleClosure.tsx`
- `playgrounds/react/src/examples/1주차/day2`
- `playgrounds/react/src/examples/1주차/day5`

검색 예시:

```bash
rg -n "useState|set[A-Z].*\\(|key=\\{|React\\.memo|useContext" playgrounds/react/src
```

## 1. 이전 State 기반 갱신

찾을 코드:

```tsx
setCount(count + 1);
```

이전 State에 의존한다면 다음 형태가 더 안전한지 확인한다.

```tsx
setCount((count) => count + 1);
```

분석 템플릿:

```text
현재 동작
→ 현재 렌더링의 State Snapshot을 기준으로 다음 값을 계산한다.

React가 이렇게 동작하는 이유
→ 이벤트 핸들러는 자신이 만들어진 렌더링의 Snapshot을 참조한다.

실제로 문제가 되는가?
→ 같은 이벤트에서 여러 번 업데이트하거나, 타이머·Promise·구독 콜백에서 누적 업데이트하면 문제가 될 수 있다.

수정이 필요한가?
→ 이전 State를 기반으로 누적 계산하는 코드라면 함수형 업데이트로 바꾼다.
```

현재 저장소에서 관찰되는 좋은 예:

```tsx
setTick((value) => value + 1);
setLogs((previousLogs) => [...previousLogs, nextLog]);
setPendingCount((count) => Math.max(0, count - 1));
```

이런 코드는 이전 State를 기반으로 계산하므로 함수형 업데이트를 사용한다.

## 2. 동일 이벤트에서 여러 번 `setState` 하는 코드

찾을 코드:

```tsx
const handleReset = () => {
  setSelectedTopicId(INITIAL_TOPIC_ID);
  setResult(initialResult);
  setPendingCount(0);
  setLogs([createLog("reset", "default")]);
};
```

분석 템플릿:

```text
현재 동작
→ 하나의 이벤트에서 여러 State Update를 등록한다.

React가 이렇게 동작하는 이유
→ React는 여러 업데이트를 batching해서 한 번의 렌더링으로 반영할 수 있다.

실제로 문제가 되는가?
→ 서로 독립적인 State를 초기화하는 목적이면 문제가 아니다.

수정이 필요한가?
→ 업데이트 간 순서 의존성이 강하거나 하나의 상태로 묶는 편이 명확하면 reducer나 객체 State를 검토한다.
```

중요한 구분:

- 여러 `setState`가 있다고 무조건 나쁜 코드는 아니다.
- 서로 독립적인 UI 상태를 한 이벤트에서 초기화하는 것은 자연스러운 패턴이다.
- 이전 State에 의존하는 누적 업데이트인지, 단순히 특정 값으로 세팅하는지 구분한다.

## 3. `key` 안정성

찾을 코드:

```tsx
{items.map((item, index) => (
  <Item key={index} item={item} />
))}
```

현재 React playground에서는 대체로 안정적인 값을 `key`로 사용한다.

예:

```tsx
key={week.path}
key={day.path}
key={practice.path}
key={log.id}
key={topicId}
```

분석 템플릿:

```text
현재 동작
→ 목록의 각 항목을 path, id, topicId 같은 안정적인 값으로 식별한다.

React가 이렇게 동작하는 이유
→ React는 key로 이전 Element와 다음 Element를 대응시킨다.

실제로 문제가 되는가?
→ path나 id가 렌더링 사이에 안정적이면 문제가 아니다.

수정이 필요한가?
→ 목록이 추가·삭제·정렬될 수 있고 index key를 사용한다면 수정이 필요하다.
```

## 4. 부모 리렌더링과 자식 실행

찾을 코드:

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        {count}
      </button>
      <Child name="React" />
    </>
  );
}
```

분석 템플릿:

```text
현재 동작
→ 부모 State가 바뀌면 부모 컴포넌트가 리렌더링되고 자식 컴포넌트 함수도 다시 실행될 수 있다.

React가 이렇게 동작하는 이유
→ React는 부모의 다음 Element Tree를 계산하면서 자식 Element도 다시 계산한다.

실제로 문제가 되는가?
→ 자식 렌더링 비용이 작고 실제 DOM 변경이 없다면 문제가 아닐 수 있다.

수정이 필요한가?
→ 실제 성능 병목이 측정되고 Props가 안정적이라면 `React.memo`, `useMemo`, 컴포넌트 분리 등을 검토한다.
```

주의:

- 리렌더링 로그가 보인다고 곧바로 성능 문제라고 판단하지 않는다.
- DevTools Profiler로 실제 비용을 확인한다.
- `React.memo`는 최적화 파트에서 자세히 다룬다.

## 5. State가 의도치 않게 보존되는 경우

찾을 코드:

```tsx
<Editor selectedId={selectedId} />
```

가능한 현재 동작:

```text
사용자를 바꿨는데 Editor 내부 input 값이 유지된다.
```

React가 이렇게 동작하는 이유:

```text
같은 위치에 같은 Editor 컴포넌트가 렌더링되고 key가 바뀌지 않았기 때문에 같은 Identity로 판단한다.
```

실제로 문제가 되는가?

- 작성 중인 값을 유지해야 하는 UX라면 문제가 아니다.
- 사용자별로 완전히 분리된 입력 상태가 필요하면 문제다.

수정 후보:

```tsx
<Editor key={selectedId} selectedId={selectedId} />
```

또는 State를 사용자 id별 객체로 끌어올린다.

## 6. State가 의도치 않게 초기화되는 경우

찾을 코드:

```tsx
{isOpen && <Modal />}
```

가능한 현재 동작:

```text
모달을 닫았다가 다시 열면 내부 입력 State가 초기화된다.
```

React가 이렇게 동작하는 이유:

```text
조건부 렌더링으로 Modal이 UI Tree에서 제거되면 해당 위치의 State도 제거된다.
다시 렌더링하면 새 컴포넌트로 마운트된다.
```

실제로 문제가 되는가?

- 닫을 때 입력을 버리는 UX라면 정상이다.
- 닫았다 열어도 작성 중인 값을 유지해야 한다면 문제가 된다.

수정 후보:

- State를 부모로 끌어올린다.
- 모달을 제거하지 않고 숨김 상태로 유지한다.
- 요구사항에 맞게 닫기와 초기화 동작을 분리한다.

## 7. 분석 기록 양식

프로젝트에서 실제 코드를 발견하면 아래 양식으로 기록한다.

```md
## 발견한 코드

- 파일:
- 위치:
- 관련 개념:

### 현재 동작

### React가 이렇게 동작하는 이유

### 실제로 문제가 되는가?

### 수정이 필요한가?

### 수정한다면 선택지
```

## 오늘의 결론

현재 저장소의 React playground는 대체로 이전 State 기반 갱신에 함수형 업데이트를 사용하고, 목록 `key`도 `path`, `id`, `topicId`처럼 안정적인 값을 사용하는 편이다.

Day 8에서 중요한 점은 "리렌더링이 보인다" 또는 "`setState`가 여러 번 있다"를 곧바로 문제로 판단하지 않는 것이다. React의 Snapshot, Queue, Batching, Identity 기준으로 현재 동작을 설명한 뒤 실제 문제가 되는지 판단해야 한다.
