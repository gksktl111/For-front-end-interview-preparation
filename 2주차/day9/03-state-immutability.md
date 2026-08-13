# State 불변성

## 핵심 개념

React State는 직접 변경하지 않고 새로운 값으로 교체한다.

```tsx
type User = {
  name: string;
  profile: {
    nickname: string;
  };
};

const [user, setUser] = useState<User>({
  name: "React",
  profile: {
    nickname: "react-user",
  },
});
```

잘못된 예:

```tsx
function handleChangeName() {
  user.name = "Next";
  setUser(user);
}
```

권장:

```tsx
function handleChangeName() {
  setUser((previousUser) => ({
    ...previousUser,
    name: "Next",
  }));
}
```

핵심:

> React State는 기존 객체를 수정하는 방식이 아니라, 변경된 상태를 나타내는 새로운 값을 만들어 업데이트한다.

## 중첩 객체 업데이트

Spread Operator는 얕은 복사다. 따라서 중첩 객체를 바꿀 때는 변경되는 계층마다 새 객체를 만들어야 한다.

잘못된 예:

```tsx
user.profile.nickname = "next-user";
setUser(user);
```

권장:

```tsx
setUser((previousUser) => ({
  ...previousUser,
  profile: {
    ...previousUser.profile,
    nickname: "next-user",
  },
}));
```

왜 `profile`도 다시 복사하는가?

```text
{ ...previousUser }
→ user 객체 한 단계만 새로 만든다.

profile: { ...previousUser.profile }
→ 중첩된 profile 객체도 새로 만든다.
```

## 배열 업데이트

잘못된 예:

```tsx
items.push(newItem);
setItems(items);
```

권장:

```tsx
setItems((previousItems) => [...previousItems, newItem]);
```

삭제:

```tsx
setItems((previousItems) =>
  previousItems.filter((item) => item.id !== targetId),
);
```

수정:

```tsx
setItems((previousItems) =>
  previousItems.map((item) =>
    item.id === targetId ? { ...item, done: true } : item,
  ),
);
```

## 직접 변경이 위험한 이유

직접 변경은 다음 문제를 만든다.

- React가 이전 State와 다음 State를 같은 참조로 볼 수 있다.
- memoized child, `useMemo`, `useCallback` 의존성 비교가 깨질 수 있다.
- 이전 값과 다음 값을 비교하기 어려워진다.
- 디버깅과 되돌리기, 테스트가 어려워진다.

특히 객체 내부만 바꾸고 최상위 참조를 그대로 재사용하면 "값은 바뀐 것 같은데 일부 UI가 업데이트되지 않는" 문제가 생길 수 있다.

## 실습 코드

```tsx
user.profile.nickname = "next-user";
setUser(user);
```

```tsx
setUser((previousUser) => ({
  ...previousUser,
  profile: {
    ...previousUser.profile,
    nickname: "next-user",
  },
}));
```

확인할 것:

- 왜 기존 State 객체를 직접 수정하면 안 되는가?
- Spread가 왜 중첩 계층마다 필요한가?
- Spread는 깊은 복사인가, 얕은 복사인가?
