const pages = [0, null, undefined, ""];

for (const page of pages) {
  // ||는 Falsy 값이면 기본값을 사용한다.
  const withOr = page || 1;

  // ??는 null 또는 undefined일 때만 기본값을 사용한다.
  const withNullish = page ?? 1;

  console.log({
    page,
    "page || 1": withOr,
    "page ?? 1": withNullish,
  });
}
