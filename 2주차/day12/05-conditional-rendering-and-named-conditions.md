# 조건부 렌더링과 이름 있는 조건

## JSX 안의 분기가 커지는 신호

간단한 loading 분기는 JSX 안에 두어도 자연스럽다.

~~~tsx
return isPending ? <Loading /> : <ClipList clips={clips} />;
~~~

하지만 loading, error, empty, 권한, 선택 모드, mutation 상태가 한 표현식에 누적되면 어떤 조건이 우선인지 읽기 어려워진다.

~~~tsx
function ClipPage() {
  return (
    <>
      {isPending ? (
        <Loading />
      ) : error ? (
        <ErrorView />
      ) : clips.length === 0 ? (
        <Empty />
      ) : isDeleteMode ? (
        <DeleteClipList clips={clips} />
      ) : (
        <ClipList clips={clips} />
      )}
    </>
  );
}
~~~

문제는 삼항 연산자 자체가 아니라, 분기 순서·각 상태의 UI·다음 변경 지점을 한 덩어리로 추적해야 한다는 점이다.

## 결과 컴포넌트로 분리하기

~~~tsx
type ClipResultsProps = {
  clips: Clip[];
  error: Error | null;
  isDeleteMode: boolean;
  isPending: boolean;
};

function ClipResults({
  clips,
  error,
  isDeleteMode,
  isPending,
}: ClipResultsProps) {
  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  if (clips.length === 0) {
    return <Empty />;
  }

  if (isDeleteMode) {
    return <DeleteClipList clips={clips} />;
  }

  return <ClipList clips={clips} />;
}
~~~

상위 페이지는 데이터와 동작을 조합하고, ClipResults는 결과 상태를 어떤 우선순위로 보여 줄지만 담당한다.

~~~tsx
function ClipPage() {
  const clipsQuery = useClips();
  const selection = useClipSelection();

  return (
    <>
      <ClipToolbar
        isDeleteMode={selection.isDeleteMode}
        onExitDeleteMode={selection.exitDeleteMode}
      />

      <ClipResults
        clips={clipsQuery.data ?? []}
        error={clipsQuery.error ?? null}
        isDeleteMode={selection.isDeleteMode}
        isPending={clipsQuery.isPending}
      />
    </>
  );
}
~~~

## 분기 순서는 제품 정책이다

위 예제는 loading을 가장 먼저 보여 준다. 하지만 이전 목록을 유지하면서 refetch하는 화면이라면 isFetching만으로 Loading 화면을 덮으면 안 될 수 있다. error와 stale data를 동시에 보여 줄 수도 있다.

따라서 분리를 할 때는 단지 if 문으로 바꾸지 말고, 화면 정책을 문장으로 먼저 정한다.

~~~text
초기 요청 중에는 전체 Loading을 보여 준다.
기존 데이터가 있을 때의 재요청은 목록을 유지하고 작은 pending 표시만 한다.
오류가 있어도 이전 데이터가 있으면 오류 배너와 목록을 함께 보여 준다.
데이터가 정상적으로 비어 있을 때만 Empty를 보여 준다.
~~~

이 정책이 정리되면 ClipResults의 분기 순서와 Props도 자연스럽게 결정된다.

## 복잡한 boolean 조건에 이름 붙이기

다음 조건은 문법상 맞지만 무슨 권한을 표현하는지 빠르게 알기 어렵다.

~~~tsx
if (
  user &&
  user.role === "admin" &&
  subscription?.status === "active" &&
  selectedIds.length > 0 &&
  !isDeleting
) {
  // ...
}
~~~

의미 단위로 이름을 붙이면 조건을 읽는 사람이 도메인 규칙을 따라갈 수 있다.

~~~tsx
const isAdmin = user?.role === "admin";
const hasActiveSubscription = subscription?.status === "active";
const hasSelection = selectedIds.length > 0;
const canDelete =
  isAdmin &&
  hasActiveSubscription &&
  hasSelection &&
  !isDeleting;

if (canDelete) {
  // ...
}
~~~

이름 있는 조건은 디버깅에도 도움이 된다. canDelete가 false일 때 개발 도구나 로그에서 어느 세부 조건이 false인지 확인할 수 있다.

## 변수와 순수 함수의 경계

한 컴포넌트에서 한 번 쓰는 단순 조건이면 const가 충분하다. 여러 컴포넌트에서 같은 권한 규칙을 쓰거나 테스트가 중요하다면 순수 함수로 추출한다.

~~~tsx
type DeletePermissionInput = {
  hasActiveSubscription: boolean;
  hasSelection: boolean;
  isAdmin: boolean;
  isDeleting: boolean;
};

function canDeleteClips({
  hasActiveSubscription,
  hasSelection,
  isAdmin,
  isDeleting,
}: DeletePermissionInput) {
  return (
    isAdmin &&
    hasActiveSubscription &&
    hasSelection &&
    !isDeleting
  );
}
~~~

이 함수는 React Hook을 사용하지 않으므로 useCanDeleteClips라고 부를 이유가 없다. 데이터 접근이나 State를 조합해야 할 때에만 별도의 Hook이 자연스럽다.

## 조건부 렌더링을 분리할 신호

| 신호 | 우선 검토할 구조 |
| --- | --- |
| 중첩 삼항 연산자가 두 번 이상 이어짐 | early return을 쓰는 결과 컴포넌트 |
| loading, error, empty가 여러 페이지에서 같은 정책을 가짐 | 재사용 가능한 Results 또는 Boundary 컴포넌트 |
| mode에 따라 전체 화면 구조가 달라짐 | mode별 화면 컴포넌트 |
| 조건식이 여러 도메인 규칙을 섞음 | 이름 있는 변수 또는 순수 predicate 함수 |
| 조건의 우선순위가 제품 정책임 | 정책을 먼저 문장으로 기록하고 테스트 |

작은 조건을 모두 컴포넌트로 옮기지는 않는다. 버튼 하나의 disabled 여부처럼 가까운 JSX에서 의미가 분명한 조건은 해당 위치에 둬도 좋다.

~~~tsx
const hasSelection = selectedIds.size > 0;

return (
  <button type="button" disabled={!hasSelection}>
    선택한 클립 삭제
  </button>
);
~~~

## 실습: 조건을 읽을 수 있게 바꾸기

Playground:

- /week2/day12/conditional-results

아래 순서로 기존 JSX를 정리한다.

~~~text
1. 화면이 가질 수 있는 상태를 목록으로 적는다.
   loading / error / empty / content / delete mode
↓
2. 동시에 참일 수 있는 상태와 우선순위를 정한다.
↓
3. 화면 결과를 담당하는 컴포넌트에 early return으로 작성한다.
↓
4. boolean 식의 의미 단위를 is..., has..., can... 이름으로 분리한다.
↓
5. 여러 곳에서 쓰이는 규칙만 순수 함수로 올린다.
~~~

## 기억할 문장

> 조건 자체를 무조건 줄이는 것보다, 조건이 표현하는 상태와 도메인 의미를 드러내는 것이 중요하다.
