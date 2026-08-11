# Day 8 Interview Practice

면접 질문을 보고 바로 아래 `내 답변` 칸에 스스로 답변을 적는 용도입니다.

---

## 1. React 컴포넌트는 어떤 경우에 리렌더링되는가?

### 내 답변

- 컴포넌트 자신의 State가 변경되거나, 부모 컴포넌트가 리렌더링되거나, 구독 중인 Context 값이 변경되거나, 외부 Store 구독 값이 변경될 때 리렌더링될 수 있다. 리렌더링은 컴포넌트 함수를 다시 실행해 다음 UI를 계산하는 과정이며, 실제 DOM 전체가 다시 만들어진다는 의미는 아니다.

### 체크 포인트

- 자신의 State 변경
- 부모 리렌더링
- Context 값 변경
- 외부 Store 구독 값 변경
- 리렌더링과 DOM 업데이트는 다르다는 점

---

## 2. Render Phase와 Commit Phase의 차이는 무엇인가?

### 내 답변

- Render Phase는 React가 컴포넌트 함수를 실행해 다음 React Element Tree를 계산하는 단계다. 이 단계에서는 실제 DOM을 변경하지 않는다. Reconciliation을 통해 이전 Tree와 다음 Tree의 차이를 계산한 뒤, Commit Phase에서 필요한 변경만 실제 DOM에 반영한다.

### 체크 포인트

- Render Phase는 UI 계산
- Reconciliation은 이전 Tree와 다음 Tree 비교
- Commit Phase는 실제 DOM 반영
- 컴포넌트 실행과 DOM 변경은 같은 일이 아니라는 점

---

## 3. 리렌더링되면 실제 DOM 전체가 다시 만들어지는가?

### 내 답변

- 아니다. 리렌더링은 React가 다음 UI 표현을 다시 계산하는 과정이다. React는 이전 Element Tree와 다음 Element Tree를 비교하고, 실제로 달라진 부분만 Commit Phase에서 DOM에 반영한다. 그래서 자식 컴포넌트 함수가 다시 실행되더라도 반환 결과가 이전과 같다면 실제 DOM 변경은 없거나 작을 수 있다.

### 체크 포인트

- 리렌더링은 계산 과정
- DOM 업데이트는 Commit Phase에서 필요한 부분만 수행
- reconciliation으로 변경점을 판단
- 리렌더링 로그만으로 성능 문제를 단정하지 않는다는 점

---

## 4. `setState` 직후 기존 State가 출력되는 이유는 무엇인가?

### 내 답변

- 각 렌더링은 독립적인 State Snapshot을 가진다. 이벤트 핸들러는 자신이 만들어진 렌더링의 Snapshot을 참조한다. `setState`는 현재 렌더링의 변수를 직접 변경하는 것이 아니라 다음 렌더링을 요청한다. 그래서 `setState` 직후 같은 핸들러 안에서 State를 출력하면 현재 Snapshot의 값, 즉 이전 값이 출력된다.

### 체크 포인트

- 렌더링마다 State Snapshot이 있다는 점
- 이벤트 핸들러는 생성된 렌더링의 Snapshot을 참조
- `setState`는 현재 변수를 직접 변경하지 않음
- 새 값은 다음 렌더링에서 사용 가능
- 단순히 "비동기라서"로만 설명하지 않는다는 점

---

## 5. 다음 코드는 왜 `3`이 아니라 `1` 증가하는가?

```tsx
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);
```

### 내 답변

- 세 호출이 모두 같은 렌더링의 `count` Snapshot을 참조하기 때문이다. 현재 `count`가 `0`이면 세 코드는 모두 `setCount(1)`처럼 업데이트를 등록한다. React가 여러 업데이트를 batching해서 한 번의 렌더링으로 처리할 수 있지만, `+1`만 되는 핵심 이유는 값 기반 업데이트가 같은 Snapshot 값을 읽기 때문이다.

### 체크 포인트

- 같은 렌더링의 Snapshot 참조
- `count === 0`이면 모두 `setCount(1)`
- 값 기반 업데이트의 한계
- Batching과 Snapshot을 구분

---

## 6. 함수형 State Update는 언제 사용하는가?

### 내 답변

- 이전 State를 기반으로 다음 State를 계산할 때 사용한다. 증가, 감소, 토글, 배열 항목 추가·삭제, 같은 이벤트에서 같은 State를 여러 번 갱신하는 경우에 안전하다. 함수형 업데이트는 Queue에서 이전 업데이트 결과를 인자로 받기 때문에 누적 계산이 정확하다.

### 체크 포인트

