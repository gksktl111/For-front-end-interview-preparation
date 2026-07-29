# Cookie와 인증 요청

## Cookie란

Cookie는 서버가 브라우저에 저장하도록 지시할 수 있는 작은 데이터다. 인증에서는 서버가 세션 식별자나 인증 관련 값을 Cookie로 내려주고, 브라우저가 이후 요청에 자동으로 포함하는 방식으로 자주 사용한다.

서버 응답 예:

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
```

이후 요청 예:

```http
Cookie: sessionId=abc123
```

중요한 점:

- Cookie는 조건이 맞으면 브라우저가 자동으로 전송한다.
- JavaScript가 직접 Header에 넣지 않아도 된다.
- Domain, Path, SameSite, Secure 조건이 맞지 않으면 전송되지 않는다.
- 인증 실패 시 Cookie가 실제 요청에 포함됐는지 Network 탭에서 확인해야 한다.

## Cookie 주요 속성

| 속성 | 의미 |
| --- | --- |
| `HttpOnly` | JavaScript에서 `document.cookie`로 접근하지 못하게 함 |
| `Secure` | HTTPS 요청에서만 Cookie 전송 |
| `SameSite` | Cross-Site 요청에서 Cookie 전송 범위 제한 |
| Domain | Cookie가 전송될 도메인 범위 |
| Path | Cookie가 전송될 경로 범위 |
| Expires, Max-Age | Cookie 만료 시간 |

## `HttpOnly`

`HttpOnly` Cookie는 JavaScript에서 읽을 수 없다.

```js
console.log(document.cookie);
```

위 코드에서 `HttpOnly` Cookie는 노출되지 않는다.

의미:

- XSS로 JavaScript가 실행되더라도 세션 Cookie를 직접 읽어가기 어렵다.
- XSS 자체를 막는 것은 아니다.
- 공격자가 사용자의 브라우저에서 요청을 보내는 위험까지 완전히 제거하지는 않는다.

면접에서는 "`HttpOnly`는 XSS 자체 방어가 아니라 Cookie 탈취 위험을 줄이는 속성"이라고 구분해서 말해야 한다.

## `Secure`

`Secure` Cookie는 HTTPS 요청에서만 전송된다.

```http
Set-Cookie: sessionId=abc123; Secure
```

주의할 점:

- 운영 환경에서는 인증 Cookie에 `Secure`를 붙이는 것이 일반적이다.
- 로컬 개발 환경이 `http://localhost`이면 운영과 Cookie 동작이 다르게 보일 수 있다.
- `SameSite=None`을 쓰는 Cross-Site Cookie는 보통 `Secure`가 필요하다.

## `SameSite`

`SameSite`는 Cross-Site 요청에서 Cookie를 보낼지 제한한다.

| 값 | 의미 |
| --- | --- |
| `Strict` | 같은 사이트 요청에만 Cookie 전송 |
| `Lax` | 일부 안전한 탐색 요청에는 전송 |
| `None` | Cross-Site 요청에도 전송 가능. 보통 `Secure` 필요 |

프론트엔드와 백엔드가 다른 사이트로 분리되어 있고 Cookie 인증을 사용한다면 `SameSite` 설정이 인증 실패 원인이 될 수 있다.

## Domain과 Path

Domain은 Cookie를 보낼 도메인 범위다.

```http
Set-Cookie: sessionId=abc123; Domain=example.com
```

Path는 Cookie를 보낼 경로 범위다.

```http
Set-Cookie: sessionId=abc123; Path=/api
```

예를 들어 `Path=/api`인 Cookie는 `/api/users/me`에는 포함될 수 있지만 `/settings` 요청에는 포함되지 않을 수 있다.

## 만료 시간

Cookie 만료는 `Expires` 또는 `Max-Age`로 지정한다.

```http
Set-Cookie: sessionId=abc123; Max-Age=3600
Set-Cookie: sessionId=abc123; Expires=Wed, 29 Jul 2026 10:00:00 GMT
```

차이:

- `Max-Age`: 현재 시점부터 몇 초 동안 유지할지 지정한다.
- `Expires`: 특정 만료 시각을 지정한다.

만료된 Cookie는 더 이상 요청에 포함되지 않는다.

## `credentials: "include"`

`fetch`는 Cross-Origin 요청에서 Cookie를 자동으로 포함하지 않는다. Cookie 기반 인증 요청이라면 `credentials` 옵션을 확인해야 한다.

```ts
await fetch("/api/users/me", {
  credentials: "include",
});
```

Cross-Origin Cookie 요청이 성공하려면 보통 다음 조건이 모두 필요하다.

- 프론트 요청에 `credentials: "include"`가 있다.
- 서버 응답에 `Access-Control-Allow-Credentials: true`가 있다.
- 서버 응답의 `Access-Control-Allow-Origin`이 `*`가 아니라 구체적인 Origin이다.
- Cookie의 `SameSite`, `Secure`, Domain, Path 조건이 요청과 맞다.

## Cookie 인증 디버깅

인증 요청이 실패하면 다음을 확인한다.

1. Response Header에 `Set-Cookie`가 내려왔는가
2. 브라우저 Application 탭에 Cookie가 저장됐는가
3. Request Header에 `Cookie`가 포함됐는가
4. `HttpOnly`, `Secure`, `SameSite`, Domain, Path 조건이 맞는가
5. Cross-Origin 요청이라면 `credentials`와 CORS Header가 맞는가
6. 서버가 `401`을 주는지 `403`을 주는지 구분되는가

## 면접 답변 핵심

Cookie 기반 인증은 서버가 `Set-Cookie`로 인증 정보를 저장하게 하고, 브라우저가 조건에 맞는 요청에 Cookie를 자동 전송하는 방식이다. `HttpOnly`는 JavaScript의 Cookie 접근을 막아 탈취 위험을 줄이고, `Secure`는 HTTPS에서만 전송되게 하며, `SameSite`는 Cross-Site 요청에서 Cookie 전송 범위를 제한한다. Cross-Origin Cookie 요청에서는 `credentials: "include"`와 서버 CORS 설정을 함께 확인해야 한다.
