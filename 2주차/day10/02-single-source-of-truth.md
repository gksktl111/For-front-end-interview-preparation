# Single Source of Truth

## 하나의 의미에는 하나의 권위 있는 값

Single Source of Truth는 같은 의미의 데이터를 여러 State에 중복해 두지 않는 원칙이다.

~~~text
Parent.selectedId
Child.localSelectedId
~~~

두 값이 모두 현재 선택된 id를 의미한다면 다음과 같은 상태가 가능해진다.

~~~text
Parent.selectedId = clip-1
Child.localSelectedId = clip-2
~~~

이제 어느 값이 진짜인지, 언제 두 값을 맞춰야 하는지를 코드가 결정해야 한다. 보통 그 동기화 코드는 누락되기 쉽다.

## Props를 Local State로 복사하는 문제

~~~tsx
function UserProfile({ user }: { user: User }) {
  const [localUser, setLocalUser] = useState(user);

  return <div>{localUser.name}</div>;
}
~~~

이 코드는 Props가 바뀌어도 localUser를 자동 갱신하지 않는다. useState의 인자는 처음 마운트할 때 초기값으로만 사용된다.

단순 표시라면 Props를 직접 사용한다.

~~~tsx
function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
~~~

## 별도 Local State가 정당한 경우

복사본이 항상 잘못된 것은 아니다. 다만 원본과 다른 의미를 가져야 한다.

### 편집 draft

~~~tsx
function UserEditor({ user, onSave }: UserEditorProps) {
  const [nameDraft, setNameDraft] = useState(user.name);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...user, name: nameDraft });
      }}
    >
      <input
        value={nameDraft}
        onChange={(event) => setNameDraft(event.target.value)}
      />
    </form>
  );
}
~~~

여기서 user는 저장된 원본, nameDraft는 아직 저장하지 않은 편집 값이다. 의미가 다르므로 둘을 분리할 수 있다.

대신 다음 정책이 필요하다.

- Props의 user가 다른 사용자로 바뀌면 draft를 유지할지 초기화할지 결정한다.
- 저장 성공 후 어떤 값이 원본이 되는지 정한다.
- 취소 시 draft를 어떻게 되돌릴지 정한다.
- 변경 중 서버 갱신이 오면 충돌을 어떻게 처리할지 정한다.

## 파생 값도 중복 State가 될 수 있다

~~~tsx
const [price, setPrice] = useState(12000);
const [quantity, setQuantity] = useState(2);
const [totalPrice, setTotalPrice] = useState(24000);
~~~

totalPrice가 항상 price와 quantity의 곱이라면 별도 원본이 아니다.

~~~tsx
const [price, setPrice] = useState(12000);
const [quantity, setQuantity] = useState(2);
const totalPrice = price * quantity;
~~~

원천 State를 최소화하면 갱신 이벤트마다 totalPrice를 동기화하는 코드를 쓸 필요가 없다.

## Server State 복제도 같은 문제

~~~tsx
const { data: clips = [] } = useClips();
const [localClips, setLocalClips] = useState(clips);
~~~

서버 캐시가 새 데이터를 받거나 invalidation으로 갱신되어도 localClips는 저절로 따라가지 않는다. 목록을 그대로 표시하는 목적이면 아래처럼 하나만 쓴다.

~~~tsx
const { data: clips = [] } = useClips();

return <ClipList clips={clips} />;
~~~

로컬에서 드래그 정렬을 잠시 편집하거나 저장 전 변경을 모으는 요구사항처럼 별도의 draft가 필요하다면, 복사본의 생명주기와 서버 반영 시점을 설계한다.

## 점검 질문

~~~text
두 값은 같은 현실의 같은 사실을 표현하는가?
↓ Yes
둘 중 하나를 없애고 Source of Truth를 정한다.

↓ No
원본, draft, 캐시, 파생 값의 역할이 코드와 이름에 드러나는가?
↓
동기화, 저장, 취소, 재초기화 규칙이 있는가?
~~~

## 기억할 문장

> 데이터가 두 개라서 문제가 아니라, 같은 의미의 데이터를 권위 없이 두 개 관리할 때 문제가 생긴다.
