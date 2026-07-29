# HTTP 요청·응답과 API 기본

## HTTP의 역할

HTTP는 클라이언트와 서버가 요청과 응답을 주고받기 위한 프로토콜이다. 프론트엔드에서는 브라우저가 클라이언트 역할을 하고, API 서버가 요청을 받아 처리한 뒤 응답을 돌려준다.

```text
Browser
  └─ Request: Method + URL + Header + Body
       ↓
Server
  └─ Response: Status Code + Header + Body
       ↓
Browser
```

프론트엔드 개발자는 API가 실패했을 때 단순히 "안 된다"가 아니라 다음 정보를 보고 원인을 좁혀야 한다.

- 어떤 URL로 요청했는가
- 어떤 Method를 사용했는가
- 요청 Header와 Body가 서버가 기대한 형태인가
- 서버가 어떤 Status Code를 응답했는가
- 브라우저가 응답을 막은 것인지, 서버가 오류를 낸 것인지

## URL 구조

URL은 요청 대상의 위치와 조건을 표현한다.

```text
https://api.example.com:443/clips?page=1&keyword=react#top
└───┘   └─────────────┘ └─┘ └────┘ └──────────────────┘ └─┘
scheme       host       port  path        query        fragment
```

| 구성 | 의미 |
| --- | --- |
| scheme | 통신 방식. `http`, `https` 등 |
| host | 서버 도메인 또는 IP |
| port | 서버 프로세스가 요청을 받는 번호 |
| path | 서버 안의 리소스 경로 |
| query | 조회 조건이나 필터 |
| fragment | 문서 안의 위치. 서버 요청에는 보통 포함되지 않음 |

실무에서는 환경 변수나 프록시 설정 때문에 예상과 다른 URL로 요청하는 일이 많다. Network 탭에서 Request URL을 먼저 확인하는 습관이 필요하다.

## Method

HTTP Method는 요청의 일반적인 의도를 표현한다.

| 메서드 | 일반적인 의미 |
| --- | --- |
| GET | 리소스 조회 |
| POST | 리소스 생성 또는 처리 요청 |
| PUT | 전체 교체 |
| PATCH | 일부 수정 |
| DELETE | 리소스 삭제 |

예:

```http
GET /api/clips
POST /api/clips
PUT /api/clips/123
PATCH /api/clips/123
DELETE /api/clips/123
```

주의할 점:

- Method 이름만으로 보안이 보장되지는 않는다.
- 실제 동작은 서버 구현이 결정한다.
- API 설계에서는 Method와 URL이 함께 의미를 만든다.
- 프론트엔드는 Method별 성공/실패 처리를 명확히 나눠야 한다.

## Status Code

Status Code는 서버가 요청을 어떻게 처리했는지 알려준다.

| 상태 코드 | 의미 |
| --- | --- |
| `200 OK` | 요청 성공 |
| `201 Created` | 리소스 생성 성공 |
| `204 No Content` | 성공했지만 응답 본문 없음 |
| `400 Bad Request` | 요청 형식이나 값이 잘못됨 |
| `401 Unauthorized` | 인증 필요 또는 인증 정보가 유효하지 않음 |
| `403 Forbidden` | 인증은 되었지만 권한 없음 |
| `404 Not Found` | 요청한 리소스를 찾을 수 없음 |
| `409 Conflict` | 현재 서버 상태와 충돌 |
| `422 Unprocessable Content` | 문법은 맞지만 의미상 처리할 수 없음 |
| `500 Internal Server Error` | 서버 내부 오류 |

`401`과 `403`은 구분해서 처리해야 한다.

- `401`: 로그인하지 않았거나 인증 정보가 만료됐다.
- `403`: 사용자는 식별됐지만 해당 리소스에 접근할 권한이 없다.

프론트엔드 처리 예:

- `401`: 로그인 페이지 이동, 세션 만료 안내
- `403`: 권한 없음 화면 표시
- `404`: 없는 리소스 화면 표시
- `500`: 재시도 또는 장애 안내

## Header와 Body

Header는 요청이나 응답에 대한 부가 정보다. Body는 실제로 주고받는 데이터다.

Request Header 예:

```http
Content-Type: application/json
Authorization: Bearer access-token
```

Response Header 예:

```http
Content-Type: application/json
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax
```

JSON 요청 예:

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

`Content-Type: application/json`이 없으면 서버가 Body를 JSON으로 파싱하지 못할 수 있다.

## `Authorization`

`Authorization` Header는 인증 정보를 명시적으로 전달할 때 사용한다.

```http
Authorization: Bearer access-token
```

Cookie 인증과 Bearer Token 인증의 차이:

| 방식 | 인증 정보 전달 |
| --- | --- |
| Cookie 기반 인증 | 브라우저가 조건에 맞는 Cookie를 자동 전송 |
| Bearer Token 인증 | JavaScript가 `Authorization` Header에 토큰을 직접 포함 |

둘은 저장 위치, 전송 방식, XSS/CSRF 대응 방식이 다르므로 프로젝트 인증 전략에 맞춰 일관되게 사용해야 한다.

## 멱등성 기초

멱등성은 같은 요청을 여러 번 보내도 서버 상태가 한 번 보낸 것과 같게 유지되는 성질이다.

| 메서드 | 멱등성 관점 |
| --- | --- |
| GET | 보통 멱등. 조회만 해야 함 |
| PUT | 보통 멱등. 같은 값으로 전체 교체 |
| DELETE | 보통 멱등하게 설계 가능 |
| POST | 보통 멱등하지 않음. 매번 생성이나 처리 발생 가능 |
| PATCH | 구현에 따라 다름 |

예:

- `GET /api/clips/1`을 여러 번 호출해도 서버 상태는 바뀌지 않아야 한다.
- `PUT /api/profile`에 같은 값을 여러 번 보내면 최종 상태는 같아야 한다.
- `POST /api/orders`를 여러 번 보내면 주문이 여러 개 생길 수 있다.

실무에서는 네트워크 재시도, 중복 클릭, 요청 타임아웃 때문에 멱등성을 고려해야 한다.

## DevTools Network 확인 순서

API 요청이 실패하면 다음 순서로 확인한다.

1. Request URL이 맞는가
2. Method가 맞는가
3. Status Code가 무엇인가
4. Request Header에 필요한 값이 있는가
5. Payload가 서버 스펙과 맞는가
6. Response Header와 Body가 무엇인가
7. CORS 오류인지 실제 서버 오류인지 구분되는가

## 면접 답변 핵심

HTTP 요청은 Method, URL, Header, Body로 구성되고 응답은 Status Code, Header, Body로 구성된다. 프론트엔드에서는 Network 탭에서 실제 요청 URL, Method, Status Code, Header, Payload를 확인해 API 실패 원인을 좁힐 수 있어야 한다. 특히 `401`은 인증 문제, `403`은 권한 문제로 구분해서 처리해야 한다.
