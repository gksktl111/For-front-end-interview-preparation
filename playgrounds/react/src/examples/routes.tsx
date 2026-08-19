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
import DerivedStateLab from "./2주차/day9/DerivedStateLab";
import EventPropagationDefaultLab from "./2주차/day9/EventPropagationDefaultLab";
import EventStateSnapshotLab from "./2주차/day9/EventStateSnapshotLab";
import StateImmutabilityLab from "./2주차/day9/StateImmutabilityLab";
import StateModelingLab from "./2주차/day9/StateModelingLab";
import AbortControllerLab from "./2주차/day11/AbortControllerLab";
import CleanupStrictModeLab from "./2주차/day11/CleanupStrictModeLab";
import EffectRaceConditionLab from "./2주차/day11/EffectRaceConditionLab";
import EffectSynchronizationLab from "./2주차/day11/EffectSynchronizationLab";
import EventHandlerVsEffectLab from "./2주차/day11/EventHandlerVsEffectLab";
import StaleClosureDependenciesLab from "./2주차/day11/StaleClosureDependenciesLab";
import ContextScopeLab from "./2주차/day10/ContextScopeLab";
import LiftingStateUpLab from "./2주차/day10/LiftingStateUpLab";
import PropsCompositionLab from "./2주차/day10/PropsCompositionLab";
import ServerStateCopyLab from "./2주차/day10/ServerStateCopyLab";
import SingleSourceTruthLab from "./2주차/day10/SingleSourceTruthLab";
import StateOwnershipLab from "./2주차/day10/StateOwnershipLab";

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
      {
        title: "day9",
        description:
          "이벤트 처리, 전파 제어, State 불변성, 파생 State, 상태 구조 설계를 실습합니다.",
        path: "/week2/day9",
        practices: [
          {
            title: "이벤트 전파와 기본 동작",
            description:
              "중첩 클릭에서 target/currentTarget 차이, stopPropagation, preventDefault를 화면 로그로 확인합니다.",
            path: "/week2/day9/event-propagation-default",
            Component: EventPropagationDefaultLab,
          },
          {
            title: "State 직접 변경 vs 불변 업데이트",
            description:
              "중첩 객체 State를 직접 수정했을 때와 새 참조로 업데이트했을 때 memoized child 반응을 비교합니다.",
            path: "/week2/day9/state-immutability",
            Component: StateImmutabilityLab,
          },
          {
            title: "불필요한 State 제거",
            description:
              "price와 quantity에서 계산 가능한 totalPrice를 별도 State로 둘 때 생기는 동기화 문제를 재현합니다.",
            path: "/week2/day9/derived-state",
            Component: DerivedStateLab,
          },
          {
            title: "불가능한 State 조합 제거",
            description:
              "isOpen과 selectedId를 분리한 모델과 Discriminated Union 모델을 비교합니다.",
            path: "/week2/day9/state-modeling",
            Component: StateModelingLab,
          },
          {
            title: "이벤트 핸들러의 State Snapshot",
            description:
              "함수형 업데이트를 사용해도 같은 이벤트 핸들러 안의 State 값이 유지되는 이유를 로그로 확인합니다.",
            path: "/week2/day9/event-state-snapshot",
            Component: EventStateSnapshotLab,
          },
        ],
      },
      {
        title: "day10",
        description:
          "State Ownership, 단일 Source of Truth, 공유 State, Composition, Context, Server State를 실습합니다.",
        path: "/week2/day10",
        practices: [
          {
            title: "State Ownership 찾기",
            description:
              "검색 입력과 결과가 같은 keyword를 쓸 때 State를 어느 컴포넌트까지 올려야 하는지 비교합니다.",
            path: "/week2/day10/state-ownership",
            Component: StateOwnershipLab,
          },
          {
            title: "Props 복사와 Source of Truth",
            description:
              "Props를 useState 초기값으로 복사했을 때 부모 user 변경이 Local State에 반영되지 않는 이유를 확인합니다.",
            path: "/week2/day10/single-source-of-truth",
            Component: SingleSourceTruthLab,
          },
          {
            title: "Lifting State Up과 공유 Counter",
            description:
              "독립 Counter 두 개와 공통 부모의 count를 공유하는 Counter 두 개를 비교합니다.",
            path: "/week2/day10/lifting-state-up",
            Component: LiftingStateUpLab,
          },
          {
            title: "Props Drilling과 Composition",
            description:
              "중간 컴포넌트가 user를 전달만 하는 구조와 UI slot을 주입하는 구조를 비교합니다.",
            path: "/week2/day10/props-composition",
            Component: PropsCompositionLab,
          },
          {
            title: "Context 범위와 Consumer 영향",
            description:
              "하나의 큰 Context와 책임별 Context에서 설정 변경이 Consumer에 미치는 차이를 확인합니다.",
            path: "/week2/day10/context-scope",
            Component: ContextScopeLab,
          },
          {
            title: "Server State 복제 문제",
            description:
              "React Query의 query data를 그대로 쓸 때와 Local State로 복사할 때 서버 갱신 반응을 비교합니다.",
            path: "/week2/day10/server-state-copy",
            Component: ServerStateCopyLab,
          },
        ],
      },
      {
        title: "day11",
        description:
          "useEffect의 동기화 목적, Dependency, Cleanup, 비동기 요청 수명과 Race Condition을 실습합니다.",
        path: "/week2/day11",
        practices: [
          {
            title: "Effect와 외부 시스템 동기화",
            description:
              "React count를 browser document.title과 맞추는 Effect와 렌더링 중 계산하는 파생 값을 비교합니다.",
            path: "/week2/day11/effect-synchronization",
            Component: EffectSynchronizationLab,
          },
          {
            title: "Event Handler와 Effect 구분",
            description:
              "삭제처럼 사용자 클릭이 원인인 작업을 flag State + Effect 구조와 Event Handler 구조로 비교합니다.",
            path: "/week2/day11/event-handler-vs-effect",
            Component: EventHandlerVsEffectLab,
          },
          {
            title: "Cleanup과 StrictMode",
            description:
              "window resize listener의 setup과 cleanup을 mount, unmount, 이벤트 trace로 관찰합니다.",
            path: "/week2/day11/cleanup-strict-mode",
            Component: CleanupStrictModeLab,
          },
          {
            title: "stale closure와 Dependency",
            description:
              "timer callback이 캡처한 이전 State와 [count] dependency로 재연결한 최신 State를 비교합니다.",
            path: "/week2/day11/stale-closure-dependencies",
            Component: StaleClosureDependenciesLab,
          },
          {
            title: "Effect 요청 Race Condition",
            description:
              "느린 이전 요청이 빠른 최신 요청을 덮어쓰는 현상과 cleanup 기반 응답 무시를 재현합니다.",
            path: "/week2/day11/effect-race-condition",
            Component: EffectRaceConditionLab,
          },
          {
            title: "AbortController로 요청 취소",
            description:
              "Effect cleanup에서 AbortController로 이전 fetch를 취소하고 HTTP 오류를 분리해 처리합니다.",
            path: "/week2/day11/abort-controller",
            Component: AbortControllerLab,
          },
        ],
      },
    ],
  },
];

export const flatPracticeRoutes = practiceRoutes.flatMap((week) =>
  week.days.flatMap((day) => day.practices),
);
