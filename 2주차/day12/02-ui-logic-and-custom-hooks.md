# UI 로직, 비즈니스 로직, Custom Hook

## UI와 상태 로직은 반드시 분리해야 하는가?

아니다. 작은 화면에서는 State 선언, 이벤트 handler, JSX가 같은 컴포넌트에 있어도 가장 읽기 좋은 구조일 수 있다.

~~~tsx
function ClipPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function handleDelete() {
    await deleteClips(selectedIds);
    setSelectedIds([]);
  }

  return (
    <ClipPageView
      selectedIds={selectedIds}
      onDelete={() => void handleDelete()}
      onSelectedIdsChange={setSelectedIds}
    />
  );
}
~~~

위 코드의 State와 handler는 화면의 의미와 가깝고, 한 번 읽어서 흐름을 이해할 수 있다. 단지 useState가 있다는 이유로 Hook을 만들 필요는 없다.

분리가 유용해지는 시점은 조회, mutation, selection, pagination, modal, permission, form 상태가 섞여 컴포넌트가 두 가지 이상의 역할을 갖기 시작할 때다.

## UI 로직과 비즈니스 로직을 나누는 관점

프론트엔드에서 두 영역은 칼로 자르듯 완전히 분리되지 않는다. 이벤트 handler는 버튼 클릭이라는 UI와 삭제 요청이라는 애플리케이션 동작을 연결한다. 따라서 “어느 파일에 둘까?”보다 “무엇이 바뀔 때 함께 바뀌는가?”를 기준으로 본다.

| 영역 | 예시 | 자연스러운 위치 |
| --- | --- | --- |
| UI 표현 | layout, className, label, 접근성 속성, 작은 표시용 조건 | 컴포넌트 |
| UI 상호작용 | input 변경, modal 열기, focus 이동 | 컴포넌트 또는 가까운 UI Hook |
| 상태 전이 | selection 추가·제거, pagination 이동, form 단계 전환 | 목적이 명확한 Custom Hook 후보 |
| 서버 연동 | query, mutation, retry, invalidation | 데이터 Hook 또는 서버 상태 도구 경계 |
| 도메인 규칙 | 권한, 가격 계산 규칙, 입력 검증 규칙 | 순수 함수가 우선, 필요하면 Hook에서 조합 |

도메인 규칙이 React State나 Effect를 전혀 쓰지 않는다면 Custom Hook보다 일반 함수가 더 적합하다. Hook이라는 이름은 React의 렌더링 수명과 Hook을 사용한다는 계약을 암시하기 때문이다.

## Custom Hook을 만드는 판단 흐름

~~~text
로직이 한 컴포넌트에서 자연스럽게 읽히는가?
↓ Yes
우선 컴포넌트에 둔다.

↓ No
상태 전이, Effect, 요청, 권한 조합처럼 독립된 책임이 있는가?
↓ No
순수 함수 또는 작은 컴포넌트 분리를 검토한다.

↓ Yes
다른 UI에서도 재사용하거나 독립적으로 테스트할 가치가 있는가?
↓ Yes
Custom Hook 후보

↓ No
화면 전용이어도 UI를 단순하게 만드는 응집된 로직인가?
↓ Yes
화면 전용 Custom Hook 후보
~~~

재사용은 충분조건이지만 필요조건은 아니다. useClipSelection처럼 선택 상태 전이 자체가 하나의 명확한 역할이라면 한 화면에서만 쓰여도 Hook으로 분리할 수 있다.

## Custom Hook의 목적

Custom Hook은 React Hook을 조합해 재사용 가능한 상태 로직을 만드는 함수다.

~~~tsx
function useToggle(initialValue = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function toggle() {
    setIsOpen((previous) => !previous);
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

function ModalExample() {
  const modal = useToggle();

  return (
    <>
      <button type="button" onClick={modal.open}>
        Open
      </button>

      {modal.isOpen && <Modal onClose={modal.close} />}
    </>
  );
}
~~~

이 Hook의 가치는 버튼 코드 한 줄을 줄이는 데 있지 않다. 열림 상태와 open, close, toggle이라는 상태 전이를 한 계약으로 묶고, ModalExample이 화면 조합에 집중하게 만드는 데 있다.

## selection 로직 추출 예제

선택, 삭제 모드, 선택 해제 규칙이 여러 handler에 흩어지기 시작하면 selection의 책임을 Hook으로 묶을 수 있다.

~~~tsx
type UseClipSelectionResult = {
  selectedIds: ReadonlySet<string>;
  isDeleteMode: boolean;
  enterDeleteMode: () => void;
  exitDeleteMode: () => void;
  toggleSelected: (clipId: string) => void;
};

function useClipSelection(): UseClipSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  function toggleSelected(clipId: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(clipId)) {
        next.delete(clipId);
      } else {
        next.add(clipId);
      }

      return next;
    });
  }

  function enterDeleteMode() {
    setIsDeleteMode(true);
  }

  function exitDeleteMode() {
    setSelectedIds(new Set());
    setIsDeleteMode(false);
  }

  return {
    selectedIds,
    isDeleteMode,
    enterDeleteMode,
    exitDeleteMode,
    toggleSelected,
  };
}
~~~

