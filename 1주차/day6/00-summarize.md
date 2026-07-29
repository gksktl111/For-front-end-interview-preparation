# Day 6 빠른 복습 정리

## 학습 목표

- 브라우저와 서버 간 요청·응답 구조를 설명한다.
- 쿠키 기반 인증에 필요한 속성을 구분한다.
- Same-Origin Policy와 CORS의 관계를 설명한다.

## 상세 개념 파일

- [HTTP 요청·응답과 API 기본](./01-http-request-response.md)
- [Cookie와 인증 요청](./02-cookie-auth.md)
- [Origin, Same-Origin Policy, CORS](./03-origin-cors.md)
- [Cache 개요](./04-cache-overview.md)
- [XSS와 CSRF 기초](./05-security-xss-csrf.md)

## 1. HTTP 핵심

HTTP는 브라우저와 서버가 요청과 응답을 주고받는 규칙이다.

```text
Request  = Method + URL + Header + Body
Response = Status Code + Header + Body
```

Network 탭에서 먼저 볼 것:

- Request URL: 의도한 서버와 경로로 요청했는가
- Method: `GET`, `POST`, `PATCH`, `DELETE` 등이 의도와 맞는가
- Status: 성공, 인증 실패, 권한 실패, 서버 오류 중 무엇인가
- Payload: 요청 Body가 원하는 형태로 들어갔는가
- Response Headers: `Content-Type`, CORS, Cookie 관련 Header가 있는가

## 2. Method

| 메서드 | 일반적인 의미 |
| --- | --- |
| GET | 리소스 조회 |
| POST | 리소스 생성 또는 처리 요청 |
| PUT | 전체 교체 |
| PATCH | 일부 수정 |
| DELETE | 리소스 삭제 |

멱등성 기준:

- `GET`, `PUT`, `DELETE`는 보통 멱등하게 설계한다.
- `POST`는 보통 멱등하지 않다.
- 중복 클릭, 재시도, 타임아웃을 고려하면 멱등성 설계가 중요하다.

## 3. Status Code

| 상태 코드 | 의미 |
| --- | --- |
| `200 OK` | 요청 성공 |
| `201 Created` | 생성 성공 |
| `204 No Content` | 성공했지만 응답 본문 없음 |
| `400 Bad Request` | 요청 형식이나 값이 잘못됨 |
| `401 Unauthorized` | 인증 필요 또는 인증 정보가 유효하지 않음 |
| `403 Forbidden` | 인증은 되었지만 권한 없음 |
| `404 Not Found` | 리소스를 찾을 수 없음 |
| `409 Conflict` | 현재 서버 상태와 충돌 |
| `422 Unprocessable Content` | 문법은 맞지만 의미상 처리 불가 |
| `500 Internal Server Error` | 서버 내부 오류 |

가장 자주 헷갈리는 구분:

- `401`: 로그인 필요, 세션 만료, 토큰 invalid
- `403`: 로그인은 됐지만 해당 작업 권한 없음

## 4. Header와 Body

`Header`는 부가 정보, `Body`는 실제 데이터다.

```ts
await fetch("/api/clips", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: "clip",
  }),
});
```

핵심:

- JSON Body를 보낼 때는 보통 `Content-Type: application/json`이 필요하다.
- Bearer Token 인증은 보통 `Authorization` Header를 사용한다.
- Cookie 인증은 브라우저가 조건에 맞는 Cookie를 자동으로 전송한다.

## 5. Cookie 인증 핵심

