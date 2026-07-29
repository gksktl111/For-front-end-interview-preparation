# Day 6 Interview Practice

면접 질문을 보고 바로 아래 `내 답변` 칸에 스스로 답변을 적는 용도입니다.

---

## 1. HTTP 요청과 응답은 어떤 요소로 구성되는가?

### 내 답변
- HTTP 요청은 Method, URL, Header, Body로 구성된다. Method는 요청 의도를 나타내고, URL은 요청 대상 리소스를 가리키며, Header는 인증 정보나 Content-Type 같은 부가 정보를 담고, Body는 서버에 보낼 실제 데이터를 담는다. 응답은 Status Code, Header, Body로 구성되며 Status Code로 요청 처리 결과를 알 수 있다.

### 체크 포인트

- Request: Method, URL, Header, Body
- Response: Status Code, Header, Body
- Header는 부가 정보
- Body는 실제 데이터
- Network 탭으로 실제 요청과 응답을 확인할 수 있다는 점

---

## 2. `GET`, `POST`, `PUT`, `PATCH`, `DELETE`는 어떻게 구분하는가?

### 내 답변
- `GET`은 리소스 조회, `POST`는 생성 또는 처리 요청, `PUT`은 전체 교체, `PATCH`는 일부 수정, `DELETE`는 리소스 삭제에 사용한다. 실제 동작은 서버 구현이 결정하지만, API 설계에서는 Method와 URL이 요청 의도를 명확히 표현해야 한다.

### 체크 포인트

- `GET`은 조회
- `POST`는 생성 또는 처리
- `PUT`은 전체 교체
- `PATCH`는 일부 수정
- `DELETE`는 삭제
- Method 이름만으로 보안이 보장되지는 않는다는 점

---

## 3. 멱등성이란 무엇인가?

### 내 답변
- 멱등성은 같은 요청을 여러 번 보내도 서버 상태가 한 번 보낸 것과 같게 유지되는 성질이다. `GET`은 조회만 한다면 멱등하고, `PUT`은 같은 값으로 전체 교체하므로 보통 멱등하게 설계된다. 반면 `POST`는 호출할 때마다 리소스가 새로 생성될 수 있어 보통 멱등하지 않다. 네트워크 재시도나 중복 클릭을 고려하면 멱등성은 중요하다.

### 체크 포인트

- 같은 요청 반복 시 최종 서버 상태가 같은가
- `GET`, `PUT`, `DELETE`는 보통 멱등하게 설계
- `POST`는 보통 멱등하지 않음
- 재시도와 중복 요청 처리에 중요

---

## 4. `401`과 `403`은 어떻게 다른가?

### 내 답변
- `401`은 인증이 필요하거나 인증 정보가 유효하지 않은 상태다. 예를 들어 로그인하지 않았거나 세션이 만료된 경우다. `403`은 인증은 되었지만 해당 리소스나 작업에 접근할 권한이 없는 상태다. 프론트엔드에서는 `401`은 로그인 이동이나 세션 만료 처리, `403`은 권한 없음 화면으로 구분하는 것이 좋다.

### 체크 포인트

- `401`은 인증 문제
- `403`은 권한 문제
- 로그인 여부와 접근 권한을 구분
- 프론트엔드 처리도 다르게 가져갈 수 있다는 점

---

## 5. `Content-Type` Header는 왜 필요한가?

### 내 답변
- `Content-Type`은 요청이나 응답 Body의 형식을 알려주는 Header다. 프론트엔드에서 JSON Body를 보낼 때 `Content-Type: application/json`을 지정하면 서버가 Body를 JSON으로 파싱할 수 있다. 이 Header가 빠지면 서버가 요청 본문을 기대한 형식으로 처리하지 못할 수 있다.

### 체크 포인트

- Body 형식을 알려주는 Header
- JSON 요청에는 보통 `application/json`
- 서버 Body 파싱과 관련
- Response의 `Content-Type`도 브라우저 해석에 영향

---

## 6. Cookie 기반 인증은 어떻게 동작하는가?

