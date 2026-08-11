# Day 8 빠른 복습 정리

## 학습 목표

- React의 Render Phase와 Commit Phase를 구분한다.
- 컴포넌트가 어떤 조건에서 리렌더링되는지 설명한다.
- 각 렌더링이 독립적인 State Snapshot을 가진다는 점을 이해한다.
- State Update Queue와 Batching의 흐름을 설명한다.
- React가 Component Identity를 판단하고 State를 보존하거나 초기화하는 기준을 이해한다.
- `key`가 목록 식별자뿐 아니라 reconciliation과 state 보존에 영향을 준다는 점을 이해한다.

## 상세 개념 파일

- [React 렌더링 모델](./01-react-rendering-model.md)
- [State as a Snapshot](./02-state-snapshot.md)
- [State Update Queue와 Batching](./03-state-update-queue-batching.md)
- [State 보존과 key](./04-state-identity-key.md)
- [프로젝트 연결 분석](./05-project-connection.md)
- [Interview Practice](./06-interview.md)

## 실행 예시

React playground에서 다음 경로로 실행한다.

- State Snapshot과 Update Queue: `/week2/day8/state-snapshot-queue`
- 부모와 자식 리렌더링: `/week2/day8/parent-child-render`
- Props 변경과 key Identity: `/week2/day8/profile-identity-key`
- 목록 key와 Reconciliation: `/week2/day8/list-key-reconciliation`

```bash
cd playgrounds/react
npm run dev
```

## 1. React Component와 React Element

React Component는 UI를 계산하는 함수 또는 클래스다.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}
```

React Element는 컴포넌트를 실행하거나 JSX를 해석해서 만들어지는 UI 설명 객체다.

```tsx
const element = <Greeting name="React" />;
```

핵심:

- Component는 UI를 만드는 정의다.
- Element는 특정 시점의 UI를 설명하는 값이다.
- 렌더링은 Component를 실행해 새로운 Element Tree를 계산하는 과정이다.

## 2. 렌더링이 발생하는 주요 조건

컴포넌트는 다음 조건에서 리렌더링될 수 있다.

- 자신의 State가 변경된다.
- 부모 컴포넌트가 리렌더링된다.
- 구독 중인 Context 값이 변경된다.
- `useSyncExternalStore` 같은 외부 Store 구독 값이 변경된다.

주의할 점:

- Props가 같아도 부모가 리렌더링되면 자식 컴포넌트 함수가 다시 실행될 수 있다.
- 리렌더링은 DOM 전체 재생성을 의미하지 않는다.
- 실제 DOM 변경 여부는 reconciliation 이후 Commit Phase에서 결정된다.

## 3. Render와 Commit

React 업데이트 흐름은 다음처럼 이해할 수 있다.

```text
State Update
→ Render
→ 새로운 UI 표현 계산
→ Reconciliation
→ 변경점 결정
→ Commit
→ 필요한 DOM 변경
```

Render Phase:

- 컴포넌트 함수를 실행한다.
- 새로운 React Element Tree를 계산한다.
- 이전 Tree와 비교할 후보를 만든다.
- 이 단계에서는 실제 DOM을 직접 변경하지 않는다.

Reconciliation:

- 이전 Element Tree와 다음 Element Tree를 비교한다.
- 컴포넌트 타입, 위치, `key` 등을 기준으로 어떤 노드를 유지할지 판단한다.
- 필요한 변경 작업을 계산한다.

Commit Phase:

- 계산된 변경 사항을 실제 DOM에 반영한다.
- 필요하면 ref를 연결하고 Effect 실행 준비가 이어진다.

핵심 문장:

> 컴포넌트가 리렌더링되었다고 해서 실제 DOM이 모두 다시 생성되는 것은 아니다.

## 4. State as a Snapshot

각 렌더링은 그 시점의 State 값을 가진다.

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount(count + 1);
    console.log("current snapshot:", count);
  };

  return (
    <button type="button" onClick={handleIncrease}>
      {count}
    </button>
  );
}
```

`console.log(count)`가 이전 값을 출력하는 이유:

- 이벤트 핸들러는 자신이 만들어진 렌더링의 State Snapshot을 참조한다.
- `setCount`는 현재 `count` 변수를 직접 바꾸지 않는다.
- `setCount`는 다음 렌더링을 요청한다.
- 새로운 State 값은 다음 렌더링에서 사용할 수 있다.

정확한 표현:

> `setState` 직후 값이 바뀌지 않는 이유를 단순히 "비동기라서"라고 설명하기보다, 현재 핸들러가 현재 렌더링의 Snapshot을 사용하기 때문이라고 설명해야 한다.

## 5. State Update Queue와 Batching

State Update는 즉시 변수 값을 바꾸는 것이 아니라 Queue에 등록된다. React는 여러 업데이트를 모아 한 번의 렌더링으로 처리할 수 있다.

값 기반 업데이트:

```tsx
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);
```

