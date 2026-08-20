# Hook Rules와 조건부 동작

## Hook의 두 가지 기본 규칙

일반적인 React Hook은 다음 규칙을 따른다.

1. React 함수 컴포넌트 또는 Custom Hook에서 호출한다.
2. 조건문, 반복문, 중첩 함수, 조건부 early return 아래가 아니라 최상위에서 호출한다.

여기서 최상위란 컴포넌트 함수가 실행될 때 매번 같은 순서로 도달하는 위치를 뜻한다.

~~~tsx
function Profile({ userId }: { userId?: string }) {
  const userQuery = useUser(userId);
  const [isOpen, setIsOpen] = useState(false);

  if (!userId) {
    return null;
  }

  return (
    <button type="button" onClick={() => setIsOpen(true)}>
      {userQuery.user?.name}
    </button>
  );
}
~~~

위 코드에서 useUser와 useState는 userId가 있든 없든 항상 먼저 호출된다. 그 뒤에 어떤 UI를 반환할지만 조건부로 결정한다.

## 호출 순서가 중요한 이유

React는 컴포넌트 인스턴스가 렌더링될 때 Hook 호출의 순서를 기준으로 각 State, Effect, ref를 연결한다. 개념적으로 아래와 같다.

~~~text
첫 번째 렌더
1번째 Hook → selectedIds State
2번째 Hook → isDeleteMode State
3번째 Hook → 데이터 요청 Effect

다음 렌더
1번째 Hook → 같은 selectedIds State
2번째 Hook → 같은 isDeleteMode State
3번째 Hook → 같은 데이터 요청 Effect
~~~

조건에 따라 중간 Hook이 사라지면 이후 Hook이 한 칸씩 밀려 React가 같은 위치에 다른 상태를 연결하게 된다. 실제 React는 이를 감지해 오류를 보여 줄 수 있지만, 규칙의 목적은 오류를 피하는 것을 넘어 렌더마다 예측 가능한 상태 연결을 유지하는 데 있다.

## 잘못된 조건부 Hook 호출

~~~tsx
function Profile({ userId }: { userId?: string }) {
  if (!userId) {
    return null;
  }

  const userQuery = useUser(userId);

  return <div>{userQuery.user?.name}</div>;
}
~~~

첫 렌더에서 userId가 없으면 useUser를 호출하지 않고, 다음 렌더에서 userId가 생기면 호출한다. 이 컴포넌트가 다른 Hook도 사용한다면 호출 순서가 달라질 수 있다.

다음도 같은 이유로 잘못됐다.

~~~tsx
function UserList({ userIds }: { userIds: string[] }) {
  const users = userIds.map((userId) => useUser(userId));

  return <div>{users.length}</div>;
}
~~~

배열 길이와 순서는 렌더마다 달라질 수 있으므로 map 안의 Hook 호출 횟수도 달라진다.

## 조건부 Hook 대신 조건부 동작

필요한 데이터가 없을 때 Hook 자체를 건너뛰지 말고, Hook은 항상 호출한 뒤 내부 요청만 시작하지 않게 만든다.

~~~tsx
function useUser(userId?: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  });
}

function Profile({ userId }: { userId?: string }) {
  const userQuery = useUser(userId);

  if (!userId) {
    return null;
  }

  return <div>{userQuery.data?.name}</div>;
}
~~~

enabled가 false이면 query Hook은 존재하지만 요청 함수는 실행하지 않는다. userId가 생기면 같은 Hook 위치에서 요청 동작만 활성화된다. non-null assertion은 enabled가 true일 때만 queryFn이 실행된다는 계약 아래에 있으므로 사용한 예시다.

Effect에서도 같은 원리가 적용된다.

~~~tsx
function useUserProfile(userId?: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    void fetchUser(userId).then(setUser);
  }, [userId]);

  return user;
}
~~~

useEffect는 항상 호출한다. Effect callback 내부에서 userId가 없을 때 어떤 동작을 할지만 조건으로 정한다. 실제 비동기 코드에서는 Day 11에서 다룬 cleanup, 오류 처리, AbortController도 함께 설계해야 한다.

## 반복 데이터는 컴포넌트 경계로 옮긴다

리스트의 각 항목이 자신의 Hook을 써야 한다면 항목을 별도 컴포넌트로 만든다.

~~~tsx
function UserList({ userIds }: { userIds: string[] }) {
  return (
    <ul>
      {userIds.map((userId) => (
        <UserRow key={userId} userId={userId} />
      ))}
    </ul>
  );
}

function UserRow({ userId }: { userId: string }) {
  const userQuery = useUser(userId);

  return <li>{userQuery.data?.name}</li>;
}
~~~

UserRow 하나하나가 자기 자신의 고정된 Hook 호출 순서를 가진다. 부모 목록의 길이가 바뀌어도 기존 UserRow의 Hook 순서를 재배열하는 방식이 아니라, key를 기준으로 항목 컴포넌트가 mount 또는 unmount된다.

여러 요청을 한 번에 관리해야 한다면 각 항목에서 Hook을 직접 반복 호출하기보다, 해당 라이브러리가 제공하는 useQueries 같은 단일 Hook API 또는 서버 API의 일괄 요청을 검토한다.

## Hook을 event handler나 일반 함수에서 호출할 수 없는 이유

~~~tsx
function DeleteButton() {
  function handleClick() {
    const modal = useToggle();
    modal.open();
  }

  return <button type="button" onClick={handleClick}>Delete</button>;
}
~~~

click handler는 렌더 과정에서 일정한 순서로 실행되지 않는다. useToggle은 컴포넌트 렌더 중 최상위에서 호출하고, handler는 그 Hook이 반환한 함수를 호출해야 한다.

~~~tsx
function DeleteButton() {
  const modal = useToggle();

  return (
    <button type="button" onClick={modal.open}>
      Delete
    </button>
  );
}
~~~

## lint 규칙의 역할

eslint-plugin-react-hooks의 rules-of-hooks 규칙은 Hook 호출 위치를 정적으로 검사한다. lint 오류를 억지로 끄기보다, 해당 코드가 렌더마다 같은 Hook 호출 순서를 보장하는지 먼저 확인한다.

다만 lint는 설계 품질 전체를 판단하지 않는다. 조건부 동작을 구현했다고 해도 userId가 없을 때 이전 데이터를 지울지, loading을 어떻게 표현할지, 오류를 어떤 범위에서 보여 줄지는 별도의 상태 설계 문제다.

## 실습: 규칙을 직접 설명하기

Playground:

- /week2/day12/hook-call-order

다음 질문에 말로 답해 본다.

~~~text
첫 렌더: userId 없음
→ Profile은 어떤 Hook을 몇 개 호출하는가?

다음 렌더: userId 있음
→ useUser가 조건 아래에 있으면 호출 순서는 어떻게 달라지는가?

개선 뒤
→ Hook 호출은 어떻게 유지되고, 실제 요청만 어떻게 바뀌는가?
~~~

## 기억할 문장

> Hook 호출은 항상, Hook 내부 동작만 조건부로 만든다. 그래야 React가 렌더마다 같은 순서로 상태를 연결할 수 있다.
