type ValidationResult<TFields extends string> =
  | {
      isValid: true;
      errors: Partial<Record<TFields, never>>;
    }
  | {
      isValid: false;
      errors: Partial<Record<TFields, string>>;
    };

type SignupField = "email" | "password" | "nickname";

type SignupForm = {
  email: string;
  password: string;
  nickname: string;
};

function validateSignupForm(
  form: SignupForm,
): ValidationResult<SignupField> {
  const errors: Partial<Record<SignupField, string>> = {};

  if (!form.email.includes("@")) {
    errors.email = "이메일 형식이 올바르지 않습니다.";
  }

  if (form.password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다.";
  }

  if (form.nickname.trim().length === 0) {
    errors.nickname = "닉네임을 입력해야 합니다.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: {},
  };
}

function renderValidationResult<TFields extends string>(
  result: ValidationResult<TFields>,
): string {
  if (result.isValid) {
    return "검증을 통과했습니다.";
  }

  return Object.entries(result.errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join("\n");
}

const invalidResult = validateSignupForm({
  email: "wrong-email",
  password: "1234",
  nickname: "",
});

const validResult = validateSignupForm({
  email: "minkyu@example.com",
  password: "12345678",
  nickname: "Minkyu",
});

console.log(renderValidationResult(invalidResult));
console.log(renderValidationResult(validResult));

// 성공 결과에는 에러 메시지를 넣을 수 없게 만든다.
// const invalidSuccess: ValidationResult<SignupField> = {
//   isValid: true,
//   errors: {
//     email: "성공 상태에서는 에러 메시지를 가질 수 없습니다.",
//   },
// };

/*
직접 풀어보기

문제:
ProfileForm을 검증하는 validateProfileForm 함수를 직접 구현한다.

요구사항:
1. ProfileField는 "displayName" | "bio" | "website"다.
2. displayName이 빈 문자열이면 "이름을 입력해야 합니다." 에러를 넣는다.
3. bio가 100자를 초과하면 "소개는 100자 이하여야 합니다." 에러를 넣는다.
4. website가 비어 있지 않고 https://로 시작하지 않으면 "웹사이트는 https://로 시작해야 합니다." 에러를 넣는다.
5. 반환 타입은 ValidationResult<ProfileField>를 사용한다.
6. 에러가 없으면 { isValid: true, errors: {} }를 반환한다.

힌트:
- errors 객체 타입은 Partial<Record<ProfileField, string>>로 시작한다.
- Object.keys(errors).length로 에러 존재 여부를 확인할 수 있다.

예상 결과:
website: 웹사이트는 https://로 시작해야 합니다.
*/

type ProfileField = "displayName" | "bio" | "website";

type ProfileForm = {
  displayName: string;
  bio: string;
  website: string;
};

function validateProfileForm(
  form: ProfileForm,
): ValidationResult<ProfileField> {
  // TODO: 직접 구현해보기
  
}

const profileResult = validateProfileForm({
  displayName: "Minkyu",
  bio: "프론트엔드 학습 중",
  website: "http://example.com",
});

console.log(renderValidationResult(profileResult));

export {};
