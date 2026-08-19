# Props Drilling과 Composition

## Props Drilling이란

중간 컴포넌트가 값을 직접 사용하지 않는데, 더 깊은 컴포넌트에 전달하기 위해 Props를 계속 받는 상황이다.

~~~text
App
↓ user
Layout
↓ user
Sidebar
↓ user
UserProfile
~~~

~~~tsx
function App() {
  const user = useCurrentUser();

  return <Layout user={user} />;
}

function Layout({ user }: { user: User }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }: { user: User }) {
  return <UserProfile user={user} />;
}
~~~

## Props Drilling은 항상 문제인가

아니다. 두세 단계의 명시적인 Props 전달은 다음 장점이 있다.

- 데이터를 어디서 받아 오는지 코드만 보고 알기 쉽다.
- 중간 컴포넌트의 의존성과 테스트 입력이 명확하다.
- Provider나 전역 구조 없이 컴포넌트를 독립적으로 재사용하기 쉽다.

문제는 전달 깊이 자체가 아니라, 중간 계층이 반복해서 의미 없는 전달자만 되고 변경 비용이 커지는 상황이다.

## Composition으로 의존성 줄이기

Layout이 user 자체를 사용할 필요 없이 Sidebar 영역을 배치하기만 한다면, 필요한 UI를 slot으로 전달할 수 있다.

~~~tsx
function App() {
  const user = useCurrentUser();

  return <Layout sidebar={<UserProfile user={user} />} />;
}

function Layout({ sidebar }: { sidebar: React.ReactNode }) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <main>...</main>
    </div>
  );
}
~~~

~~~text
기존

App → user → Layout → user → Sidebar → user → UserProfile

Composition

App ───── user ────→ UserProfile
 └── UserProfile UI → Layout.sidebar
~~~

Layout은 user라는 도메인 정보를 몰라도 된다. Sidebar가 단순한 자리라면 컴포넌트 자체를 만들 필요도 없다.

## children과 slot

Composition은 sidebar라는 named slot만 의미하지 않는다.

~~~tsx
function PageFrame({ children }: { children: React.ReactNode }) {
  return <main className="page-frame">{children}</main>;
}

function App() {
  return (
    <PageFrame>
      <UserProfile user={user} />
    </PageFrame>
  );
}
~~~

children, header, footer, sidebar, actions처럼 UI 구조에 맞는 slot을 제공할 수 있다.

## Context를 선택할 시점

아래 조건이 함께 맞으면 Context 후보가 된다.

~~~text
여러 깊은 위치에서 같은 데이터가 필요한가?
↓ Yes
Composition으로 필요한 UI를 전달해도 구조가 부자연스러운가?
↓ Yes
특정 Subtree의 공통 인프라 값인가?
↓ Yes
Context 후보
~~~

예를 들어 테마, locale, 인증 세션, 현재 워크스페이스 같은 값은 여러 깊은 하위 컴포넌트가 직접 읽을 수 있다.

반대로 한 화면의 UserProfile 하나에 user만 전달하면 되는 경우는 Context까지 도입할 이유가 적다.

## 실습에서 확인할 것

/week2/day10/props-composition에서 같은 user를 바꾸며 두 구현을 비교한다.

- Props 전달 방식에서는 Layout과 Sidebar가 user Props를 받는다.
- Composition 방식에서는 Layout이 sidebar UI만 받는다.
- 둘 다 유효하지만, Layout이 user를 직접 사용하지 않는다면 Composition 쪽의 도메인 의존성이 더 작다.

## 기억할 문장

> Props Drilling을 피하는 것이 목표가 아니라, 데이터를 쓰지 않는 중간 컴포넌트의 불필요한 의존성을 줄이는 것이 목표다.
