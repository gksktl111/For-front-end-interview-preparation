# Day 10 Interview Practice

면접 질문을 보고 바로 아래 내 답변 칸에 스스로 답변을 적는 용도입니다.

---

## 1. React에서 State는 어느 컴포넌트가 소유해야 하는가?

### 내 답변

- State를 읽거나 변경하는 컴포넌트들의 가장 가까운 공통 조상이 우선적인 Owner 후보다. 한 컴포넌트만 사용하면 그 컴포넌트의 Local State로 두고, 여러 형제가 함께 사용하면 필요한 범위까지만 공통 부모로 올린다. 모든 State를 최상위에 두는 것이 아니라 실제 사용 범위를 만족하는 가장 작은 Owner를 선택하는 것이 중요하다.

### 체크 포인트

- 누가 읽고 변경하는지 확인
- 가장 가까운 공통 조상
- Local State 우선
- 필요한 만큼만 공유

---

## 2. 여러 형제 컴포넌트가 같은 State를 필요로 하면 어떻게 설계하는가?

### 내 답변

- State를 형제들의 가장 가까운 공통 부모로 Lifting State Up 한다. 부모가 유일한 Source of Truth가 되어 State와 변경 callback을 Props로 내려주고, 각 자식은 같은 값을 읽는다. 자식 이벤트는 callback을 통해 부모에게 전달되어 부모가 다음 State를 결정한다.

### 체크 포인트

- Lifting State Up
- 하나의 Source of Truth
- State와 callback을 Props로 전달
- 형제 UI의 일관성

---

## 3. 모든 State를 최상위 컴포넌트에 두면 어떤 문제가 생기는가?

### 내 답변

- 사용 범위보다 Owner가 넓어져 관련 없는 화면도 내부 UI State를 알아야 한다. 상위 컴포넌트가 여러 도메인의 변경 규칙을 떠안고 Props 전달 경로와 변경 영향 범위가 커져 응집도가 낮아진다. 그래서 State는 가장 넓은 곳이 아니라 가장 작은 유효 범위에 둔다.

### 체크 포인트

- Owner 범위 과확장
- 불필요한 의존성
- 상위 컴포넌트의 책임 증가
- 응집도 저하

---

## 4. Single Source of Truth란 무엇인가?

### 내 답변

- 하나의 의미를 가진 데이터에 하나의 권위 있는 원본만 두는 원칙이다. 같은 selectedId나 목록을 여러 State에서 중복 관리하면 어떤 값이 진짜인지 불명확해지고, 두 값을 맞추는 동기화 코드와 불일치 버그가 생길 수 있다. Props나 다른 State로 계산 가능한 값도 가능한 한 별도 State로 저장하지 않는다.

### 체크 포인트

- 같은 의미의 데이터 하나
- 권위 있는 원본
- 동기화 책임 감소
- 파생 값도 중복 State가 될 수 있음

---

## 5. 같은 데이터를 Props와 Local State에서 동시에 관리하면 어떤 문제가 발생할 수 있는가?

### 내 답변

- useState의 초기값은 마운트할 때 한 번만 사용되므로, 이후 Props가 바뀌어도 복사한 Local State는 자동으로 갱신되지 않는다. 따라서 부모의 최신 user와 자식 localUser가 달라져 오래된 UI가 보일 수 있다. 단, 저장 전 입력값처럼 원본과 다른 의미의 draft라면 별도 Local State가 가능하지만 저장, 취소, 재초기화 규칙을 명확히 해야 한다.

### 체크 포인트

- useState 초기값은 한 번만 사용
- Props 변경 자동 동기화 아님
- 오래된 UI 가능성
- draft는 다른 의미일 수 있음

---

## 6. 서버 데이터를 Local State로 복사하는 것이 위험할 수 있는 이유는 무엇인가?

### 내 답변

- query data는 서버 캐시가 관리하는 Server State인데, 이를 Local State로 복사하면 refetch나 invalidation 뒤에 캐시와 복사본이 서로 달라질 수 있다. 목록을 단순 표시하는 목적이면 query data 자체를 Source of Truth로 사용한다. 편집 draft나 드래그 정렬처럼 로컬 복사본이 필요하다면 복사본의 목적과 서버 재동기화 규칙을 따로 설계한다.

### 체크 포인트

- Server State 캐시
- refetch와 invalidation
- 복사본 불일치
- draft의 생명주기

---

## 7. Lifting State Up이란 무엇이며 React의 단방향 데이터 흐름은 어떻게 동작하는가?

### 내 답변

