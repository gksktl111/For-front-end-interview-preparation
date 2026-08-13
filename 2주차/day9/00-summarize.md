# Day 9 빠른 개념 복습

## 오늘의 한 문장

> 좋은 React 상태 관리는 필요한 최소 State만 두고, 이벤트로 예측 가능하게 변경하며, 나머지 UI 값은 그 State로부터 계산하는 것이다.

## 10분 복습 순서

1. `onClick={handleClick}`과 `onClick={handleClick()}`의 차이를 설명한다.
2. 이벤트 전파 흐름과 `target`, `currentTarget` 차이를 말한다.
3. `stopPropagation`과 `preventDefault`를 목적 기준으로 구분한다.
4. 객체와 배열 State를 왜 직접 수정하면 안 되는지 참조 기준으로 설명한다.
5. 계산 가능한 값과 불가능한 상태 조합을 찾아 State 모델을 줄인다.

## 상세 문서와 실습

- [React 이벤트 처리](./01-react-event-handling.md)
- [이벤트 전파와 기본 동작](./02-event-propagation-default.md)
- [State 불변성](./03-state-immutability.md)
- [최소 State와 상태 구조 설계](./04-state-modeling.md)
- [프로젝트 연결 분석](./05-project-connection.md)
- [Interview Practice](./06-interview.md)

React playground:

- `/week2/day9/event-propagation-default`
- `/week2/day9/state-immutability`
- `/week2/day9/derived-state`
- `/week2/day9/state-modeling`
- `/week2/day9/event-state-snapshot`

```bash
cd playgrounds/react
npm run dev
```

## 핵심 개념 압축

| 개념 | 빠른 정의 | 면접에서 꼭 붙일 말 |
| --- | --- | --- |
| 이벤트 핸들러 전달 | 이벤트가 발생했을 때 실행할 함수를 넘기는 것 | `onClick={handleClick}`은 함수 전달이다. |
| 이벤트 핸들러 호출 | 렌더링 중 함수를 즉시 실행하는 것 | `onClick={handleClick()}`은 반환값을 넘긴다. |
| Event Bubbling | 이벤트가 자식에서 부모 방향으로 전파되는 흐름 | child handler 후 parent handler가 실행될 수 있다. |
| `target` | 실제 이벤트가 발생한 Element | 버튼 안의 span을 누르면 span일 수 있다. |
| `currentTarget` | 현재 핸들러가 등록된 Element | 버튼 핸들러 안에서는 버튼이다. |
| `stopPropagation` | 부모 방향 이벤트 전파를 막음 | 부모 클릭까지 실행되면 안 될 때만 쓴다. |
| `preventDefault` | 브라우저 기본 동작을 막음 | form submit, link navigation 제어에 쓴다. |
| 불변 업데이트 | 기존 State를 수정하지 않고 새 값으로 교체 | 변경되는 객체 계층마다 새 참조를 만든다. |
| Derived State | 다른 State/Props로 계산 가능한 값 | 별도 State로 두면 동기화 버그가 생길 수 있다. |
| State Modeling | 유효한 상태 조합만 표현하도록 설계 | boolean 여러 개보다 union 상태가 더 명확할 수 있다. |

## 코드로 바로 설명하기

### 1. 핸들러 전달과 호출

```tsx
<button type="button" onClick={handleClick}>
  저장
</button>
```

- 클릭할 때 `handleClick`이 실행된다.

```tsx
<button type="button" onClick={handleClick()}>
  저장
</button>
```

- 렌더링 중 `handleClick`이 즉시 실행된다.
- 반환값이 `onClick`에 전달된다.
- 의도하지 않은 side effect나 반복 렌더링을 만들 수 있다.

### 2. 전파와 기본 동작

```tsx
function handleChildClick(event: React.MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
}
```

정리:

- `stopPropagation`: 부모 이벤트 실행 방지
- `preventDefault`: 브라우저 기본 동작 방지
- 둘은 대체 관계가 아니다.

### 3. 중첩 객체 State 업데이트

```tsx
user.profile.nickname = "next-user";
setUser(user);
```

- 기존 State 객체를 직접 수정한다.
- 같은 참조를 다시 전달한다.
- React와 memoization이 변경을 놓칠 수 있다.

```tsx
setUser((previousUser) => ({
  ...previousUser,
  profile: {
    ...previousUser.profile,
    nickname: "next-user",
  },
}));
```

- `user`도 새 객체, `profile`도 새 객체로 만든다.
- Spread는 한 단계 얕은 복사이므로 변경 계층마다 복사해야 한다.