### 내 답변
- 서버가 로그인 응답에서 `Set-Cookie` Header로 Cookie 저장을 지시하면 브라우저는 Cookie를 저장한다. 이후 조건에 맞는 요청에는 브라우저가 Cookie를 자동으로 포함한다. 그래서 Cookie 기반 인증에서는 Cookie가 저장됐는지, 요청에 실제로 포함됐는지, `SameSite`, `Secure`, Domain, Path 조건이 맞는지 확인해야 한다.

### 체크 포인트

- 서버가 `Set-Cookie`로 저장 지시
- 브라우저가 조건에 맞는 요청에 자동 전송
- `Cookie` Request Header 확인
- Cookie 속성 조건 확인

---

## 7. `HttpOnly`, `Secure`, `SameSite`는 각각 어떤 역할을 하는가?

### 내 답변
- `HttpOnly`는 JavaScript에서 Cookie를 읽지 못하게 해서 XSS로 세션 Cookie가 탈취되는 위험을 줄인다. `Secure`는 HTTPS 요청에서만 Cookie가 전송되게 한다. `SameSite`는 Cross-Site 요청에서 Cookie 전송 범위를 제한해 인증 Cookie가 의도치 않은 요청에 포함되는 것을 줄인다.

### 체크 포인트

- `HttpOnly`: JavaScript 접근 차단
- `Secure`: HTTPS에서만 전송
- `SameSite`: Cross-Site Cookie 전송 제한
- `HttpOnly`는 XSS 자체를 막는 속성이 아니라는 점

---

## 8. `credentials: "include"`는 언제 필요한가?

### 내 답변
- `fetch`로 Cookie 기반 인증 요청을 보낼 때, 특히 Cross-Origin 요청에서 Cookie를 포함하려면 `credentials: "include"`가 필요하다. 이 옵션만으로 충분한 것은 아니고 서버도 `Access-Control-Allow-Credentials: true`를 응답해야 하며, `Access-Control-Allow-Origin`은 `*`가 아니라 구체적인 Origin이어야 한다.

### 체크 포인트

- Cookie 포함 요청에 필요
- Cross-Origin에서는 특히 중요
- 서버의 `Access-Control-Allow-Credentials` 필요
- `Access-Control-Allow-Origin: *`와 함께 쓸 수 없다는 점

---

## 9. Origin은 무엇으로 결정되는가?

### 내 답변
- Origin은 scheme, host, port 조합으로 결정된다. 따라서 `http://localhost:3000`과 `http://localhost:4000`은 host는 같지만 port가 다르므로 서로 다른 Origin이다. scheme이 `http`와 `https`로 달라도 다른 Origin이고, subdomain이 달라도 host가 다르므로 다른 Origin이다.

### 체크 포인트

- scheme
- host
- port
- 포트만 달라도 Cross-Origin
- subdomain이 달라도 다른 Origin

---

## 10. CORS는 누가 검사하는가?

### 내 답변
- CORS는 브라우저가 검사한다. 서버는 `Access-Control-Allow-Origin` 같은 허용 Header를 응답하고, 브라우저가 그 Header를 보고 프론트엔드 JavaScript에 응답을 노출할지 결정한다. 그래서 서버가 응답을 보냈더라도 브라우저가 CORS 정책에 맞지 않다고 판단하면 JavaScript에서는 응답을 읽지 못할 수 있다.

### 체크 포인트

- 검사 주체는 브라우저
- 서버는 허용 Header 응답
- 요청이 서버에 도달할 수는 있음
- 응답 접근을 브라우저가 막을 수 있음
- Postman과 브라우저 요청은 다르다는 점

---

## 11. Preflight는 무엇이고 왜 필요한가?

### 내 답변
- Preflight는 브라우저가 실제 Cross-Origin 요청을 보내기 전에 `OPTIONS` 요청으로 서버가 해당 Method와 Header를 허용하는지 확인하는 절차다. `Content-Type: application/json`, `Authorization`, 커스텀 Header, `PATCH`나 `DELETE` 같은 Method를 사용하면 Preflight가 발생할 수 있다.

### 체크 포인트