이 Hook은 “클립 선택과 삭제 모드의 상태 전이를 관리한다”라고 한 문장으로 설명할 수 있다. 반면 조회, mutation, toast, analytics, filter, route 이동까지 모두 반환하는 useClipPage는 책임이 너무 넓어졌는지 의심해야 한다.

## Hook 반환값은 안정적인 계약이어야 한다

Hook 사용자는 반환값의 모양을 예측할 수 있어야 한다.

~~~tsx
type UseUserResult = {
  user: User | null;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
};

function useUser(userId?: string): UseUserResult {
  const query = useUserQuery(userId);

  return {
    user: query.data ?? null,
    isPending: query.isPending,
    error: query.error ?? null,
    refetch: () => {
      void query.refetch();
    },
  };
}
~~~

다음처럼 같은 Hook이 상황마다 전혀 다른 타입을 반환하면 사용자가 매 호출부에서 특별한 분기를 해야 한다.

~~~tsx
return user;

return null;

return {
  user,
  isPending,
};
~~~

항상 객체를 반환해야 한다는 뜻은 아니다. 값 하나만 자연스럽게 반환하는 useId, useTheme 같은 Hook은 값 하나를 반환할 수 있다. 핵심은 같은 Hook의 계약이 호출 상황에 따라 흔들리지 않는 것이다.

## 반환값이 너무 많을 때 확인할 것

반환값 개수에 절대적인 기준은 없지만, 아래 신호가 보이면 God Hook을 의심한다.

- 반환값을 사용하는 화면 영역이 서로 전혀 다르다.
- selection, pagination, modal, query, permission, form을 한 Hook이 모두 소유한다.
- Hook 이름 하나로 무엇을 하는지 설명하기 어렵다.
- 일부 호출부는 반환값 대부분을 무시한다.
- 한 상태 전이의 변경이 다른 기능의 테스트까지 자주 깨뜨린다.

이 경우 무조건 작은 Hook 수십 개로 나누기보다, 실제 사용자 흐름에 맞춰 useClipSelection, useClipPagination, useDeleteClips처럼 응집된 단위로 나눈다. 외부에 노출할 API도 직접 State setter보다 enter, exit, submit 같은 의도를 드러내는 동작을 우선한다.

## Hook으로 만들지 않는 편이 좋은 사례

| 상황 | 더 단순한 선택 |
| --- | --- |
| 한 컴포넌트의 짧은 useState와 handler | 컴포넌트에 그대로 둔다. |
| React State를 쓰지 않는 가격·권한·문자열 규칙 | 순수 함수로 만든다. |
| 한 번만 쓰고 독립된 상태 전이도 없는 JSX 조각 | 작은 컴포넌트가 필요한지부터 다시 본다. |
| 명확한 이유 없이 코드 줄 수만 줄이려는 추출 | 기존 위치를 유지한다. |
| 여러 책임을 한꺼번에 감춘 거대한 usePage Hook | 책임별 Hook 또는 컴포넌트로 다시 나눈다. |

## 실습: ClipPage에서 무엇을 뺄지 결정하기

Playground:

- /week2/day12/custom-hook-selection

다음 코드가 커졌다고 가정하고, 각 항목의 경계를 결정해 본다.

~~~text
클립 목록 조회
선택 상태 전이
삭제 요청
삭제 확인 modal
페이지네이션
권한 확인
목록 렌더링
~~~

- selection 규칙은 useClipSelection으로 한 문장 설명이 가능한가?
- 삭제 확인 UI는 DeleteClipDialog라는 컴포넌트로 독립적인가?
- canDelete는 순수한 boolean 계산인가, 서버 상태를 읽는 Hook인가?
- 목록 렌더링은 data와 callback Props만 받아도 되는가?
- 모든 항목을 useClipPage 하나로 숨기면 그 Hook의 사용자가 필요한 API를 이해하기 쉬운가?

## 기억할 문장

> Custom Hook은 컴포넌트에서 코드를 숨기는 도구가 아니라, 상태 로직의 책임과 사용 계약을 명확하게 만드는 도구다.
