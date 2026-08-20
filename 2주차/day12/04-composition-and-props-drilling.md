# Composition과 Props Drilling

## Props Drilling을 정확히 보기

Props Drilling은 중간 컴포넌트가 값을 직접 사용하지 않는데, 더 깊은 컴포넌트에 전달하기 위해 Props를 반복해서 받는 구조다.

~~~text
App
↓ user
Page
↓ user
Layout
↓ user
Sidebar
↓ user
Profile
~~~

하지만 Props가 두세 단계를 지나간다는 사실만으로 문제라고 결론 내리면 안 된다. 명시적인 Props는 데이터 출처와 의존성을 읽기 쉬우며, 중간 컴포넌트가 실제로 값을 사용한다면 자연스러운 구조다.

먼저 아래를 확인한다.

~~~text
중간 컴포넌트가 user를 실제로 사용하는가?
↓ No

단순 전달만 여러 단계 반복되는가?
↓ Yes

Composition 또는 Context 검토
~~~

## Composition으로 UI를 주입하기

Page와 Layout이 user라는 도메인 데이터를 전혀 쓰지 않고 배치만 담당한다면, user 대신 이미 완성된 Profile UI를 전달할 수 있다.

### 단순 Props 전달

~~~tsx
function App() {
  const user = useCurrentUser();

  return <Page user={user} />;
}

function Page({ user }: { user: User }) {
  return <Layout user={user} />;
}

function Layout({ user }: { user: User }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }: { user: User }) {
  return <Profile user={user} />;
}
~~~

### sidebar slot으로 조합

~~~tsx
function App() {
  const user = useCurrentUser();

  return (
    <Page>
      <Layout sidebar={<Profile user={user} />} />
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

function Layout({ sidebar }: { sidebar: React.ReactNode }) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <section>{/* page content */}</section>
    </div>
  );
}
~~~

이제 Layout은 sidebar라는 배치 영역만 알고 user의 필드나 Profile 구현을 알 필요가 없다. user 의존성은 App에서 Profile로 직접 연결되고, Layout은 UI 조합 역할만 맡는다.

~~~text
기존

App → user → Page → user → Layout → user → Sidebar → user → Profile

Composition

App ───── user ────→ Profile
 └── Profile UI ───→ Layout.sidebar
~~~

## children과 named slot의 선택

Composition은 children 하나만 의미하지 않는다.

~~~tsx
type ModalProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function Modal({ header, children, footer }: ModalProps) {
  return (
    <section role="dialog" aria-modal="true">
      <header>{header}</header>
      <div>{children}</div>
      {footer && <footer>{footer}</footer>}
    </section>
  );
}

function DeleteUserModal({ user, onClose, onConfirm }: DeleteUserModalProps) {
  return (
    <Modal
      header={<h2>{user.name}님을 삭제할까요?</h2>}
      footer={
        <>
          <button type="button" onClick={onClose}>취소</button>
          <button type="button" onClick={onConfirm}>삭제</button>
        </>
      }
    >
      <p>삭제한 사용자는 복구할 수 없습니다.</p>
    </Modal>
  );
}
~~~

- children은 본문이 자연스럽게 삽입되는 단일 영역에 적합하다.
- header, sidebar, footer, actions처럼 위치와 의미가 다른 영역에는 named slot이 적합하다.
- 데이터 자체가 컴포넌트의 핵심 입력이라면 일반 Props가 더 명확하다. Composition이 모든 Props를 대체하지는 않는다.

## Composition과 Context를 고르는 기준

Composition은 필요한 UI를 부모가 이미 알고 있을 때 강하다. Context는 멀리 떨어진 여러 하위 컴포넌트가 동일한 값을 직접 읽어야 하고, 그 값을 slot으로 조합하는 구조가 부자연스러울 때 후보가 된다.

| 질문 | Composition 쪽 신호 | Context 쪽 신호 |
| --- | --- | --- |
| 누가 값을 쓰는가? | 소수의 구체적인 UI 조각 | Subtree의 여러 독립된 위치 |
| 부모가 필요한 UI를 알고 있는가? | 알고 있어 slot으로 만들 수 있음 | 모든 소비자를 미리 알기 어려움 |
| 값의 성격은 무엇인가? | 페이지 구성에 필요한 화면 조각 | theme, locale, session, workspace 같은 공통 인프라 |
| 중간 컴포넌트의 역할은? | 배치만 하고 도메인 값을 몰라도 됨 | 여러 깊은 위치에서 직접 값을 소비함 |

Context는 Props Drilling을 없애는 도구이지만, 그 자체로 의존성을 없애지는 않는다. Provider value가 바뀌면 해당 Context를 읽는 Consumer가 갱신 대상이 되고, 큰 Context는 관계없는 변경까지 넓게 전파할 수 있다.

## 과도한 Composition도 피한다

모든 작은 요소를 ReactNode Props로 바꾸면 필요한 데이터와 행동의 계약이 흐려질 수 있다.

~~~tsx
type UserCardProps = {
  name: string;
  email: string;
  onEdit: () => void;
};

function UserCard({ name, email, onEdit }: UserCardProps) {
  return (
    <article>
      <h2>{name}</h2>
      <p>{email}</p>
      <button type="button" onClick={onEdit}>수정</button>
    </article>
  );
}
~~~

UserCard가 항상 이름, 이메일, 수정이라는 같은 도메인 UI를 표현한다면 위처럼 명시적인 Props가 더 읽기 좋다. 반대로 Card 내부 영역을 호출자가 완전히 구성해야 하는 일반적인 레이아웃 컴포넌트라면 Composition이 자연스럽다.

## 실습: 의존성이 사라지는 위치 찾기

Playground:

- /week2/day12/composition-slots

다음 구조를 Composition으로 바꾼 뒤, 각 컴포넌트가 무엇을 아는지 적어 본다.

~~~text
App
├─ user를 조회한다.
└─ Layout에 Profile UI를 sidebar slot으로 전달한다.

Layout
├─ sidebar를 배치한다.
└─ user의 name, role, id를 모른다.

Profile
└─ user를 표시한다.
~~~

확인할 것:

- 기존 구조에서 user 의존성이 있던 Page, Layout, Sidebar 중 어느 컴포넌트에서 의존성이 사라졌는가?
- Layout이 user를 받지 않으면 테스트 입력도 어떻게 단순해지는가?
- 여러 unrelated 컴포넌트가 user를 각각 직접 읽어야 한다면 slot만으로 충분한가?

## 기억할 문장

> Props Drilling을 피하는 것이 목표가 아니라, 데이터를 쓰지 않는 중간 컴포넌트의 불필요한 도메인 의존성을 줄이는 것이 목표다.
