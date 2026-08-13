# Day 8 빠른 개념 복습

## 오늘의 한 문장

> React는 State Update가 발생하면 컴포넌트를 다시 실행해 다음 UI를 계산하고, 이전 UI와 비교한 뒤 필요한 DOM 변경만 Commit한다.

## 10분 복습 순서

1. `Component → Render → Reconciliation → Commit` 흐름을 말로 설명한다.
2. `setState` 직후 이전 값이 보이는 이유를 State Snapshot으로 설명한다.
3. 값 기반 업데이트와 함수형 업데이트의 결과 차이를 코드로 설명한다.
4. State가 보존되거나 초기화되는 기준을 위치, 타입, `key`로 설명한다.
5. index key가 왜 위험한지 "Row 로컬 State가 데이터가 아니라 위치에 붙는다"로 설명한다.

## 상세 문서와 실습

- [React 렌더링 모델](./01-react-rendering-model.md)
- [State as a Snapshot](./02-state-snapshot.md)
- [State Update Queue와 Batching](./03-state-update-queue-batching.md)
- [State 보존과 key](./04-state-identity-key.md)
- [프로젝트 연결 분석](./05-project-connection.md)
- [Interview Practice](./06-interview.md)

React playground:

- `/week2/day8/state-snapshot-queue`
- `/week2/day8/parent-child-render`
- `/week2/day8/profile-identity-key`
- `/week2/day8/list-key-reconciliation`

```bash
cd playgrounds/react
npm run dev
```

## 핵심 개념 압축

| 개념 | 빠른 정의 | 면접에서 꼭 붙일 말 |
| --- | --- | --- |
| Component | UI를 계산하는 함수 또는 클래스 | Component는 정의이고 Element는 특정 시점의 UI 설명 값이다. |
| Render | 컴포넌트 함수를 실행해 다음 React Element Tree를 계산하는 단계 | Render가 곧 DOM 변경은 아니다. |
| Reconciliation | 이전 Tree와 다음 Tree를 비교해 변경 후보를 정하는 과정 | 타입, 위치, `key`가 Identity 판단에 중요하다. |
| Commit | 계산된 변경을 실제 DOM에 반영하는 단계 | 실제 DOM 변경은 Commit에서 일어난다. |
| State Snapshot | 한 렌더링 안에서 State 값이 고정되어 있는 모델 | 이벤트 핸들러는 자신이 만들어진 렌더링의 값을 읽는다. |
| Update Queue | State Update가 렌더링 전에 쌓이는 구조 | 함수형 업데이트는 Queue의 이전 결과를 이어받는다. |
| Batching | 여러 업데이트를 한 번의 렌더링으로 묶는 처리 | Snapshot과 Batching은 다른 개념이다. |
| key | 형제 Element 사이의 Identity 정보 | 목록뿐 아니라 State 보존과 초기화에도 영향을 준다. |

## 코드로 바로 설명하기

### 1. `setState` 직후 이전 값

```tsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  console.log(count);
}
```

답변 뼈대:

- `handleClick`은 현재 렌더링에서 만들어진 함수다.
- 함수 안의 `count`는 현재 렌더링의 Snapshot이다.
- `setCount`는 현재 변수를 바꾸지 않고 다음 렌더링을 요청한다.
- 그래서 로그는 이전 값이고, 새 값은 다음 렌더링에서 읽는다.

### 2. 값 기반 업데이트 vs 함수형 업데이트

```tsx
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);
```

현재 `count`가 `0`이면 결과는 `1`이다.

```tsx
setCount((previousCount) => previousCount + 1);
setCount((previousCount) => previousCount + 1);
setCount((previousCount) => previousCount + 1);
```

현재 `count`가 `0`이면 결과는 `3`이다.

정리:

- 값 기반 업데이트는 같은 Snapshot 값을 읽는다.
- 함수형 업데이트는 Queue에서 직전 업데이트 결과를 인자로 받는다.

### 3. Props 변경과 State 보존

```tsx
<UserProfile userId={selectedUserId} />
```

- 같은 위치의 같은 컴포넌트면 Props가 바뀌어도 내부 State가 보존될 수 있다.

```tsx
<UserProfile key={selectedUserId} userId={selectedUserId} />
```

- `key`가 바뀌면 다른 Identity로 판단되어 State가 초기화될 수 있다.

## 헷갈리기 쉬운 표현 교정

| 부정확한 표현 | 더 정확한 표현 |
| --- | --- |
| `setState`는 비동기라서 바로 안 바뀐다. | 현재 핸들러는 현재 렌더링의 State Snapshot을 읽고, `setState`는 다음 렌더링을 요청한다. |
| 리렌더링되면 DOM이 전부 다시 만들어진다. | 리렌더링은 다음 UI를 계산하는 과정이고, 실제 DOM 변경은 Commit에서 필요한 부분만 일어난다. |
| Props가 바뀌면 자식 State가 초기화된다. | 같은 위치의 같은 Identity면 Props가 바뀌어도 State가 보존될 수 있다. |
| `key`는 warning 제거용이다. | `key`는 형제 Element 사이의 Identity 정보이며 reconciliation과 State 보존에 영향을 준다. |
| index key는 항상 나쁘다. | 정렬, 삽입, 삭제, 필터링이 있는 목록에서 Row 로컬 State가 있으면 위험하다. |

## 프로젝트 점검 질문

코드를 볼 때 바로 수정하지 말고 이 순서로 판단한다.

```text
현재 동작은 무엇인가?
↓
React가 이렇게 동작하는 이유는 무엇인가?
↓
실제로 사용자에게 문제가 되는가?
↓
수정이 필요한가?
```

찾아볼 패턴:

- 이전 State를 기반으로 갱신하면서 `setValue(value + 1)`처럼 값 기반 업데이트를 쓰는 코드
- 같은 이벤트에서 같은 State를 여러 번 업데이트하는 코드
- 변경, 삭제, 정렬 가능한 목록에서 index key를 쓰는 코드
- 사용자, 탭, 모달 전환 시 내부 입력 State가 의도치 않게 유지되는 컴포넌트
- `key` 변경으로 필요 이상 State가 초기화되는 컴포넌트
- 부모 State 변경 때문에 자식 함수가 다시 실행되는 구조

## 완료 체크

- [ ] Render와 Commit을 구분해 설명할 수 있다.
- [ ] 리렌더링과 실제 DOM 업데이트가 다르다고 설명할 수 있다.
- [ ] State Snapshot으로 `setState` 직후 로그를 설명할 수 있다.
- [ ] 값 기반 업데이트와 함수형 업데이트의 결과 차이를 설명할 수 있다.
- [ ] Batching과 Snapshot을 구분할 수 있다.
- [ ] State 보존 기준을 위치, 타입, `key`로 설명할 수 있다.
- [ ] index key의 실제 문제를 예시로 설명할 수 있다.