- 이전 State 기반 계산
- `setCount((previousCount) => previousCount + 1)`
- Queue의 이전 업데이트 결과를 이어받음
- 타이머, Promise, 구독 콜백에서도 유용

---

## 7. Batching과 State Snapshot은 어떻게 다른 개념인가?

### 내 답변

- State Snapshot은 렌더링 안에서 State 값이 어떤 값으로 고정되어 있는지에 대한 개념이다. 이벤트 핸들러와 업데이트가 어떤 값을 참조하는지를 설명한다. Batching은 여러 State Update를 언제 렌더링으로 반영할지에 대한 개념이다. React는 여러 업데이트를 모아 한 번의 렌더링으로 처리할 수 있다.

### 체크 포인트

- Snapshot은 "어떤 값을 참조하는가"
- Batching은 "언제 렌더링으로 반영하는가"
- 값 기반 업데이트와 함수형 업데이트 차이는 Snapshot과 관련
- 여러 업데이트를 한 번에 처리하는 것은 Batching과 관련

---

## 8. React는 언제 컴포넌트의 State를 보존하는가?

### 내 답변

- React는 State를 컴포넌트 함수 자체가 아니라 UI Tree상의 위치와 Identity에 연결한다. 같은 위치에 같은 타입의 컴포넌트가 같은 Identity로 렌더링되면 일반적으로 State를 보존한다. Props가 바뀌어도 위치와 Identity가 같으면 내부 State는 유지될 수 있다.

### 체크 포인트

- State는 UI Tree 위치와 Identity에 연결
- 같은 위치의 같은 컴포넌트면 보존
- Props 변경만으로 State가 항상 초기화되지는 않음
- 보존이 맞는 UX인지 판단해야 함

---

## 9. 같은 컴포넌트인데 State가 초기화될 수 있는 경우는 무엇인가?

### 내 답변

- 같은 컴포넌트 함수라도 UI Tree상의 위치가 바뀌거나, 조건부 렌더링으로 제거됐다가 다시 추가되거나, `key`가 바뀌면 React가 다른 Identity로 판단할 수 있다. 이 경우 기존 State를 버리고 새 State로 시작하므로 내부 입력값이나 로컬 상태가 초기화될 수 있다.

### 체크 포인트

- 위치 변경
- 컴포넌트 타입 변경
- 조건부 렌더링으로 unmount 후 mount
- `key` 변경
- Identity가 바뀌면 State 초기화 가능

---

## 10. React에서 `key`의 역할은 무엇인가?

### 내 답변

- `key`는 형제 Element 사이에서 이전 Element와 다음 Element를 대응시키는 Identity 정보다. React는 목록을 비교할 때 `key`를 사용해 어떤 컴포넌트와 State를 유지할지 판단한다. 따라서 `key`는 단순히 warning을 없애기 위한 값이 아니라 reconciliation과 State 보존에 영향을 주는 값이다.

### 체크 포인트

- 형제 Element 구분
- 이전 Element와 다음 Element 대응
- reconciliation에 사용
- State 보존과 초기화에 영향
- warning 제거용이 아니라 Identity 정보라는 점

---

## 11. 배열 index를 `key`로 사용하는 것이 문제가 되는 경우는 언제인가?

### 내 답변

- 목록의 추가, 삭제, 정렬, 순서 변경, 필터링이 가능한 경우 문제가 될 수 있다. index는 데이터의 Identity가 아니라 현재 위치이기 때문에 순서가 바뀌면 React가 다른 데이터를 같은 컴포넌트로 대응시킬 수 있다. Row 안에 로컬 State가 있으면 입력값이나 체크 상태가 원래 데이터가 아닌 다른 데이터에 붙는 문제가 생길 수 있다.

### 체크 포인트

- index는 데이터 id가 아니라 위치
- 추가·삭제·정렬·필터링에서 위험
- Row 로컬 State가 있을 때 문제가 잘 드러남
- 안정적인 데이터 id를 key로 사용

---

## 12. `key`를 변경하면 왜 컴포넌트 State가 초기화되는가?

### 내 답변

- React는 같은 위치의 Element라도 `key`가 다르면 다른 Identity로 판단할 수 있다. 다른 Identity로 판단되면 이전 컴포넌트에 연결되어 있던 State를 재사용하지 않고 새 컴포넌트를 마운트하는 것처럼 처리한다. 그래서 `key={userId}`처럼 key를 바꾸면 사용자 전환 시 내부 State를 의도적으로 초기화할 수 있다.

### 체크 포인트

- `key`는 Identity 판단 기준
- `key`가 다르면 이전 State를 재사용하지 않을 수 있음
- 의도적인 State 초기화에 사용할 수 있음
- 무분별한 key 변경은 불필요한 초기화를 만들 수 있음
