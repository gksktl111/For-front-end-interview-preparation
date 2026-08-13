# Day 9 Interview Practice

면접 질문을 보고 바로 아래 `내 답변` 칸에 스스로 답변을 적는 용도입니다.

---

## 1. `onClick={handleClick}`과 `onClick={handleClick()}`의 차이는 무엇인가?

### 내 답변

- `onClick={handleClick}`은 함수를 이벤트 핸들러로 전달하므로 클릭 이벤트가 발생했을 때 실행된다. 반면 `onClick={handleClick()}`은 렌더링 중 `handleClick`을 즉시 실행하고, 그 반환값을 `onClick`에 전달한다. 일반적인 이벤트 핸들러는 함수 자체를 전달해야 한다.

### 체크 포인트

- 함수 전달과 함수 호출 구분
- 렌더링 중 즉시 실행 여부
- 반환값이 핸들러로 들어간다는 점
- side effect와 반복 렌더링 위험

---

## 2. React 이벤트 핸들러에서는 어떤 값을 전달받는가?

### 내 답변

- React 이벤트 핸들러는 이벤트 객체를 전달받을 수 있다. 마우스 이벤트라면 `React.MouseEvent`, 폼 제출이라면 `React.FormEvent`처럼 이벤트 종류와 Element 타입에 맞게 타입을 지정할 수 있다. 이벤트 객체로 `target`, `currentTarget`, `preventDefault`, `stopPropagation` 등을 사용할 수 있다.

### 체크 포인트

- 이벤트 객체
- 이벤트 종류별 타입
- `target`과 `currentTarget`
- 기본 동작과 전파 제어 메서드

---

## 3. 이벤트 핸들러 내부에서 State는 어떤 렌더링의 값을 참조하는가?

### 내 답변

- 이벤트 핸들러는 자신이 만들어진 렌더링의 State Snapshot을 참조한다. `setState`를 호출해도 현재 핸들러 안의 State 변수 자체가 바뀌지는 않는다. 새로운 State 값은 다음 렌더링에서 사용할 수 있다.

### 체크 포인트

- 렌더링별 State Snapshot
- 핸들러는 생성된 렌더링의 값을 참조
- `setState`는 현재 변수를 직접 변경하지 않음
- 새 값은 다음 렌더링에서 읽음

---

## 4. Event Bubbling이란 무엇인가?

### 내 답변

- 중첩된 Element에서 이벤트가 발생했을 때 이벤트가 실제 발생한 자식 Element에서 시작해 부모 Element 방향으로 전파되는 흐름이다. 예를 들어 버튼이 `div` 안에 있고 둘 다 `onClick`을 가지고 있다면, 버튼 클릭 시 버튼 핸들러가 실행된 뒤 부모 `div` 핸들러도 실행될 수 있다.

### 체크 포인트

- 자식에서 부모 방향 전파
- 중첩 Element
- child handler 이후 parent handler
- React 이벤트 처리 흐름과 연결

---

## 5. `event.target`과 `event.currentTarget`의 차이는 무엇인가?

### 내 답변

- `event.target`은 실제 이벤트가 발생한 Element이고, `event.currentTarget`은 현재 실행 중인 이벤트 핸들러가 등록된 Element다. 버튼 안의 아이콘을 클릭하면 `target`은 아이콘일 수 있지만, 버튼에 등록된 핸들러 안의 `currentTarget`은 버튼이다.

### 체크 포인트

- 실제 이벤트 발생 지점
- 현재 핸들러 등록 Element
- 중첩 Element에서 달라질 수 있음

---

## 6. `stopPropagation()`은 언제 사용하는가?

### 내 답변

- 이벤트가 부모로 전파되면 안 되는 명확한 이유가 있을 때 사용한다. 예를 들어 카드 클릭은 상세 페이지 이동이고 카드 내부 삭제 버튼은 삭제만 해야 한다면, 삭제 버튼 클릭에서 부모 카드 클릭까지 실행되지 않도록 `stopPropagation()`을 사용할 수 있다. 습관적으로 넣는 것은 피해야 한다.

