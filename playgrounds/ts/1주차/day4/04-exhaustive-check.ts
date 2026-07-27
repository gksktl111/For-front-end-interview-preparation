type ViewMode = "list" | "grid" | "detail";

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

function getViewModeLabel(mode: ViewMode): string {
  switch (mode) {
    case "list":
      return "리스트";
    case "grid":
      return "그리드";
    case "detail":
      return "상세";
    default:
      return assertNever(mode);
  }
}

const modes: ViewMode[] = ["list", "grid", "detail"];

for (const mode of modes) {
  console.log(getViewModeLabel(mode));
}

// 실습:
// 1. ViewMode에 "calendar"를 추가한다.
// 2. switch에 calendar 처리를 추가하지 않는다.
// 3. assertNever(mode) 위치에서 타입 오류가 나는지 확인한다.

/*
직접 풀어보기

문제:
ThemeMode 타입과 getThemeModeLabel 함수를 직접 구현한다.

요구사항:
1. ThemeMode는 "light" | "dark" | "system" 유니언 타입이다.
2. getThemeModeLabel은 각 값에 대해 "라이트", "다크", "시스템"을 반환한다.
3. default 분기에서 assertNever를 호출한다.
4. 구현 후 ThemeMode에 "contrast"를 추가하고 switch 처리를 일부러 빼먹어 타입 오류를 확인한다.

힌트:
- assertNever 함수는 위에 이미 있으므로 재사용한다.
- 모든 분기를 처리하면 default의 값은 never가 된다.

예상 결과:
라이트
다크
시스템
*/

type ThemeMode = "light" | "dark" | "system" | "contrast";

function getThemeModeLabel(mode: ThemeMode): string {
  // TODO: 직접 구현해보기

  switch(mode){
    case "light":
      return '라이트'
    case "dark":
      return '다크'
    case "system":
      return '시스템'
    default :
      return assertNever(mode)
  }
}

const themeModes: ThemeMode[] = ["light", "dark", "system"];

for (const mode of themeModes) {
    console.log(getThemeModeLabel(mode));
}

export {};
