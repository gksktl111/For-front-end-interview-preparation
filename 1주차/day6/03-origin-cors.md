# Origin, Same-Origin Policy, CORS

## Origin

Origin은 다음 세 가지 조합으로 결정된다.

```text
scheme + host + port
```

예:

```text
http://localhost:3000
http://localhost:4000
```

포트가 다르므로 서로 다른 Origin이다.

비교 예:

| A | B | 같은 Origin인가 |
| --- | --- | --- |
| `http://localhost:3000` | `http://localhost:3000` | 예 |
| `http://localhost:3000` | `http://localhost:4000` | 아니오. port 다름 |
| `http://localhost:3000` | `https://localhost:3000` | 아니오. scheme 다름 |
| `https://app.example.com` | `https://api.example.com` | 아니오. host 다름 |

Origin은 CORS, Cookie, 브라우저 보안 정책을 이해할 때 기준점이 된다.

## Same-Origin Policy

Same-Origin Policy는 브라우저가 다른 Origin의 응답을 JavaScript에서 마음대로 읽지 못하게 제한하는 보안 정책이다.

중요한 점:

- 요청 자체가 서버에 도달할 수는 있다.
- 브라우저가 응답을 프론트엔드 JavaScript에 노출할지 검사한다.
- 서버 간 요청이나 Postman 요청은 브라우저의 CORS 검사와 다르다.

예를 들어 프론트엔드가 `http://localhost:3000`에서 실행되고 API 서버가 `http://localhost:3001`이면 포트가 다르므로 Cross-Origin 요청이다.

## CORS

CORS는 Cross-Origin Resource Sharing의 약자다. 서버가 특정 Cross-Origin 요청을 허용하겠다는 응답 Header를 보내면 브라우저가 응답 접근을 허용한다.

대표 Header:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

각 Header의 의미:

| Header | 의미 |
| --- | --- |
| `Access-Control-Allow-Origin` | 응답 접근을 허용할 Origin |
| `Access-Control-Allow-Methods` | 허용할 HTTP Method |
| `Access-Control-Allow-Headers` | 허용할 Request Header |
| `Access-Control-Allow-Credentials` | 자격 증명 포함 요청 허용 여부 |

CORS 오류는 서버가 무조건 실패했다는 뜻이 아니다. 서버는 응답했지만 브라우저가 응답 접근을 막은 상황일 수 있다.

## Simple Request

Simple Request는 Preflight 없이 바로 전송될 수 있는 Cross-Origin 요청이다. 조건이 제한적이기 때문에 실무의 JSON API 요청은 Simple Request가 아닌 경우가 많다.

대표 조건:

- Method가 `GET`, `HEAD`, `POST` 중 하나다.
- 허용된 일부 Header만 사용한다.
- `Content-Type`이 제한된 값 중 하나다.

JSON API에서 흔한 `Content-Type: application/json`은 Preflight를 유발할 수 있다.

## Preflight

Preflight는 브라우저가 실제 요청 전에 `OPTIONS` 요청으로 서버 허용 여부를 확인하는 절차다.

Preflight가 발생하기 쉬운 경우:

- `PUT`, `PATCH`, `DELETE` 같은 Method 사용
- `Content-Type: application/json` 사용
- `Authorization` Header 사용
- `X-Custom-Header` 같은 커스텀 Header 사용

Preflight 요청 예:

```http
OPTIONS /api/clips
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,x-custom-header
```

서버 응답 예:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Custom-Header
```

서버가 허용하지 않으면 브라우저는 실제 요청을 보내지 않거나 응답 접근을 막는다.

## 자격 증명 포함 요청

Cookie 같은 자격 증명을 포함하는 Cross-Origin 요청은 조건이 더 엄격하다.

프론트 요청:

```ts
await fetch("http://localhost:3001/api/users/me", {
  credentials: "include",
});
```

서버 응답:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

주의할 점:

- 자격 증명 포함 요청에서 `Access-Control-Allow-Origin: *`는 사용할 수 없다.
- 반드시 구체적인 Origin을 응답해야 한다.
- Cookie의 `SameSite`, `Secure`, Domain, Path 조건도 함께 맞아야 한다.

## CORS 디버깅

CORS 오류가 나면 다음을 확인한다.

1. 프론트 Origin이 무엇인가
2. API 서버 Origin이 무엇인가
3. 서버 응답의 `Access-Control-Allow-Origin`이 프론트 Origin과 일치하는가
4. 실제 요청 전에 `OPTIONS` 요청이 실패했는가
5. 요청 Header가 서버의 `Access-Control-Allow-Headers`에 포함되어 있는가
6. Cookie 요청이라면 `credentials`와 `Access-Control-Allow-Credentials`가 맞는가
7. Console 오류와 Network 탭의 실제 Status Code가 일치하는가

## 면접 답변 핵심

Origin은 scheme, host, port 조합으로 결정된다. Same-Origin Policy는 브라우저가 다른 Origin의 응답을 JavaScript에 함부로 노출하지 않도록 제한하는 정책이고, CORS는 서버가 허용 Header를 통해 특정 Cross-Origin 요청을 허용하는 방식이다. CORS 검사는 서버가 아니라 브라우저가 수행하며, Preflight는 실제 요청 전에 Method와 Header 허용 여부를 확인하는 `OPTIONS` 요청이다.