### 체크 포인트

- 부모 이벤트 실행 방지
- 명확한 이유가 있을 때만 사용
- 기본 동작 방지와 다름

---

## 7. `preventDefault()`의 역할은 무엇인가?

### 내 답변

- 브라우저가 제공하는 기본 동작을 막는다. 예를 들어 form submit으로 페이지가 새로고침되는 것을 막고 React 코드에서 직접 제출 처리를 하려면 submit 이벤트에서 `event.preventDefault()`를 호출한다.

### 체크 포인트

- 브라우저 기본 동작 방지
- form submit, link navigation
- 이벤트 전파 중단과 구분

---

## 8. React State를 직접 수정하면 안 되는 이유는 무엇인가?

### 내 답변

- React State를 직접 수정하면 이전 State와 다음 State가 같은 참조를 공유할 수 있고, React나 memoization이 변경을 감지하기 어려워질 수 있다. 또한 이전 값과 다음 값을 비교하기 어렵고, 중첩 객체에서는 의도치 않게 이전 State까지 함께 오염될 수 있다. 그래서 변경된 상태를 나타내는 새 객체나 배열을 만들어 업데이트해야 한다.

### 체크 포인트

- 참조 동일성 문제
- memoized child와 의존성 비교 문제
- 이전 값 오염
- 새 객체/배열 생성

---

## 9. Spread Operator는 깊은 복사를 수행하는가?

### 내 답변

- 아니다. Spread Operator는 한 단계 얕은 복사를 수행한다. 최상위 객체를 spread해도 중첩 객체 참조는 그대로 공유된다. 따라서 중첩 객체를 변경하려면 변경되는 계층마다 spread로 새 객체를 만들어야 한다.

### 체크 포인트

- 얕은 복사
- 중첩 참조 공유
- 변경 계층마다 복사

---

## 10. 어떤 값을 State로 관리해야 하는가?

### 내 답변

- 사용자 입력, 서버 응답, 현재 선택 항목, 열림/닫힘처럼 시간에 따라 바뀌고 React가 리렌더링해야 하는 원천 값을 State로 관리한다. 반면 Props나 다른 State로부터 항상 계산 가능한 값은 별도 State로 저장하기보다 렌더링 중 계산하는 것이 좋다.

### 체크 포인트

- 시간에 따라 변하는 원천 값
- UI 리렌더링 필요성
- 계산 가능한 값은 파생 값
- Single Source of Truth

---

## 11. 관련된 여러 State를 하나로 합쳐야 하는 기준은 무엇인가?

### 내 답변

- 여러 값이 항상 함께 변경되고, 분리했을 때 불가능하거나 모순된 조합이 생긴다면 하나의 상태 모델로 합치는 것을 검토한다. 예를 들어 모달이 열려 있으면 반드시 선택된 id가 필요하다면 `isOpen`과 `selectedId`를 분리하기보다 `{ status: "opened", selectedId } | { status: "closed" }`처럼 표현할 수 있다.

### 체크 포인트

- 항상 함께 변경되는가
- 모순 상태가 가능한가
- 하나의 상태 전이가 더 명확한가
- Discriminated Union 활용

---

## 12. `isLoading`, `isSuccess`, `isError`를 각각 boolean으로 관리하면 어떤 문제가 발생할 수 있는가?

### 내 답변

- 여러 boolean이 동시에 `true`가 되는 모순 상태가 가능하다. 예를 들어 `isLoading`, `isSuccess`, `isError`가 모두 `true`면 화면이 어떤 상태인지 명확하지 않다. 이런 상태는 `status: "idle" | "loading" | "success" | "error"`처럼 하나의 상태 값으로 모델링하는 편이 불가능한 조합을 줄인다.

### 체크 포인트

- 모순 상태 가능성
- 상태 조합 증가
- status union으로 유효 상태만 표현
- Single Source of Truth
