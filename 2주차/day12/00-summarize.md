# Day 12 빠른 개념 복습

## 오늘의 한 문장

> 좋은 React 설계는 컴포넌트를 무조건 작게 쪼개는 일이 아니라, UI·상태·비즈니스 로직의 책임을 명확히 하고 컴포넌트와 Custom Hook, Composition을 적절한 경계에 배치하는 일이다.

## 학습 목표

- 컴포넌트의 책임과 경계를 기준으로 분리할 수 있다.
- UI와 비즈니스 로직을 적절히 분리할 수 있다.
- Custom Hook을 언제 만들고 언제 만들지 않아야 하는지 판단할 수 있다.
- Hook의 규칙과 호출 순서가 중요한 이유를 설명할 수 있다.
- Props Drilling을 줄이기 위해 Composition을 활용할 수 있다.
- 조건부 렌더링과 복잡한 분기 로직을 별도 컴포넌트로 분리할 수 있다.
- 재사용성보다 응집도와 책임 분리를 우선해 컴포넌트를 설계할 수 있다.

## 10분 복습 순서

1. 현재 컴포넌트의 역할을 한 문장으로 말해 본다.
2. JSX 줄 수가 아니라 서로 다른 변경 이유가 함께 있는지 찾는다.
3. 상태 전이, 데이터 요청, mutation, 권한 판단이 UI와 복잡하게 얽혔는지 확인한다.
4. 로직이 독립된 책임을 가지거나 재사용·테스트 가치가 있을 때만 Custom Hook을 검토한다.
5. 일반적인 React Hook은 모든 렌더에서 같은 순서로, 컴포넌트 또는 Custom Hook의 최상위에서 호출한다.
6. Hook 호출 자체는 항상 유지하고, 필요할 때만 Hook 내부 동작을 조건부로 만든다.
7. 중간 컴포넌트가 값을 전달만 한다면 Composition을 먼저 검토한다.
8. 중첩 삼항 연산자와 긴 boolean 식은 결과 컴포넌트와 이름 있는 조건으로 바꾼다.

## 상세 문서와 실습

- [컴포넌트 책임과 경계](./01-component-responsibility.md)
- [UI 로직, 비즈니스 로직, Custom Hook](./02-ui-logic-and-custom-hooks.md)
- [Hook Rules와 조건부 동작](./03-hook-rules-and-conditional-behavior.md)
- [Composition과 Props Drilling](./04-composition-and-props-drilling.md)
- [조건부 렌더링과 이름 있는 조건](./05-conditional-rendering-and-named-conditions.md)
- [프로젝트 연결 분석](./06-project-connection.md)
- [Interview Practice](./07-interview.md)

## React playground

- /week2/day12/component-boundary
- /week2/day12/custom-hook-selection
- /week2/day12/hook-call-order
- /week2/day12/composition-slots
- /week2/day12/conditional-results

~~~bash
cd playgrounds/react
npm run dev
~~~

## 핵심 개념 압축

| 개념 | 빠른 정의 | 면접에서 꼭 붙일 말 |
| --- | --- | --- |
| 컴포넌트 책임 | 컴포넌트가 소유하는 한 가지 명확한 역할 | 파일이나 JSX를 작게 만드는 것이 아니라, 서로 다른 변경 이유를 분리한다. |
| 경계 | 상태·데이터·UI가 어느 컴포넌트 또는 Hook에 속하는지 정하는 선 | State는 실제 사용자와 변경 규칙에 가장 가까운 Owner에 둔다. |
| UI 로직 | 화면 배치, 이벤트 연결, 표시용 파생 값처럼 렌더링에 가까운 로직 | 모든 상태 로직을 Hook으로 옮길 필요는 없다. |
| Custom Hook | React Hook을 조합한 재사용 가능한 상태 로직 함수 | 코드 줄 수 감소보다 책임 분리, 재사용, 테스트 가능성이 목적이다. |
| Hook 반환 계약 | Hook 사용자가 기대할 수 있는 안정적인 반환 형태 | loading·error·data의 구조를 상황마다 바꾸지 않는다. |
| Hook Rules | Hook을 최상위에서 일정한 순서로 호출하는 규칙 | React는 Hook 호출 순서를 기준으로 각 State와 Effect를 연결한다. |
| 조건부 동작 | Hook은 항상 호출하고 내부 요청·Effect만 조건으로 제어하는 방식 | 조건부 Hook 호출과 조건부 데이터 요청은 다르다. |
| Composition | children 또는 slot으로 UI 조각을 조합하는 방식 | 중간 컴포넌트의 불필요한 도메인 의존성을 없앨 수 있다. |
| 조건부 결과 컴포넌트 | loading, error, empty, content 분기를 담당하는 UI 경계 | 상위 컴포넌트는 조합에, 결과 컴포넌트는 분기 순서에 집중한다. |
| 이름 있는 조건 | 복잡한 boolean 식에 도메인 의미를 부여한 변수 또는 함수 | 조건을 짧게 만드는 것보다 의미를 드러내는 것이 중요하다. |

