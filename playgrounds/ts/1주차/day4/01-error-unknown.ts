function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

function getErrorMessageWithAny(error: any): string {
  return error.message;
}

const errors: unknown[] = [
  new Error("요청에 실패했습니다."),
  "문자열 에러",
  { message: "객체 형태의 에러" },
  null,
];

for (const error of errors) {
  console.log(getErrorMessage(error));
}

// any는 아래 코드처럼 위험한 접근을 허용한다.
try {
  console.log(getErrorMessageWithAny(null));
} catch (error) {
  console.log(getErrorMessage(error)); // 런타임 오류도 unknown으로 안전하게 처리한다.
}

// unknown은 좁히기 전에는 직접 사용할 수 없다.
// function unsafe(error: unknown) {
//   return error.message;
// }

/*
직접 풀어보기

문제:
getErrorMessageSafely 함수를 직접 구현한다.

요구사항:
1. Error 인스턴스면 message를 반환한다.
2. 문자열이면 그대로 반환한다.
3. { message: string } 형태의 객체면 message를 반환한다.
4. 그 외 값은 "알 수 없는 오류가 발생했습니다."를 반환한다.

힌트:
- 매개변수 타입은 any가 아니라 unknown으로 둔다.
- 객체 확인은 typeof value === "object" && value !== null 형태로 시작한다.
- "message" in value로 프로퍼티 존재 여부를 확인할 수 있다.

예상 결과:
["서버 오류", "문자열 오류", "객체 오류", "알 수 없는 오류가 발생했습니다."]
*/


function getErrorMessageSafely(error: unknown): string {
  // TODO: 직접 구현해보기

  // 객체의 에러 처리
  if(
    error !== null && 
    typeof error === "object" && 
    "message" in error && 
    typeof error.message === "string" 
  ){
    return error.message
  }else if(typeof error === 'string'){
    return error
  }

  return "알 수 없는 오류가 발생했습니다."
}

const practiceErrors: unknown[] = [
  new Error("서버 오류"),
  "문자열 오류",
  { message: "객체 오류" },
  404,
];

console.log(practiceErrors.map(getErrorMessageSafely));

export {};