### 4. 계산 가능한 값을 State로 두지 않기

```tsx
const [price, setPrice] = useState(0);
const [quantity, setQuantity] = useState(1);
const [totalPrice, setTotalPrice] = useState(0);
```

- `totalPrice`는 `price * quantity`로 계산 가능하다.
- 별도 State로 두면 `price`, `quantity`, `totalPrice`를 항상 동기화해야 한다.

```tsx
const [price, setPrice] = useState(0);
const [quantity, setQuantity] = useState(1);
const totalPrice = price * quantity;
```

- 원천 State는 `price`, `quantity`다.
- `totalPrice`는 렌더링 중 계산하는 파생 값이다.

### 5. 불가능한 State 조합 제거

```tsx
const [isOpen, setIsOpen] = useState(false);
const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
```

가능하지만 의미가 애매한 조합:

```text
isOpen = true
selectedClipId = null
```

개선:

```tsx
type ClipModalState =
  | { status: "closed" }
  | { status: "opened"; clipId: string };
```

- 열린 상태는 반드시 `clipId`를 가진다.
- TypeScript가 유효한 상태 조합만 다루도록 도와준다.

## 헷갈리기 쉬운 표현 교정

| 부정확한 표현 | 더 정확한 표현 |
| --- | --- |
| `onClick={handleClick()}`은 클릭하면 실행된다. | 렌더링 중 즉시 실행되고 반환값이 `onClick`에 들어간다. |
| `stopPropagation`은 기본 동작을 막는다. | 부모 방향 이벤트 전파를 막는다. |
| `preventDefault`는 부모 이벤트를 막는다. | 브라우저 기본 동작을 막는다. |
| 객체를 spread하면 깊은 복사된다. | Spread는 얕은 복사다. 중첩 객체는 따로 복사해야 한다. |
| 계산할 수 있어도 State로 두면 편하다. | 중복 State는 동기화 책임과 버그 가능성을 만든다. |
| 관련 값은 무조건 객체 State로 묶는다. | 함께 변경되고 모순 조합이 생길 때 묶는 것을 검토한다. |

## State 판단 질문

새 State를 만들기 전에 이 순서로 확인한다.

```text
이 값은 시간에 따라 변하는 원천 값인가?
↓
다른 State나 Props로 항상 계산 가능한가?
↓
누가 이 값을 소유해야 하는가?
↓
항상 함께 변경되는 State가 있는가?
↓
불가능한 상태 조합이 생기는가?
```

판단 결과:

- 계산 가능하면 State가 아니라 파생 값으로 둔다.
- 여러 값이 함께 하나의 의미를 만들면 하나의 상태 모델을 검토한다.
- 모순 상태가 가능하면 boolean 여러 개보다 `status` union을 검토한다.

## 프로젝트 점검 질문

찾아볼 패턴:

- 객체나 배열 State를 직접 수정하는 코드
- 중첩 객체를 한 단계만 spread하고 내부 객체를 직접 수정하는 코드
- 다른 State/Props로 계산 가능한 값을 별도 State로 관리하는 코드
- `isOpen`, `selectedId`처럼 항상 함께 의미를 만드는 값이 분리된 코드
- `isLoading`, `isSuccess`, `isError`처럼 모순 조합이 가능한 boolean State
- `onClick={() => ...}` 안에 비즈니스 로직이 길게 들어간 코드
- 이유 없이 쓰인 `stopPropagation()` 또는 `preventDefault()`
- `<form>`을 쓰면서 `onSubmit` 대신 버튼 `onClick`만 사용하는 코드

## 완료 체크

- [ ] 핸들러 전달과 호출의 차이를 설명할 수 있다.
- [ ] Event Bubbling 흐름을 설명할 수 있다.
- [ ] `target`과 `currentTarget`의 차이를 설명할 수 있다.
- [ ] `stopPropagation`과 `preventDefault`를 구분할 수 있다.
- [ ] 객체와 배열 State를 불변하게 업데이트할 수 있다.
- [ ] Spread가 얕은 복사라는 점을 설명할 수 있다.
- [ ] 계산 가능한 값을 State로 만들지 않을 수 있다.
- [ ] 여러 State를 합칠지 분리할지 판단할 수 있다.
- [ ] 불가능한 상태 조합을 union 상태로 개선할 수 있다.
- [ ] 이벤트 핸들러와 렌더링 계산의 책임을 구분할 수 있다.