현재 `count`가 `0`이면 위 코드는 사실상 다음과 같다.

```tsx
setCount(1);
setCount(1);
setCount(1);
```

결과는 `+3`이 아니라 `+1`이다.

함수형 업데이트:

```tsx
setCount((previousCount) => previousCount + 1);
setCount((previousCount) => previousCount + 1);
setCount((previousCount) => previousCount + 1);
```

Queue에서 이전 업데이트 결과를 이어받는다.

```text
0 → 1 → 2 → 3
```

구분:

```text
State Snapshot
→ 각 업데이트가 어떤 값을 참조하는가?

Batching
→ 여러 업데이트를 언제 렌더링으로 반영하는가?
```

## 6. State 보존과 Component Identity

React는 State를 컴포넌트 함수 자체가 아니라 UI Tree상의 위치와 Identity에 연결해서 관리한다.

```tsx
<UserProfile userId={selectedUserId} />
```

Props만 바뀌면 같은 위치의 같은 컴포넌트로 판단되어 내부 State가 유지될 수 있다.

```tsx
<UserProfile key={selectedUserId} userId={selectedUserId} />
```

`key`가 바뀌면 React는 다른 Identity로 판단할 수 있고, 기존 State를 버리고 새 State로 시작한다.

정리:

```text
Props 변경
→ 같은 위치의 같은 Identity
→ State 유지 가능

key 변경
→ 다른 Identity
→ State 초기화 가능
```

## 7. `key`와 Reconciliation

`key`는 형제 Element 사이에서 이전 Element와 다음 Element를 대응시키는 Identity 정보다.

```tsx
items.map((item) => <Item key={item.id} item={item} />);
```

`key`가 중요한 상황:

- 목록 추가
- 목록 삭제
- 정렬
- 순서 변경
- 필터링

배열 index를 `key`로 쓰면 목록 순서가 바뀔 때 "같은 데이터"가 아니라 "같은 위치"를 같은 컴포넌트로 오해할 수 있다. 각 Row가 로컬 State를 가지고 있으면 입력값, 체크 상태, 포커스 등이 다른 데이터에 붙는 문제가 생길 수 있다.

## 8. 코드 실습 체크

오늘 확인할 실습:

- State Snapshot 확인
- 값 기반 업데이트와 함수형 업데이트 비교
- 부모 리렌더링 시 자식 컴포넌트 실행 확인
- `key` 변경으로 State 초기화하기
- index key로 목록 State가 잘못 매칭되는 문제 재현하기

`React.memo`는 이번 Day에서는 존재만 확인한다. 자세한 최적화 기준은 렌더링 최적화 파트에서 다룬다.

## 9. 프로젝트 연결 기준

프로젝트 코드를 볼 때는 발견한 코드를 바로 수정하지 말고 다음 순서로 분석한다.

```text
현재 동작
↓
React가 이렇게 동작하는 이유
↓
실제로 문제가 되는가?
↓
수정이 필요한가?
```

먼저 찾아볼 코드:

- 이전 State를 기반으로 갱신하면서 값 기반 `setState`를 사용하는 코드
- 동일 이벤트에서 여러 번 `setState` 하는 코드
- 변경·삭제·정렬 가능한 목록에서 배열 index를 `key`로 사용하는 코드
- 안정적이지 않은 값을 `key`로 사용하는 코드
- 사용자·탭·모달 전환에서 State가 의도치 않게 보존되거나 초기화되는 컴포넌트
- 부모 State 변경으로 자식 컴포넌트가 함께 리렌더링되는 구조

## 완료 조건

- [ ] React Component와 React Element의 차이를 설명할 수 있다.
- [ ] 컴포넌트가 리렌더링되는 주요 조건을 설명할 수 있다.
- [ ] Render Phase와 Commit Phase를 구분할 수 있다.
- [ ] 리렌더링과 실제 DOM 업데이트가 다른 개념임을 설명할 수 있다.
- [ ] Reconciliation의 목적을 설명할 수 있다.
- [ ] State Snapshot을 이벤트 핸들러와 연결하여 설명할 수 있다.
- [ ] State Update Queue와 Batching의 역할을 구분할 수 있다.
- [ ] 값 기반 업데이트와 함수형 업데이트의 차이를 코드로 설명할 수 있다.
- [ ] State가 보존되거나 초기화되는 조건을 설명할 수 있다.
- [ ] `key`와 Component Identity의 관계를 설명할 수 있다.
- [ ] 배열 index를 `key`로 사용했을 때 실제 문제가 발생하는 사례를 설명할 수 있다.
- [ ] 프로젝트 코드에서 렌더링·State·Identity 관련 문제를 최소 1개 분석할 수 있다.

## Day 8의 핵심 한 문장

> React의 State는 각 렌더링의 Snapshot이며, State Update는 새로운 렌더링을 요청하고, React는 Reconciliation을 거쳐 필요한 변경만 Commit한다.