- Lifting State Up은 여러 컴포넌트가 같은 State를 읽거나 변경해야 할 때 State를 공통 부모로 옮기는 패턴이다. React에서는 부모 State가 Props를 통해 자식으로 내려가고, 자식 이벤트는 callback을 호출해 부모에게 변경을 요청한다. 부모가 State를 갱신하면 새 Props가 다시 자식으로 내려오는 흐름이 단방향 데이터 흐름이다.

### 체크 포인트

- 공통 부모의 State
- Parent State → Props → Child
- Event → callback → State Update
- 자식은 부모 State를 직접 수정하지 않음

---

## 8. Props Drilling이란 무엇이며 항상 나쁜가?

### 내 답변

- Props Drilling은 중간 컴포넌트가 값을 직접 사용하지 않는데 더 깊은 컴포넌트에 전달하기 위해 Props를 반복해서 받는 구조다. 하지만 몇 단계의 명시적인 Props 전달은 데이터 출처와 의존성이 분명하고 테스트하기 쉽기 때문에 항상 문제는 아니다. 중간 전달자만 깊게 반복되고 변경 비용이 커질 때 개선을 검토한다.

### 체크 포인트

- 사용하지 않는 중간 전달
- 명시적인 Props의 장점
- 깊이만으로 판단하지 않음
- 변경 비용과 구조를 함께 판단

---

## 9. Composition을 이용해 Props Drilling을 줄이는 방법은 무엇인가?

### 내 답변

- 데이터를 필요로 하지 않는 중간 컴포넌트에 data Props를 전달하는 대신, 데이터를 이미 사용한 UI를 children이나 sidebar 같은 slot으로 전달한다. 예를 들어 Layout이 user를 직접 사용하지 않으면 UserProfile을 만들어 sidebar slot에 주입할 수 있다. 그러면 Layout은 user 도메인에 의존하지 않고 배치 책임만 가진다.

### 체크 포인트

- UI 자체를 주입
- children과 named slot
- 중간 컴포넌트 의존성 감소
- Context 이전에 검토할 수 있는 선택지

---

## 10. Context는 어떤 문제를 해결하며 전역 상태 관리와 같은 개념인가?

### 내 답변

- Context는 특정 값을 깊은 하위 컴포넌트에 반복적인 Props 전달 없이 제공하는 기능이다. Theme, locale, 인증 세션, 현재 Workspace처럼 특정 Subtree의 여러 깊은 위치가 공통으로 읽는 값에 적합하다. Context는 값 전달 메커니즘이지 모든 상태를 담아야 하는 전역 Store와 같은 개념은 아니다.

### 체크 포인트

- 깊은 전달 문제
- Theme, locale, auth 같은 공통 값
- 특정 Subtree 범위
- 전역 상태 관리와 동의어 아님

---

## 11. Context를 과도하게 사용하면 어떤 문제가 발생할 수 있는가?

### 내 답변

- Provider의 value가 바뀌면 해당 Context를 읽는 Consumer가 리렌더링 대상이 된다. 관련 없는 상태를 큰 Context 하나에 묶으면 작은 변경도 넓은 Consumer 집합에 영향을 줄 수 있고, Provider의 범위와 의존성도 불필요하게 커진다. 실제 사용 패턴과 갱신 빈도를 보고 책임별 Context 분리나 Provider 위치 조정을 검토한다.

### 체크 포인트

- Provider value 변경
- Consumer 리렌더링 대상
- 거대한 Context의 변경 영향
- 책임별 분리와 Provider 범위

---

## 12. Local State, Shared Client State, Server State는 어떻게 다르며 React Query 데이터를 다시 useState로 저장하지 않아도 되는 경우는 언제인가?

### 내 답변

- Local State는 모달 열림이나 입력 draft처럼 가까운 UI에 필요한 값이다. Shared Client State는 테마, 인증, UI 설정처럼 브라우저에서 여러 UI가 공유하는 값이며 부모, Context, Store 중 적절한 범위를 선택한다. Server State는 서버가 원본을 가지고 요청, 캐시, stale, refetch, 오류 상태가 함께 필요하므로 React Query 같은 서버 캐시 도구로 다룬다. 서버 목록을 단순 표시하거나 캐시 갱신을 그대로 반영하면 되는 경우에는 query data가 Source of Truth이므로 Local State로 복사할 필요가 없다.

### 체크 포인트

- Owner와 생명주기의 차이
- Local UI State
- Shared Client State의 범위 선택
- Server State 캐시
- 단순 표시는 query data 직접 사용
