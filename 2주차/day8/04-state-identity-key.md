# State 보존과 key

## State는 컴포넌트 함수가 아니라 위치와 Identity에 연결된다

React는 State를 컴포넌트 함수 자체에 저장하지 않는다. React는 UI Tree에서 해당 컴포넌트가 있는 위치와 Identity를 기준으로 State를 연결한다.

```tsx
function App() {
  return <Counter />;
}
```

`Counter`가 같은 위치에 같은 타입으로 계속 렌더링되면 React는 기존 State를 보존한다.

## 같은 위치의 같은 컴포넌트

```tsx
function App({ isDark }: { isDark: boolean }) {
  return (
    <section className={isDark ? "dark" : "light"}>
      <Counter />
    </section>
  );
}
```

`isDark`가 바뀌어도 `Counter`는 같은 위치에 같은 컴포넌트로 존재한다. 일반적으로 `Counter`의 State는 유지된다.

## Props 변경과 State 보존

```tsx
function App() {
  const [userId, setUserId] = useState("user-a");

  return (
    <>
      <button type="button" onClick={() => setUserId("user-a")}>
        User A
      </button>
      <button type="button" onClick={() => setUserId("user-b")}>
        User B
      </button>
      <UserProfile userId={userId} />
    </>
  );
}
```

`userId` Props가 바뀌어도 `UserProfile`은 같은 위치의 같은 컴포넌트다. `UserProfile` 내부에 입력 State가 있으면 사용자 전환 후에도 입력값이 유지될 수 있다.

이 동작이 항상 문제는 아니다. 예를 들어 탭 전환 시 작성 중인 값을 유지해야 한다면 State 보존이 맞다. 반대로 사용자별 입력값을 분리해야 한다면 문제가 된다.

## `key` 변경으로 State 초기화

```tsx
<UserProfile key={userId} userId={userId} />
```

`key`가 바뀌면 React는 이전 `UserProfile`과 다음 `UserProfile`을 다른 Identity로 판단할 수 있다. 이 경우 기존 State를 버리고 새 State로 시작한다.

정리:

```text
Props 변경
→ 같은 위치의 같은 Identity
→ State 유지

key 변경
→ 다른 Identity
→ State 초기화
```

## 실습 코드

```tsx
import { useState } from "react";

function UserProfile({ userId }: { userId: string }) {
  const [memo, setMemo] = useState("");

  return (
    <section>
      <h2>{userId}</h2>
      <label htmlFor="memo">Memo</label>
      <input
        id="memo"
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
      />
    </section>
  );
}

export function UserProfileSwitcher() {
  const [userId, setUserId] = useState("user-a");

  return (
    <>
      <button type="button" onClick={() => setUserId("user-a")}>
        User A
      </button>
      <button type="button" onClick={() => setUserId("user-b")}>
        User B
      </button>
      <UserProfile userId={userId} />
    </>
  );
}
```

확인할 것:

- User A에서 입력한 값이 User B로 전환해도 남아 있는가?
- Props만 바뀌었을 때 State가 유지되는 이유는 무엇인가?

이후 다음처럼 변경한다.

```tsx
<UserProfile key={userId} userId={userId} />
```

다시 확인할 것:

- 사용자 전환 시 입력값이 초기화되는가?
- `key` 변경이 Component Identity에 어떤 영향을 주는가?

## `key`와 Reconciliation

`key`는 형제 Element를 구분하기 위한 Identity 정보다.

```tsx
items.map((item) => <Item key={item.id} item={item} />);
```

React는 이전 목록과 다음 목록을 비교할 때 `key`를 사용해 어떤 Element가 같은 대상인지 대응시킨다.

`key`가 특히 중요한 상황:

- 목록 앞에 항목 추가
- 목록 중간 항목 삭제
- 정렬
- 필터링
- 드래그 앤 드롭으로 순서 변경

## index key 문제

```tsx
{users.map((user, index) => (
  <UserRow key={index} user={user} />
))}
```

배열 index는 데이터의 Identity가 아니라 현재 위치다. 목록 순서가 바뀌면 같은 데이터가 다른 index를 가질 수 있다.

문제가 잘 드러나는 조건:

- 각 Row가 로컬 State를 가진다.
- 사용자가 Row 안의 input에 값을 입력한다.
- 목록의 순서를 바꾸거나 중간 항목을 삭제한다.
- 입력값이 원래 사용자에 붙지 않고 다른 사용자 Row에 붙는다.

## index key 문제 실습

```tsx
import { useState } from "react";

type User = {
  id: string;
  name: string;
};

const initialUsers: User[] = [
  { id: "user-a", name: "User A" },
  { id: "user-b", name: "User B" },
  { id: "user-c", name: "User C" },
];

function UserRow({ user }: { user: User }) {
  const [memo, setMemo] = useState("");

  return (
    <li>
      <strong>{user.name}</strong>
      <input
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        placeholder={`${user.name} memo`}
      />
    </li>
  );
}

export function IndexKeyProblem() {
  const [users, setUsers] = useState(initialUsers);

  const reverseUsers = () => {
    setUsers((previousUsers) => [...previousUsers].reverse());
  };

  const removeSecondUser = () => {
    setUsers((previousUsers) => previousUsers.filter((_, index) => index !== 1));
  };

  const addUserToFront = () => {
    setUsers((previousUsers) => [
      { id: crypto.randomUUID(), name: "New User" },
      ...previousUsers,
    ]);
  };

  return (
    <section>
      <button type="button" onClick={reverseUsers}>
        순서 뒤집기
      </button>
      <button type="button" onClick={removeSecondUser}>
        두 번째 삭제
      </button>
      <button type="button" onClick={addUserToFront}>
        앞에 추가
      </button>

      <ul>
        {users.map((user, index) => (
          <UserRow key={index} user={user} />
        ))}
      </ul>
    </section>
  );
}
```

위 코드에서 각 Row에 메모를 입력한 뒤 순서를 바꾸면 메모 State가 데이터가 아니라 위치에 붙는 것을 확인할 수 있다.

수정:

```tsx
{users.map((user) => (
  <UserRow key={user.id} user={user} />
))}
```

## `key` 선택 기준

좋은 `key`:

- 데이터 자체의 안정적인 id
- 같은 형제 목록 안에서 고유한 값
- 렌더링 사이에 불필요하게 바뀌지 않는 값

피해야 할 `key`:

- 정렬·삭제·추가가 가능한 목록의 배열 index
- `Math.random()`
- 매 렌더링마다 새로 생성되는 값
- 실제 데이터 Identity와 관련 없는 값

## 면접 답변 포인트

`key`의 역할을 물으면 다음처럼 답한다.

> `key`는 React가 형제 Element 사이에서 이전 Element와 다음 Element를 대응시키는 Identity 정보다. 목록의 추가, 삭제, 정렬에서 어떤 컴포넌트 State를 유지할지 판단하는 데 영향을 준다. `key`가 바뀌면 React는 다른 Identity로 볼 수 있으므로 기존 State가 초기화될 수 있다. 배열 index는 데이터의 Identity가 아니라 위치이기 때문에 순서가 바뀌는 목록에서는 로컬 State가 잘못된 데이터에 붙을 수 있다.
