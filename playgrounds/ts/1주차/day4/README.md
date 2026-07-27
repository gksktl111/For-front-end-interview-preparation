# Day 4 TypeScript Practice

TypeScript의 타입 좁히기, 안전한 상태 모델링, 일관된 반환 타입을 연습합니다.

## 파일 목록

- `01-error-unknown.ts`: `any` 대신 `unknown`으로 에러 안전하게 처리
- `02-api-result-discriminated-union.ts`: API 결과를 Discriminated Union으로 분기
- `03-async-state.ts`: 잘못된 비동기 상태를 표현할 수 없게 설계
- `04-exhaustive-check.ts`: `never`로 빠진 분기 검사
- `05-validation-result.ts`: 일관된 Validation 반환 타입 만들기

## 확인 방법

Node.js 24 이상에서는 타입 제거 기능으로 `.ts` 파일을 바로 실행할 수 있습니다.

```bash
node playgrounds/ts/1주차/day4/01-error-unknown.ts
```

파일을 수정하면서 반복 실행하려면 `nodemon`에 파일 경로를 넘깁니다.

```bash
npx nodemon playgrounds/ts/1주차/day4/01-error-unknown.ts
```

Node 버전이 낮다면 에디터의 TypeScript 검사 또는 TypeScript Playground에서 확인합니다.
