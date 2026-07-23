import type React from "react";
import StaleClosure from "./1주차/day1/StaleClosure";
import AsyncRequestRaceCondition from "./1주차/day2/AsyncRequestRaceCondition";
import AsyncRequestRaceConditionSolutions from "./1주차/day2/AsyncRequestRaceConditionSolutions";
import TanStackQueryRaceConditionSolutions from "./1주차/day2/TanStackQueryRaceConditionSolutions";

export type PracticeRoute = {
  title: string;
  description: string;
  path: string;
  Component: () => React.JSX.Element;
};

export type DayRouteGroup = {
  title: string;
  description: string;
  path: string;
  practices: PracticeRoute[];
};

export type WeekRouteGroup = {
  title: string;
  description: string;
  path: string;
  days: DayRouteGroup[];
};

export const practiceRoutes: WeekRouteGroup[] = [
  {
    title: "1주차",
    description: "JavaScript 실행 흐름과 React 상태 업데이트의 기초를 다룹니다.",
    path: "/week1",
    days: [
      {
        title: "day1",
        description: "React closure와 상태 업데이트 흐름을 실습합니다.",
        path: "/week1/day1",
        practices: [
          {
            title: "Stale Closure 실습",
            description:
              "useEffect와 interval 예제로 stale closure 발생 원인과 해결 방식을 비교합니다.",
            path: "/week1/day1/stale-closure",
            Component: StaleClosure,
          },
        ],
      },
      {
        title: "day2",
        description: "비동기 요청의 실패, 취소, 응답 순서 문제를 실습합니다.",
        path: "/week1/day2",
        practices: [
          {
            title: "비동기 요청 레이스 컨디션 재현",
            description:
              "느린 이전 요청이 빠른 최신 요청보다 늦게 완료되면서 화면 결과를 덮어쓰는 문제를 재현합니다. DevTools Network 탭도 함께 확인해 보세요.",
            path: "/week1/day2/async-request-race-condition",
            Component: AsyncRequestRaceCondition,
          },
          {
            title: "비동기 요청 레이스 컨디션 해결법",
            description:
              "요청 번호 검사와 AbortController 취소로 오래된 응답이 최신 상태를 덮어쓰지 못하게 막는 방법을 비교합니다. DevTools Network 탭도 함께 확인해 보세요.",
            path: "/week1/day2/async-request-race-condition-solutions",
            Component: AsyncRequestRaceConditionSolutions,
          },
          {
            title: "TanStack Query 레이스 컨디션 해결법",
            description:
              "queryKey 캐시 분리와 queryFn AbortSignal 전달로 오래된 응답이 현재 UI를 덮어쓰지 못하게 막는 방법을 비교합니다. DevTools Network 탭도 함께 확인해 보세요.",
            path: "/week1/day2/tanstack-query-race-condition-solutions",
            Component: TanStackQueryRaceConditionSolutions,
          },
        ],
      },
    ],
  },
];

export const flatPracticeRoutes = practiceRoutes.flatMap((week) =>
  week.days.flatMap((day) => day.practices),
);
