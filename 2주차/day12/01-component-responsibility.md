# 컴포넌트 책임과 경계

## 좋은 컴포넌트의 기준

좋은 컴포넌트는 파일이 짧거나 재사용 횟수가 많은 컴포넌트가 아니라, 하나의 명확한 역할을 가진 컴포넌트다.

먼저 아래 문장을 완성해 본다.

> 이 컴포넌트는 ___하기 위해 존재한다.

이 문장이 여러 개의 동등한 역할을 나열해야만 완성된다면, 책임 경계를 다시 볼 신호다. 예를 들어 “사용자 조회, 권한 검사, 편집 폼, 삭제 확인, 수정 요청을 모두 처리한다”는 설명은 한 컴포넌트 안에 서로 다른 변경 이유가 섞였을 가능성을 보여 준다.

## 비대한 UserPage 읽기

~~~tsx
function UserPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const userQuery = useUserQuery();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  if (userQuery.isPending) {
    return <Loading />;
  }

  if (userQuery.error) {
    return <ErrorView error={userQuery.error} />;
  }

  if (!userQuery.data) {
    return <Empty />;
  }

  return (
    <>
      <form>
        {/* 입력 draft, 검증, 제출 처리 */}
      </form>

      <button
        type="button"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        Delete
      </button>

      {isDeleteDialogOpen && (
        <div>
          {/* 삭제 확인과 요청 처리 */}
        </div>
      )}
    </>
  );
}
~~~

이 코드가 틀린 것은 아니다. 화면이 작고 변경 빈도가 낮다면 한 파일에 두어도 충분히 읽기 쉽다. 다만 다음 변화가 서로 독립적으로 일어난다면 하나의 컴포넌트가 모든 변경을 떠안게 된다.

| 변경 이유 | 현재 섞여 있는 책임 | 분리 후보 |
| --- | --- | --- |
| 사용자 조회 상태 UI가 바뀜 | loading, error, empty 분기 | UserPageContent 또는 UserResults |
| 편집 입력 규칙이 바뀜 | draft, 검증, 제출 버튼 | UserForm |
| 삭제 확인 UX가 바뀜 | dialog 열림, 확인, 취소 | DeleteUserDialog |
| 요청 조합 방식이 바뀜 | query, update mutation, delete mutation | 페이지 경계 또는 목적이 분명한 Custom Hook |
| 권한 정책이 바뀜 | 수정·삭제 가능 여부 판단 | 순수 permission 함수 또는 권한 Hook |

## 책임을 기준으로 나누기

~~~text
UserPage
├─ UserPageContent
├─ UserForm
└─ DeleteUserDialog

페이지 상태 로직
├─ useUser
├─ useUpdateUser
└─ useDeleteUser
~~~

각 이름은 역할을 드러낸다.

- UserPage는 라우트 파라미터와 페이지 수준 데이터 경계를 연결한다.
- UserPageContent는 조회 결과에 맞는 화면 조합을 담당한다.
- UserForm은 사용자 정보를 편집하고 제출하는 UI를 담당한다.
- DeleteUserDialog는 삭제 확인이라는 독립된 상호작용을 담당한다.
- 데이터 조회·mutation Hook은 요청 수명과 상태를 제공하되, 화면 배치까지 알 필요는 없다.

다음처럼 페이지가 조합 역할에 집중하도록 만들 수 있다.

~~~tsx
function UserPage() {
  const userQuery = useUserQuery();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  return (
    <UserPageContent
      user={userQuery.data ?? null}
      error={userQuery.error}
      isPending={userQuery.isPending}
      onDelete={(userId) => deleteUser.mutate(userId)}
      onSubmit={(input) => updateUser.mutate(input)}
    />
  );
}
~~~

여기서도 무조건 모든 요청을 한 개의 거대한 useUserPage Hook으로 묶을 필요는 없다. 조회·수정·삭제가 같은 페이지 흐름에서만 항상 함께 바뀌고 하나의 “사용자 관리 흐름”으로 설명될 때에만 그 경계를 검토한다.

## State Owner를 함께 판단한다

