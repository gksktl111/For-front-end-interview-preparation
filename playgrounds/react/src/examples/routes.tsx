import type React from "react";
import StaleClosure from "./1주차/day1/StaleClosure";
import AsyncRequestRaceCondition from "./1주차/day2/AsyncRequestRaceCondition";
import AsyncRequestRaceConditionSolutions from "./1주차/day2/AsyncRequestRaceConditionSolutions";
import TanStackQueryRaceConditionSolutions from "./1주차/day2/TanStackQueryRaceConditionSolutions";
import BoxModelInspector from "./1주차/day5/BoxModelInspector";
import LongTaskPlayground from "./1주차/day5/LongTaskPlayground";
import ScriptLoadingComparison from "./1주차/day5/ScriptLoadingComparison";
import SemanticElementsComparison from "./1주차/day5/SemanticElementsComparison";
import ListKeyReconciliationLab from "./2주차/day8/ListKeyReconciliationLab";
import ParentChildRenderLab from "./2주차/day8/ParentChildRenderLab";
import ProfileIdentityLab from "./2주차/day8/ProfileIdentityLab";
import StateSnapshotQueueLab from "./2주차/day8/StateSnapshotQueueLab";

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
      {
        title: "day5",
        description:
          "시맨틱 HTML, CSS 박스 모델, 브라우저 렌더링, 스크립트 로딩을 실습합니다.",
        path: "/week1/day5",
        practices: [
          {
            title: "시맨틱 요소 비교",
            description:
              "div role=button과 실제 button의 키보드 동작, 기본 접근성, 구현 부담을 비교합니다.",
            path: "/week1/day5/semantic-elements-comparison",
            Component: SemanticElementsComparison,
          },
          {
            title: "Box Model과 배치 검사기",
            description:
              "box-sizing, padding, border, display, position, z-index 값을 바꿔 실제 렌더링 결과를 관찰합니다.",
            path: "/week1/day5/box-model-inspector",
            Component: BoxModelInspector,
          },
          {
            title: "스크립트 로딩 타임라인",
            description:
              "일반 script, defer, async의 HTML 파싱 차단 여부와 실행 시점을 타임라인으로 비교합니다.",
            path: "/week1/day5/script-loading-comparison",
            Component: ScriptLoadingComparison,
          },
          {
            title: "긴 Task 재현",
            description:
              "Main Thread를 점유하는 긴 JavaScript Task가 버튼 반응과 렌더링을 어떻게 지연시키는지 확인합니다.",
            path: "/week1/day5/long-task-playground",
            Component: LongTaskPlayground,
          },
        ],
      },
    ],
  },
  {
    title: "2주차",
    description: "React 렌더링 모델과 컴포넌트 상태 설계를 다룹니다.",
    path: "/week2",
    days: [
      {
        title: "day8",
        description:
          "Render와 Commit, State Snapshot, Update Queue, key와 Identity를 화면에서 실습합니다.",
        path: "/week2/day8",
        practices: [
          {
            title: "State Snapshot과 Update Queue",
            description:
              "setState 직후 현재 Snapshot이 유지되는 이유와 값 기반 업데이트, 함수형 업데이트의 차이를 비교합니다.",
            path: "/week2/day8/state-snapshot-queue",
            Component: StateSnapshotQueueLab,
          },
          {
            title: "부모와 자식 리렌더링",
            description:
              "부모 State 변경으로 자식 컴포넌트 함수가 다시 실행되는 흐름을 render count로 확인합니다.",
            path: "/week2/day8/parent-child-render",
            Component: ParentChildRenderLab,
          },
          {
            title: "Props 변경과 key Identity",
            description:
              "사용자 전환 시 Props만 바뀌는 경우와 key가 바뀌는 경우의 로컬 State 보존 차이를 비교합니다.",
            path: "/week2/day8/profile-identity-key",
            Component: ProfileIdentityLab,
          },
          {
            title: "목록 key와 Reconciliation",
            description:
              "index key와 stable id key를 비교해 Row 로컬 State가 데이터에 붙는지 위치에 붙는지 확인합니다.",
            path: "/week2/day8/list-key-reconciliation",
            Component: ListKeyReconciliationLab,
          },
        ],
      },
    ],
  },
];

export const flatPracticeRoutes = practiceRoutes.flatMap((week) =>
  week.days.flatMap((day) => day.practices),
);
