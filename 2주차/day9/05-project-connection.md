# 프로젝트 연결 분석

## 분석 목적

Day 9에서는 프로젝트 코드에서 이벤트 처리와 State 모델링 문제를 찾는다.

분석 순서:

```text
이 값은 정말 State인가?
↓
다른 값에서 계산할 수 있는가?
↓
누가 이 State를 소유해야 하는가?
↓
같이 변경되는 State가 있는가?
↓
불가능한 상태 조합이 존재하는가?
```

## 탐색할 코드

현재 저장소에서는 먼저 React playground를 확인한다.

- `playgrounds/react/src/App.tsx`
- `playgrounds/react/src/examples/routes.tsx`
- `playgrounds/react/src/examples/1주차`
- `playgrounds/react/src/examples/2주차`

검색 예시:

```bash
rg -n "useState|set[A-Z].*\\(|stopPropagation|preventDefault|onClick=|onSubmit=" playgrounds/react/src
```

## 1. 객체나 배열 State 직접 변경

찾을 코드:

```tsx
items.push(newItem);
setItems(items);
```

또는:

```tsx
user.profile.nickname = "next-user";
setUser(user);
```

분석 템플릿:

```text
현재 동작
→ 기존 State 객체나 배열의 내부 값을 직접 바꾼다.

왜 문제가 되는가?
→ React와 memoization은 참조 비교를 기반으로 변경 여부를 판단하는 경우가 많다.

수정 방향
→ 변경되는 계층마다 새 객체나 배열을 만들어 setState에 전달한다.
```

## 2. 중첩 객체를 한 단계만 복사하는 코드

찾을 코드:

```tsx
const nextUser = { ...user };
nextUser.profile.nickname = "next-user";
setUser(nextUser);
```

분석:

- 최상위 `user` 객체는 새로 만들었다.
- 하지만 `profile` 객체 참조는 이전 State와 같다.
- `profile` 내부를 직접 수정하면 이전 State 내부도 함께 바뀐다.

수정:

```tsx
setUser((previousUser) => ({
  ...previousUser,
  profile: {
    ...previousUser.profile,
    nickname: "next-user",
  },
}));
```

## 3. 계산 가능한 값을 별도 State로 관리하는 코드

찾을 코드:

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
```

분석 템플릿:

```text
현재 동작
→ selectedIds로부터 계산 가능한 값을 별도 State로 저장한다.

왜 문제가 되는가?
→ 두 State를 항상 동기화해야 하며 누락 시 UI가 어긋난다.

수정 방향
→ const isDeleteDisabled = selectedIds.length === 0;
```

## 4. 서로 항상 함께 변경되는 State

찾을 코드:

```tsx
const [isOpen, setIsOpen] = useState(false);
const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
```

분석:

- `isOpen`과 `selectedClipId`가 항상 함께 의미를 만든다면 하나의 상태로 묶는 편이 명확할 수 있다.
- `isOpen = true`, `selectedClipId = null`이 유효하지 않다면 현재 모델은 불가능한 상태를 허용한다.

수정 후보:

```tsx
type ClipModalState =
  | { status: "closed" }
  | { status: "opened"; clipId: string };
```

## 5. boolean State가 과도하게 많은 코드

찾을 코드:

```tsx
const [isLoading, setIsLoading] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [isError, setIsError] = useState(false);
```

문제:

```text
isLoading = true
isSuccess = true
isError = true
```

같은 모순 상태가 가능해진다.

수정 후보:

```tsx
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };
```

## 6. 이벤트 핸들러 안의 책임 과다

찾을 코드:

```tsx
<button
  type="button"
  onClick={() => {
    // 검증
    // 데이터 변환
    // API 호출
    // 로깅
    // 상태 초기화
    // 라우팅
  }}
>
  저장
</button>
```

분석:

- 간단한 인자 전달은 `onClick={() => handleSelect(id)}`로 충분하다.
- 여러 단계의 비즈니스 로직이 들어가면 별도 핸들러 함수로 분리한다.
- 렌더링 JSX는 UI 구조를 읽는 데 집중되어야 한다.

## 7. `stopPropagation`과 `preventDefault` 사용 점검

찾을 코드:

```tsx
event.stopPropagation();
event.preventDefault();
```

판단:

- 부모 이벤트까지 실행되면 실제로 문제가 있는가?
- 브라우저 기본 동작을 막아야 하는 명확한 이유가 있는가?
- `<form>`을 쓰고 있다면 submit 이벤트를 중심으로 처리하고 있는가?

특히 `<form>` 내부 저장 버튼만 클릭 이벤트로 처리하고 submit 이벤트를 무시하면 Enter 제출, 접근성, 브라우저 기본 흐름을 놓칠 수 있다.

## 제출할 분석 예시

```text
파일:
→ playgrounds/react/src/examples/2주차/day9/DerivedStateLab.tsx

관찰:
→ price, quantity로 계산 가능한 totalPrice를 별도 State로 저장하면 동기화가 필요하다.

문제:
→ price만 바꾸고 totalPrice 갱신을 누락하면 화면에 불일치가 생긴다.

개선:
→ const derivedTotal = price * quantity로 렌더링 중 계산한다.
```
