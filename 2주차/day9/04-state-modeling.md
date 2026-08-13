# 최소 State와 상태 구조 설계

## State를 최소화하기

State로 저장할 수 있다고 해서 모두 State로 만들어야 하는 것은 아니다.

```tsx
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [fullName, setFullName] = useState("");
```

`fullName`은 `firstName`과 `lastName`으로부터 항상 계산할 수 있다.

```tsx
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const fullName = `${firstName}${lastName}`;
```

이런 값을 Derived State 또는 파생 값으로 이해한다.

판단 기준:

```text
다른 State/Props로부터 항상 계산 가능한가?
↓
Yes
↓
별도 State가 아닐 가능성이 높다.
```

State 중복을 줄이면:

- 동기화 문제 감소
- `useEffect` 감소
- 버그 가능성 감소
- 데이터 흐름 단순화

효과가 있다.

## 불필요한 State 예시

먼저 다음 구조를 작성한다.

```tsx
const [price, setPrice] = useState(0);
const [quantity, setQuantity] = useState(1);
const [totalPrice, setTotalPrice] = useState(0);

function handlePriceChange(nextPrice: number) {
  setPrice(nextPrice);
  setTotalPrice(nextPrice * quantity);
}

function handleQuantityChange(nextQuantity: number) {
  setQuantity(nextQuantity);
  setTotalPrice(price * nextQuantity);
}
```

이후 다음처럼 변경한다.

```tsx
const [price, setPrice] = useState(0);
const [quantity, setQuantity] = useState(1);
const totalPrice = price * quantity;
```

확인할 것:

- 어떤 구조가 더 단순한가?
- 첫 번째 구조에서는 어떤 State 동기화 버그가 발생할 수 있는가?
- 어떤 값을 State로 만들어야 하는가?

## 여러 State를 합칠지 분리할지 판단하기

관련된 값이라고 무조건 하나의 객체로 묶거나, 반대로 모든 값을 별도 State로 분리하지 않는다.

다음 구조를 생각한다.

```tsx
const [isOpen, setIsOpen] = useState(false);
const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
```

이 구조에서는 다음 상태가 가능하다.

```text
isOpen = true
selectedClipId = null
```

이 상태가 애플리케이션에서 의미 없다면 상태 설계 자체를 검토한다.

```tsx
type ClipModalState =
  | {
      status: "closed";
    }
  | {
      status: "opened";
      clipId: string;
    };

const [modalState, setModalState] = useState<ClipModalState>({
  status: "closed",
});
```

이렇게 하면 열린 모달은 반드시 `clipId`를 갖는다.

## Discriminated Union의 장점

TypeScript의 Discriminated Union은 상태별로 필요한 값을 타입 수준에서 분리한다.

```tsx
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Clip[] }
  | { status: "error"; message: string };
```

별도 boolean으로 관리하면 다음처럼 모순되는 조합이 가능하다.

```text
isLoading = true
isSuccess = true
isError = true
```

Union으로 표현하면 실제 가능한 상태만 모델링할 수 있다.

## 이벤트 핸들러와 렌더링 로직 구분

이벤트에 의해 실행되어야 하는 코드는 이벤트 핸들러에 둔다.

```tsx
function handleDelete() {
  deleteClip(clipId);
}
```

렌더링 과정에서 계산할 수 있는 값은 컴포넌트 본문에서 계산한다.

```tsx
const isDeleteDisabled = selectedClipIds.length === 0;
```

계산 가능한 값을 다시 State로 동기화하는 구조는 피할 수 있는 경우가 많다.

```tsx
useEffect(() => {
  if (selectedClipIds.length === 0) {
    setIsDeleteDisabled(true);
  } else {
    setIsDeleteDisabled(false);
  }
}, [selectedClipIds]);
```

Day 9에서는 이를 State 모델링 문제로 이해한다.

## 좋은 State 모델의 핵심

> 가능한 State 조합 중 애플리케이션에서 실제로 유효한 상태만 표현하도록 설계한다.
