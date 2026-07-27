type BadAsyncState<T> = {
  isLoading: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
};

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

type Clip = {
  id: string;
  title: string;
};

function renderBadState(state: BadAsyncState<Clip[]>): string {
  if (state.isLoading) {
    return '불러오는 중입니다.';
  }

  if (state.isError) {
    return state.error?.message ?? '알 수 없는 오류';
  }

  return `${state.data?.length ?? 0}개 클립`;
}

function renderState(state: AsyncState<Clip[]>): string {
  switch (state.status) {
    case 'idle':
      return '대기 중입니다.';
    case 'loading':
      return '불러오는 중입니다.';
    case 'success':
      return `${state.data.length}개 클립`;
    case 'error':
      return state.error.message;
  }
}

const impossibleBadState: BadAsyncState<Clip[]> = {
  isLoading: true,
  isError: true,
  data: [{ id: 'clip-1', title: '잘못된 상태' }],
  error: new Error('실패도 동시에 존재합니다.'),
};

const safeState: AsyncState<Clip[]> = {
  status: 'success',
  data: [{ id: 'clip-1', title: '안전한 상태' }],
};

console.log(renderBadState(impossibleBadState));
console.log(renderState(safeState));

// 개선 형태에서는 성공 상태와 에러 상태를 동시에 표현할 수 없다.
// const impossibleSafeState: AsyncState<Clip[]> = {
//   status: "success",
//   data: [],
//   error: new Error("불가능한 상태"),
// };

/*
직접 풀어보기

문제:
AsyncState<string[]>을 받아 화면에 보여줄 문구를 반환하는 renderTagsState 함수를 직접 구현한다.

요구사항:
1. idle이면 "태그를 불러오기 전입니다."를 반환한다.
2. loading이면 "태그를 불러오는 중입니다."를 반환한다.
3. success이면 "태그: react, typescript"처럼 data를 join해서 반환한다.
4. error이면 error.message를 반환한다.
5. status로 분기해서 각 상태에서 필요한 값만 접근한다.

힌트:
- switch (state.status)를 사용한다.
- success 분기에서만 state.data를 사용할 수 있다.
- error 분기에서만 state.error를 사용할 수 있다.

예상 결과:
태그: react, typescript
*/

function renderTagsState(state: AsyncState<string[]>): string {
  // TODO: 직접 구현해보기
  switch (state.status) {
    case 'idle':
      return '태그를 불러오기 전입니다.';
    case 'loading':
      return '태그를 불러오는 중입니다.';
    case 'success':
      return `태그: ${state.data.join(', ')}`;
    case 'error':
      return state.error.message
  }
}

const tagsIdleState: AsyncState<string[]> = {
  status: 'idle',
};

const tagsLoadingState: AsyncState<string[]> = {
  status: 'loading',
};

const tagsSuccessState: AsyncState<string[]> = {
  status: 'success',
  data: ['react', 'typescript'],
};

const tagsErrorState: AsyncState<string[]> = {
  status: 'error',
  error: new Error('태그를 불러오지 못했습니다.'),
};

console.log(renderTagsState(tagsIdleState));
console.log(renderTagsState(tagsLoadingState));
console.log(renderTagsState(tagsSuccessState));
console.log(renderTagsState(tagsErrorState));

export {};
