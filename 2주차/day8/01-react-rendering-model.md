# React 렌더링 모델

## React Component

React Component는 UI를 계산하는 함수다.

```tsx
function UserName({ name }: { name: string }) {
  return <span>{name}</span>;
}
```

컴포넌트의 역할:

- Props와 State를 입력처럼 사용한다.
- React Element를 반환한다.
- 현재 상태에서 화면이 어떻게 보여야 하는지 선언한다.

컴포넌트는 DOM 노드가 아니다. 컴포넌트는 React가 UI 표현을 계산하기 위해 호출하는 함수다.

## React Element

React Element는 화면에 그릴 내용을 설명하는 값이다.

```tsx
const element = <UserName name="React" />;
```

JSX는 React Element를 만들기 위한 문법이다. React는 Element Tree를 바탕으로 이전 UI와 다음 UI를 비교하고 필요한 변경을 계산한다.

구분:

| 구분 | 의미 |
| --- | --- |
| Component | UI를 계산하는 함수 또는 클래스 |
| Element | 특정 시점의 UI를 설명하는 객체 |
| DOM Node | 브라우저가 실제 문서를 표현하는 객체 |

## 렌더링을 유발하는 조건

컴포넌트가 리렌더링될 수 있는 대표 조건은 다음과 같다.

### 1. 자신의 State 변경

```tsx
const [count, setCount] = useState(0);

setCount((count) => count + 1);
```

State Update가 등록되면 React는 해당 컴포넌트의 다음 UI를 계산한다.

### 2. 부모 컴포넌트의 리렌더링

```tsx
function Child({ name }: { name: string }) {
  console.log("Child rendered");
  return <div>{name}</div>;
}

export function Parent() {
  const [count, setCount] = useState(0);
  console.log("Parent rendered");

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

`Parent`가 리렌더링되면 `Child`의 Props가 같아도 `Child` 함수가 다시 실행될 수 있다. 이때 DOM이 반드시 바뀐다는 뜻은 아니다.

### 3. Context 값 변경

Context Provider의 `value`가 변경되면 해당 Context를 읽는 컴포넌트가 리렌더링될 수 있다.

```tsx
const ThemeContext = createContext("light");

function ThemeLabel() {
  const theme = useContext(ThemeContext);
  return <span>{theme}</span>;
}
```

### 4. 외부 Store 구독 값 변경

`useSyncExternalStore`나 상태 관리 라이브러리의 구독 값이 바뀌면 해당 값을 읽는 컴포넌트가 리렌더링될 수 있다.

## Render Phase

Render Phase는 React가 다음 UI를 계산하는 단계다.

이 단계에서 일어나는 일:

- 컴포넌트 함수를 호출한다.
- Props와 State를 읽어 React Element Tree를 만든다.
- 이전 렌더링 결과와 비교할 다음 UI 후보를 계산한다.

Render Phase에서 하지 말아야 할 일:

- DOM 직접 변경
- 네트워크 요청 시작
- 타이머 등록
- 외부 상태 변경

이런 작업은 렌더링이 아니라 Effect나 이벤트 핸들러에서 다루는 것이 맞다. Render Phase는 가능하면 순수 계산이어야 한다.

## Reconciliation

Reconciliation은 이전 Element Tree와 다음 Element Tree를 비교해 무엇을 유지하고 무엇을 바꿀지 판단하는 과정이다.

React가 보는 기준:

- Element의 타입
- UI Tree상의 위치
- 형제 사이의 `key`
- Props 변경 결과

예:

```tsx
{isEditing ? <EditForm /> : <Preview />}
```

같은 위치에서 컴포넌트 타입이 `EditForm`에서 `Preview`로 바뀌면 React는 다른 컴포넌트로 판단한다. 기존 State는 유지되지 않는다.

## Commit Phase

Commit Phase는 Render Phase와 Reconciliation에서 계산한 변경 사항을 실제 DOM에 반영하는 단계다.

이 단계에서 일어나는 일:

- 필요한 DOM 노드를 추가, 삭제, 수정한다.
- ref를 연결하거나 해제한다.
- 브라우저 화면에 반영될 실제 변경이 준비된다.
- 이후 Effect 실행 흐름이 이어진다.

## 리렌더링과 DOM 업데이트의 차이

리렌더링은 컴포넌트 함수를 다시 실행해 다음 UI를 계산하는 일이다.

DOM 업데이트는 계산된 변경 사항 중 실제 DOM에 반영할 것이 있을 때 Commit Phase에서 수행되는 일이다.

예를 들어 부모 State가 바뀌어 자식 컴포넌트가 다시 실행되더라도 자식이 반환한 DOM 구조와 텍스트가 이전과 같으면 실제 DOM 변경은 없거나 매우 작을 수 있다.

```text
리렌더링
→ 다음 React Element 계산

DOM 업데이트
→ 이전 DOM과 달라진 부분만 실제 브라우저 DOM에 반영
```

면접에서는 다음처럼 말할 수 있어야 한다.

> 리렌더링은 React가 UI를 다시 계산하는 과정이고, 실제 DOM 업데이트는 reconciliation 이후 필요한 변경만 Commit하는 과정이다. 따라서 리렌더링과 DOM 전체 재생성은 같은 의미가 아니다.
