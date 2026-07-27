# TypeScript Playground

TypeScript 예제와 실습 코드를 보관합니다.

- `day4`: `unknown`, Discriminated Union, 상태 모델링, Exhaustive Check, Validation 반환 타입 예제

Node.js 24 이상에서는 타입 제거 기능으로 `.ts` 파일을 바로 실행할 수 있습니다.

```bash
node playgrounds/ts/1주차/day4/01-error-unknown.ts
```

파일을 수정하면서 반복 실행하려면 `nodemon`에 파일 경로를 넘깁니다.

```bash
npx nodemon playgrounds/ts/1주차/day4/01-error-unknown.ts
```

TypeScript 컴파일러가 설치되어 있다면 루트 `tsconfig.json` 기준으로 타입 체크할 수 있습니다.

```bash
npx tsc --noEmit
```

실행 환경이 없는 경우에도 에디터의 TypeScript 검사나 TypeScript Playground에서 코드를 확인할 수 있습니다.