서버는 `Set-Cookie`로 Cookie 저장을 지시한다.

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
```

브라우저는 조건에 맞는 요청에 Cookie를 자동 포함한다.

```http
Cookie: sessionId=abc123
```

주요 속성:

| 속성 | 역할 |
| --- | --- |
| `HttpOnly` | JavaScript에서 Cookie를 읽지 못하게 함 |
| `Secure` | HTTPS에서만 Cookie 전송 |
| `SameSite` | Cross-Site 요청에서 Cookie 전송 범위 제한 |
| Domain | Cookie를 보낼 도메인 범위 |
| Path | Cookie를 보낼 경로 범위 |
| Expires, Max-Age | 만료 시간 |

`HttpOnly`는 XSS 자체를 막지는 않지만, JavaScript로 세션 Cookie가 탈취되는 위험을 줄인다.

## 6. `credentials: "include"`

Cookie 기반 인증 요청에서는 `fetch` 옵션을 확인한다.

```ts
await fetch("/api/users/me", {
  credentials: "include",
});
```

Cross-Origin Cookie 요청 조건:

- 요청에 `credentials: "include"`가 있다.
- 서버가 `Access-Control-Allow-Credentials: true`를 응답한다.
- `Access-Control-Allow-Origin`은 `*`가 아니라 구체적인 Origin이다.
- Cookie의 `SameSite`, `Secure`, Domain, Path 조건이 맞다.

## 7. Origin

Origin은 다음 조합으로 결정된다.

```text
scheme + host + port
```

예:

```text
http://localhost:3000
http://localhost:4000
```

포트가 다르므로 서로 다른 Origin이다.

## 8. CORS

Same-Origin Policy는 브라우저가 다른 Origin의 응답을 JavaScript에서 마음대로 읽지 못하게 제한하는 정책이다.

CORS는 서버가 허용한 Cross-Origin 요청만 브라우저가 응답 접근을 허용하게 하는 방식이다.

핵심:

- CORS는 브라우저가 검사한다.
- 서버는 허용 Header를 응답한다.
- 요청이 서버에 도달해도 브라우저가 응답 접근을 막을 수 있다.
- Postman, 서버 간 요청, 브라우저 요청은 CORS 관점에서 다르다.

대표 Header:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## 9. Preflight

Preflight는 브라우저가 실제 요청 전에 `OPTIONS` 요청으로 서버 허용 여부를 확인하는 절차다.

발생하기 쉬운 조건:

- `PUT`, `PATCH`, `DELETE` 사용
- `Content-Type: application/json` 사용
- `Authorization` Header 사용
- `X-Custom-Header` 같은 커스텀 Header 사용

```ts
await fetch("http://localhost:3001/api/clips", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Custom-Header": "example",
  },
  body: JSON.stringify({
    content: "clip",
  }),
});
```

위 요청은 `OPTIONS` Preflight가 먼저 발생할 수 있다.

## 10. 이번 주에는 개요만 볼 내용

다음 내용은 웹 성능 주차에서 깊게 다룬다.

- 브라우저 캐시
- `Cache-Control`
- ETag
- CDN
- 재검증 전략

지금은 캐시를 "응답을 재사용해 네트워크 비용을 줄이는 장치" 정도로 이해한다.

## 11. XSS와 CSRF 핵심

XSS는 공격자가 웹 페이지에 악성 JavaScript를 실행시키는 공격이다.

주요 대응:

- 사용자 입력을 HTML로 직접 삽입하지 않는다.
- React의 기본 escaping을 우회하는 `dangerouslySetInnerHTML` 사용을 조심한다.
- 외부 HTML을 넣어야 한다면 신뢰할 수 있는 방식으로 sanitize한다.
- 인증 Cookie에는 `HttpOnly`를 사용해 JavaScript 탈취 위험을 줄인다.

CSRF는 사용자가 로그인된 상태를 이용해 공격자가 원치 않는 요청을 보내게 만드는 공격이다.

주요 대응:

- `SameSite` Cookie 설정을 사용한다.
- 상태 변경 요청에 CSRF Token을 검증한다.
- 중요한 변경은 서버에서 Origin 또는 Referer를 검증한다.
- `GET` 요청으로 상태를 변경하지 않는다.

## 코드 실습

### 1. HTTP 요청 확인

DevTools Network 탭에서 확인한다.

- Request URL
- Method
- Status
- Request Header
- Response Header
- Payload
- Timing

### 2. 포트 차이에 따른 Origin 확인

프론트엔드와 백엔드를 서로 다른 포트에서 실행한다.

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

확인할 것:

- 포트만 달라도 Cross-Origin인가
- CORS 오류가 Console에 어떻게 표시되는가
- 서버 응답 Header에 허용 Origin이 있는가

### 3. Preflight 확인

`Content-Type: application/json`과 커스텀 Header를 포함한 요청을 보내고 `OPTIONS` 요청이 먼저 발생하는지 확인한다.

### 4. Cookie 요청 확인

```ts
await fetch("/api/users/me", {
  credentials: "include",
});
```

Network 탭에서 Request Header에 `Cookie`가 실제로 포함됐는지 확인한다.

## 프로젝트 연결 점검

- CORS 허용 Origin 설정
- 프론트와 백엔드 포트 구성
- `credentials`가 빠진 인증 요청
- `401`과 `403`을 동일하게 처리한 코드
- `Content-Type` 없이 JSON Body를 보내는 코드
- HttpOnly Cookie와 클라이언트 저장소의 역할 차이
- 사용자 입력을 그대로 HTML로 렌더링하는 코드
- `GET` 요청으로 삭제나 변경을 수행하는 API

## 면접 직전 체크

- CORS는 누가 검사하는가?
  - 브라우저가 검사한다.
- `401`과 `403`은 어떻게 다른가?
  - `401`은 인증 문제, `403`은 권한 문제다.
- HttpOnly Cookie는 어떤 공격 위험을 줄이는가?
  - XSS로 JavaScript가 세션 Cookie를 탈취하는 위험을 줄인다.
- 포트만 달라도 Cross-Origin인가?
  - 그렇다. Origin은 scheme, host, port 조합이다.
- Preflight는 왜 필요한가?
  - 실제 요청 전에 서버가 Method와 Header를 허용하는지 확인하기 위해 필요하다.
- XSS와 CSRF는 어떻게 다른가?
  - XSS는 악성 스크립트가 페이지에서 실행되는 공격이고, CSRF는 로그인된 사용자의 인증 상태를 이용해 원치 않는 요청을 보내게 하는 공격이다.

## 완료 조건

- [ ] Origin을 scheme, host, port로 설명할 수 있다.
- [ ] Preflight가 필요한 이유를 설명할 수 있다.
- [ ] HttpOnly, Secure, SameSite의 역할을 구분할 수 있다.
- [ ] CORS 오류와 실제 서버 오류를 구분할 수 있다.
- [ ] XSS와 CSRF의 공격 방식과 기본 대응을 구분할 수 있다.