컴포넌트를 분리한다고 State가 자동으로 어느 위치에 있어야 하는지는 결정되지 않는다. State는 그 값을 읽거나 바꾸는 컴포넌트와 변경 규칙을 기준으로 둔다.

| State | 주된 사용자 | 자연스러운 Owner 후보 |
| --- | --- | --- |
| UserForm의 입력 draft | UserForm | UserForm Local State |
| 삭제 대상과 dialog 열림 상태 | 삭제 버튼, DeleteUserDialog | 둘의 가까운 공통 부모 |
| 현재 user의 서버 데이터 | 페이지와 서버 캐시 | query Hook 또는 서버 상태 캐시 |
| canDelete 같은 권한 결과 | 삭제 버튼, dialog | 순수 함수로 계산하거나 필요한 가까운 경계 |
| 페이지 전환 경로 | 라우트 전체 | 라우터 또는 App 수준 경계 |

예를 들어 dialog가 자기 자신만 닫으면 되는 경우에도, 어떤 사용자에 대한 dialog를 열지 결정하는 부모가 상태를 소유하는 편이 명확할 수 있다. 반대로 Form의 입력 draft를 페이지 최상위까지 올리면 관련 없는 컴포넌트가 편집 세부 사항을 알게 된다.

## 분리할 신호

다음 중 여러 개가 맞으면 컴포넌트 경계를 검토한다.

- 독립적으로 설명 가능한 UI 역할이 있다.
- 독립적인 Local State 또는 상태 전이가 있다.
- 별도의 데이터 의존성이나 권한 규칙이 있다.
- loading, error, empty, mode 분기가 커져 JSX의 목적이 흐려진다.
- 상위 컴포넌트와 다른 이유로 자주 바뀐다.
- 별도로 테스트하거나 Storybook에서 확인할 가치가 있다.
- 다른 화면에서 재사용할 가능성이 있다.

재사용 가능성은 유용한 신호지만 필수 조건은 아니다. 한 화면 전용 DeleteUserDialog라도 삭제 확인이라는 응집된 책임을 가진다면 분리할 수 있다.

## 분리하지 않아도 되는 경우

다음 이유만으로 쪼개면 오히려 읽는 사람이 파일을 여러 개 오가야 한다.

- JSX가 20줄을 넘었다.
- 한 번만 쓰는 버튼 그룹이다.
- 부모의 문맥 없이는 의미가 없는 아주 작은 마크업 조각이다.
- 이름을 붙여도 역할이 아니라 HTML 구조만 표현한다.

~~~tsx
function ProfileHeader({ user }: { user: User }) {
  return (
    <header>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </header>
  );
}
~~~

위처럼 의미 있는 ProfileHeader는 분리할 수 있다. 하지만 한 줄의 div를 Wrapper, InnerWrapper처럼 나누면 책임이 분리되기보다 구조 탐색 비용만 늘어난다.

## 실습: 비대한 컴포넌트 나누기

Playground:

- /week2/day12/component-boundary

아래 순서로 기존 화면을 읽는다.

~~~text
1. 페이지가 하는 일을 동사로 적는다.
   예: 조회한다 / 편집한다 / 삭제를 확인한다 / 권한을 판단한다
↓
2. 각 동사가 같은 이유로 바뀌는지 묻는다.
↓
3. 독립된 UI 경계가 있으면 컴포넌트로 뺀다.
↓
4. UI와 무관한 상태 전이·요청 조합이면 Custom Hook 또는 순수 함수 후보로 둔다.
↓
5. State를 실제 사용자에게 가장 가까운 Owner에 둔다.
~~~

다음 질문에 답해 본다.

- UserForm이 받은 user를 draft로 복사한다면 저장·취소·user 변경 시 재초기화 규칙은 어디에 둘 것인가?
- DeleteUserDialog가 열린 상태를 직접 바꿀 수 있어야 하는가, 아니면 부모의 onClose를 호출해야 하는가?
- UserPageContent가 loading, error, empty를 모두 처리하면 UserPage는 어떤 책임만 남는가?

## 기억할 문장

> 컴포넌트를 작게 만드는 것이 목적이 아니라, 서로 다른 변경 이유와 책임을 분리하는 것이 목적이다.