## 설계 판단 흐름

~~~text
이 컴포넌트의 역할을 한 문장으로 설명할 수 있는가?
↓ No
서로 다른 변경 이유와 독립된 UI·상태·데이터 의존성을 찾는다.

↓ Yes
상태 전이 또는 외부 연동이 UI를 읽기 어렵게 만드는가?
↓ Yes
그 로직의 책임을 한 문장으로 설명할 수 있는가?
↓ Yes
Custom Hook 또는 별도 컴포넌트 후보

↓ No
컴포넌트 안에 두거나 순수 함수로 먼저 추출한다.

중간 컴포넌트가 값을 쓰지 않고 전달만 하는가?
↓ Yes
children 또는 slot Composition을 검토한다.

조건부 JSX가 여러 상태를 섞어 읽기 어려운가?
↓ Yes
결과 컴포넌트와 이름 있는 조건으로 분리한다.
~~~

## 헷갈리기 쉬운 표현 교정

| 부정확한 표현 | 더 정확한 표현 |
| --- | --- |
| 컴포넌트는 작을수록 좋다. | 컴포넌트는 하나의 응집된 책임과 변경 이유를 가져야 한다. |
| 로직은 모두 Custom Hook으로 빼야 한다. | 독립된 상태 로직, 재사용, 테스트 가치가 있을 때 Hook으로 추출한다. |
| Custom Hook의 목적은 코드 줄 수를 줄이는 것이다. | 상태 전이와 외부 연동의 책임을 UI에서 분리하는 것이 주된 목적이다. |
| Hook은 조건문 안에서만 안 쓰면 된다. | 반복문, 중첩 함수, 조건부 early return 아래도 Hook 순서를 바꿀 수 있으므로 피한다. |
| userId가 없으면 Hook도 호출하지 않아야 한다. | Hook은 항상 호출하고, 요청 여부는 enabled나 Hook 내부 조건으로 제어한다. |
| Props가 두세 단계 내려가면 Context가 필요하다. | 중간 전달자가 값을 쓰는지와 Composition으로 의존성을 없앨 수 있는지를 먼저 본다. |
| 중첩 삼항 연산자를 함수로 바꾸면 항상 더 좋다. | 분기 수, 각 상태의 UI 독립성, 테스트 가치가 커질 때 결과 컴포넌트로 분리한다. |
| 재사용되지 않는 컴포넌트는 분리할 가치가 없다. | 재사용 여부와 별개로 독립된 책임과 변경 이유가 있으면 분리할 가치가 있다. |

## 완료 체크

- [ ] 컴포넌트의 책임을 한 문장으로 설명할 수 있다.
- [ ] 코드 길이가 아니라 책임과 변경 이유를 기준으로 컴포넌트를 분리할 수 있다.
- [ ] UI 로직과 상태·비즈니스 로직의 분리 필요성을 판단할 수 있다.
- [ ] Custom Hook을 만들어야 하는 상황과 그렇지 않은 상황을 구분할 수 있다.
- [ ] Custom Hook의 반환 구조를 일관되게 설계할 수 있다.
- [ ] Hook Rules를 설명할 수 있다.
- [ ] 조건부 Hook 호출이 왜 잘못된지 설명할 수 있다.
- [ ] 조건부 동작과 조건부 Hook 호출을 구분할 수 있다.
- [ ] Composition으로 불필요한 Props 전달을 줄일 수 있다.
- [ ] Context를 사용하기 전에 Composition으로 해결 가능한지 판단할 수 있다.
- [ ] 복잡한 조건부 렌더링을 별도 컴포넌트로 분리할 수 있다.
- [ ] 복잡한 boolean 조건에 의미 있는 이름을 붙일 수 있다.
- [ ] 프로젝트에서 책임이 과도한 컴포넌트 또는 Hook을 최소 1개 분석하고 개선 방향을 설명할 수 있다.
