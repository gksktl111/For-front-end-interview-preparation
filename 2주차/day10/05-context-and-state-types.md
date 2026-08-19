# Context와 상태 종류

## Context의 역할

Context는 특정 값을 컴포넌트 트리 아래 여러 위치로 전달하는 React 기능이다.

~~~tsx
type AuthContextValue = {
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
~~~

하위 컴포넌트는 Props를 중간마다 전달받지 않고 값을 읽을 수 있다.

~~~tsx
function ProfileButton() {
  const auth = useContext(AuthContext);

  return <button>{auth?.user?.name ?? "Login"}</button>;
}
~~~

Context는 값 전달 방식이다. 모든 상태를 담아야 하는 전역 Store와 같은 뜻은 아니다.

## Context에 잘 맞는 값

- Theme
- Locale
- Authentication session
- 현재 Workspace
- 앱 전반 공통 설정

공통점은 특정 Subtree의 많은 컴포넌트가 깊이에 관계없이 읽을 수 있고, Props로 일일이 전달하는 구조가 부자연스럽다는 점이다.

## Provider 위치

Provider를 너무 높게 두면 다음 문제가 생길 수 있다.

- 실제로 필요 없는 화면도 해당 Context의 존재와 갱신에 영향을 받는다.
- Provider value 변경의 영향 범위가 커진다.
- 앱 전역 의존성이 늘어 컴포넌트 재사용과 테스트가 어려워질 수 있다.

그래서 Provider는 가능하면 그 값을 필요로 하는 Subtree를 감싸는 위치에 둔다.

## Context와 리렌더링

Provider의 value가 바뀌면 그 Context를 읽는 Consumer는 리렌더링 대상이 된다.

~~~tsx
<UserContext.Provider value={user}>
  <App />
</UserContext.Provider>
~~~

거대한 Context 하나에 user, theme, modal, filter, toast처럼 관련 없는 값을 모두 넣으면, 하나의 값 변화가 많은 Consumer에 영향을 줄 수 있다.

필요하다면 책임 단위로 나눈다.

~~~text
AuthContext
ThemeContext
WorkspaceContext
~~~

다만 Context를 기계적으로 잘게 쪼개지는 않는다. 실제 사용 패턴, value 변경 빈도, Consumer 범위를 본 뒤 분리한다.

## Local State, Shared Client State, Server State

| 종류 | 예시 | 보통의 Owner |
| --- | --- | --- |
| Local State | 모달 열림, 입력 draft, hover 상태 | 컴포넌트 useState |
| Shared Client State | 테마, 로그인 세션, UI 설정, 현재 워크스페이스 | 가까운 부모, Context, Store |
| Server State | API에서 가져온 클립 목록, 사용자 프로필 | React Query 등의 서버 캐시 |

### Local State

~~~tsx
const [isModalOpen, setIsModalOpen] = useState(false);
~~~

한 컴포넌트나 가까운 UI 범위에서만 쓰는 일시적 상태다.

### Shared Client State

~~~tsx
const theme = useContext(ThemeContext);
~~~

브라우저 쪽에서 생성하고 여러 UI가 공유하는 상태다. 항상 Context가 필요한 것은 아니며, 가까운 부모의 Props가 더 적절할 수 있다.

### Server State

~~~tsx
const { data: clips = [] } = useQuery({
  queryKey: ["clips"],
  queryFn: fetchClips,
});
~~~

서버가 권위 있는 원본을 가지고, 비동기 요청, 캐시, stale 여부, refetch, 오류 상태가 함께 따라오는 데이터다.

## Server State를 Local State로 복사하지 않는 이유

~~~tsx
const { data: clips = [] } = useClips();
const [localClips, setLocalClips] = useState(clips);
~~~

이 코드는 서버 캐시가 갱신되어도 localClips가 자동으로 동기화되지 않는다. 단순한 표시라면 query data 하나만 Source of Truth로 둔다.

로컬 초안, optimistic editing buffer, 드래그 정렬처럼 복사본이 필요한 요구사항이라면 복사본의 목적과 서버 재동기화 규칙을 명시한다.

## 실습에서 확인할 것

- /week2/day10/context-scope: 하나의 큰 Context와 책임별 Context를 비교한다. 설정값만 바꿔도 큰 Context의 user Consumer가 영향을 받는 이유를 본다.
- /week2/day10/server-state-copy: query data를 그대로 쓰는 목록과 mount 시 복사한 Local State 목록의 서버 갱신 반응을 비교한다.

## 기억할 문장

> Context는 깊은 전달 문제를 해결하는 도구이고, Server State는 서버 캐시의 생명주기를 가진 별도 종류의 상태다.
