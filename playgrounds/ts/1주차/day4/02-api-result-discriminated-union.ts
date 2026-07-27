type ApiResult<T> =
  | {
      status: "success";
      data: T;
    }
  | {
      status: "error";
      error: {
        code: string;
        message: string;
      };
    };

type Clip = {
  id: string;
  title: string;
};

function renderApiResult(result: ApiResult<Clip[]>): string {
  if (result.status === "success") {
    return `클립 ${result.data.length}개를 불러왔습니다.`;
  }

  return `[${result.error.code}] ${result.error.message}`;
}

const successResult: ApiResult<Clip[]> = {
  status: "success",
  data: [
    { id: "clip-1", title: "TypeScript" },
    { id: "clip-2", title: "Discriminated Union" },
  ],
};

const errorResult: ApiResult<Clip[]> = {
  status: "error",
  error: {
    code: "NETWORK_ERROR",
    message: "네트워크 요청에 실패했습니다.",
  },
};

console.log(renderApiResult(successResult));
console.log(renderApiResult(errorResult));

// status로 좁히기 전에는 data나 error에 안전하게 접근할 수 없다.
// function unsafe(result: ApiResult<Clip[]>) {
//   return result.data.length;
// }

/*
직접 풀어보기

문제:
User 목록 조회 결과를 ApiResult<User[]>로 만들고 renderUserResult 함수를 직접 구현한다.

요구사항:
1. 성공이면 "사용자 n명" 형식의 문자열을 반환한다.
2. 실패이면 "[에러코드] 에러메시지" 형식의 문자열을 반환한다.
3. status로 타입을 좁힌 뒤 data 또는 error에 접근한다.

힌트:
- ApiResult<T> 타입을 그대로 재사용한다.
- result.status === "success" 조건 안에서만 result.data에 접근한다.

예상 결과:
사용자 2명
[AUTH_REQUIRED] 로그인이 필요합니다.
*/

type User = {
  id: string;
  name: string;
};

function renderUserResult(result: ApiResult<User[]>): string {
  // TODO: 직접 구현해보기

  if(result.status === 'success'){
    return `사용자 ${result.data.length}명`
  }
    
  return `[${result.error.code}] ${result.error.message}`
}

const userSuccessResult: ApiResult<User[]> = {
  status: "success",
  data: [
    { id: "user-1", name: "Minkyu" },
    { id: "user-2", name: "TypeScript" },
  ],
};

const userErrorResult: ApiResult<User[]> = {
  status: "error",
  error: {
    code: "AUTH_REQUIRED",
    message: "로그인이 필요합니다.",
  },
};

console.log(renderUserResult(userSuccessResult));
console.log(renderUserResult(userErrorResult));

export {};