- 실제 요청 전 `OPTIONS` 요청
- Method와 Header 허용 여부 확인
- 브라우저가 수행
- JSON 요청, Authorization, 커스텀 Header에서 자주 발생

---

## 12. CORS 오류와 실제 서버 오류는 어떻게 구분하는가?

### 내 답변
- CORS 오류는 서버가 응답했더라도 브라우저가 응답 접근을 막은 상황일 수 있다. 따라서 Console 메시지만 보지 말고 Network 탭에서 실제 요청이 나갔는지, Status Code가 무엇인지, Preflight가 실패했는지, Response Header에 `Access-Control-Allow-Origin`이 있는지 확인해야 한다. 실제 서버 오류라면 보통 `4xx`나 `5xx` Status Code와 서버 응답 Body가 확인된다.

### 체크 포인트

- Console CORS 메시지 확인
- Network 탭 Status Code 확인
- Preflight 실패 여부 확인
- CORS 응답 Header 확인
- 서버 오류와 브라우저 차단을 구분

---

## 13. 브라우저 캐시는 왜 사용하는가?

### 내 답변
- 브라우저 캐시는 이미 받은 응답을 재사용해 같은 리소스를 매번 네트워크로 다시 다운로드하지 않도록 한다. 이를 통해 로딩 속도와 네트워크 비용을 줄일 수 있다. 캐시 정책은 `Cache-Control` 같은 Header로 제어하고, ETag는 응답 버전을 비교해 재검증할 때 사용할 수 있다.

### 체크 포인트

- 응답 재사용
- 네트워크 비용 감소
- `Cache-Control`
- ETag와 재검증
- 성능 주차에서 더 깊게 다룰 내용이라는 점

---

## 14. XSS와 CSRF는 어떻게 다른가?

### 내 답변
- XSS는 공격자가 웹 페이지에서 악성 JavaScript를 실행시키는 공격이고, CSRF는 로그인된 사용자의 인증 상태를 이용해 원치 않는 요청을 보내게 하는 공격이다. XSS는 사용자 입력을 실행 가능한 HTML이나 스크립트로 렌더링할 때 발생할 수 있고, CSRF는 Cookie가 자동 전송되는 특성과 상태 변경 요청 검증 부족이 결합될 때 위험해진다.

### 체크 포인트

- XSS는 악성 스크립트 실행
- CSRF는 인증된 사용자의 요청 위조
- XSS는 입력/출력 처리와 관련
- CSRF는 Cookie 자동 전송과 관련
- 공격 방식과 대응 방식이 다르다는 점

---

## 15. XSS를 줄이기 위한 프론트엔드 대응은 무엇인가?

### 내 답변
- 사용자 입력을 HTML로 직접 삽입하지 않고, React의 기본 escaping을 우회하는 `dangerouslySetInnerHTML` 사용을 최소화해야 한다. 외부 Markdown이나 HTML을 렌더링해야 한다면 sanitize가 필요하다. 또한 CSP로 실행 가능한 스크립트 범위를 제한하고, 인증 Cookie에는 `HttpOnly`를 적용해 JavaScript로 세션 Cookie가 탈취되는 위험을 줄일 수 있다.

### 체크 포인트

- 사용자 입력 직접 HTML 삽입 금지
- `dangerouslySetInnerHTML` 주의
- sanitize
- CSP
- `HttpOnly`는 Cookie 탈취 위험 완화

---

## 16. CSRF를 줄이기 위한 대응은 무엇인가?

### 내 답변
- Cookie 기반 인증에서는 브라우저가 Cookie를 자동 전송하기 때문에 CSRF 위험을 고려해야 한다. `SameSite` Cookie를 설정하고, 상태 변경 요청에는 CSRF Token을 검증하며, 서버에서 `Origin` 또는 `Referer` Header를 확인할 수 있다. 또한 생성, 수정, 삭제 같은 상태 변경은 `GET` 요청으로 처리하지 않아야 한다.

### 체크 포인트

- `SameSite` Cookie
- CSRF Token
- `Origin` 또는 `Referer` 검증
- 상태 변경을 `GET`으로 처리하지 않음
- Cookie 기반 인증에서 특히 중요
