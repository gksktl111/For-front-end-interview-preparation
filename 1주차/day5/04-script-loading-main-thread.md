# 스크립트 로딩과 Main Thread

## HTML 파서와 JavaScript

브라우저는 HTML을 위에서 아래로 파싱한다. 파싱 중 일반 `<script>`를 만나면 HTML 파싱을 멈추고 스크립트를 다운로드하고 실행한다.

```html
<head>
  <script src="/main.js"></script>
</head>
```

이 동작이 필요한 이유는 JavaScript가 DOM을 변경할 수 있기 때문이다.

```js
document.write("<h1>변경된 제목</h1>");
```

브라우저 입장에서는 스크립트 실행 결과에 따라 뒤의 HTML 구조가 달라질 수 있으므로, 일반 script를 만나면 파싱을 잠시 멈춘다.

## 일반 `<script>`

```html
<script src="/main.js"></script>
```

특징:

- HTML 파싱을 중단한다.
- 스크립트 다운로드와 실행이 끝난 뒤 파싱을 재개한다.
- DOM이 아직 끝까지 만들어지기 전에 실행될 수 있다.
- head에 큰 스크립트가 있으면 초기 화면 표시가 늦어질 수 있다.

적합한 경우는 많지 않다. 꼭 먼저 실행되어야 하는 매우 작은 스크립트가 아니라면 `defer`를 우선 검토한다.

## `defer`

```html
<script defer src="/main.js"></script>
```

특징:

- HTML 파싱을 막지 않고 다운로드한다.
- DOM 파싱이 끝난 뒤 실행된다.
- 여러 defer 스크립트는 문서에 선언된 순서대로 실행된다.
- `DOMContentLoaded` 전에 실행된다.

적합한 경우:

- DOM 요소를 찾거나 이벤트를 연결하는 앱 코드
- 실행 순서가 중요한 여러 스크립트
- 대부분의 일반 애플리케이션 스크립트

## `async`

```html
<script async src="/analytics.js"></script>
```

특징:

- HTML 파싱을 막지 않고 다운로드한다.
- 다운로드가 끝나면 즉시 실행된다.
- 실행되는 순간에는 HTML 파싱이 잠시 멈출 수 있다.
- 여러 async 스크립트의 실행 순서는 보장되지 않는다.

적합한 경우:

- 다른 스크립트와 의존성이 없는 분석 코드
- 광고, 추적, 위젯처럼 독립적으로 실행되는 코드
- 실행 순서가 중요하지 않은 외부 스크립트

DOM에 의존하거나 다른 스크립트보다 뒤에 실행되어야 한다면 `async`는 위험할 수 있다.

## 비교 표

| 방식 | 다운로드 중 HTML 파싱 | 실행 시점 | 실행 순서 |
| --- | --- | --- | --- |
| 일반 `script` | 중단됨 | 다운로드 직후 즉시 | 선언 순서 |
| `defer` | 계속됨 | DOM 파싱 완료 후 | 선언 순서 |
| `async` | 계속됨 | 다운로드 완료 즉시 | 보장 안 됨 |

## Render-blocking CSS

CSS는 렌더링을 막을 수 있다. 브라우저는 CSSOM 없이 정확한 스타일을 알 수 없기 때문이다.

```html
<link rel="stylesheet" href="/styles.css" />
```

CSS가 늦게 도착하면 브라우저는 스타일이 없는 화면을 먼저 보여주기보다 렌더링을 기다릴 수 있다.

중요한 점:

- CSSOM 생성이 늦어지면 Render Tree 생성도 늦어진다.
- head의 큰 CSS 파일은 초기 렌더링을 지연시킬 수 있다.
- 사용하지 않는 CSS가 많으면 스타일 계산 비용이 늘어난다.

개선 방향:

- 초기 화면에 필요한 CSS를 작게 유지한다.
- 사용하지 않는 CSS를 제거한다.
- 미디어 조건이 있는 CSS는 `media` 속성으로 범위를 명확히 한다.

```html
<link rel="stylesheet" href="/print.css" media="print" />
```

## JavaScript와 CSS의 상호작용

JavaScript가 스타일 정보를 읽는 경우 CSSOM이 필요하다.

```js
const color = getComputedStyle(document.body).color;
```

브라우저는 정확한 값을 반환하기 위해 CSS 파싱과 스타일 계산을 마쳐야 한다. 따라서 스크립트와 CSS의 위치, 로딩 방식은 초기 렌더링 성능에 영향을 준다.

## Main Thread

Main Thread는 브라우저에서 많은 핵심 작업을 처리한다.

주요 작업:

- JavaScript 실행
- 이벤트 핸들러 실행
- 스타일 계산
- Layout
- Paint 준비
- 사용자 입력 처리

Main Thread가 긴 JavaScript 작업으로 막히면 사용자는 페이지가 멈춘 것처럼 느낀다.

## 긴 JavaScript Task

다음 코드는 3초 동안 Main Thread를 점유한다.

```js
const startedAt = performance.now();

while (performance.now() - startedAt < 3000) {
  // Main Thread 점유
}
```

관찰되는 현상:

- 버튼 클릭이 즉시 처리되지 않는다.
- hover나 focus 스타일이 늦게 반영될 수 있다.
- 애니메이션이 끊긴다.
- 화면 업데이트가 지연된다.

이런 작업은 DevTools Performance 탭에서 긴 Task로 확인할 수 있다.

## 긴 Task를 줄이는 방법

개선 방향:

- 큰 작업을 작은 단위로 나눈다.
- 사용자 입력이 필요한 화면에서는 동기 반복문을 피한다.
- 무거운 계산은 Web Worker로 옮길 수 있는지 검토한다.
- 렌더링과 무관한 작업은 지연 실행한다.
- 리스트 렌더링은 필요한 항목만 렌더링한다.

작업 나누기 예:

```js
function runInChunks(items, processItem) {
  let index = 0;

  function runNextChunk() {
    const deadline = performance.now() + 8;

    while (index < items.length && performance.now() < deadline) {
      processItem(items[index]);
      index += 1;
    }

    if (index < items.length) {
      setTimeout(runNextChunk, 0);
    }
  }

  runNextChunk();
}
```

위 방식은 하나의 긴 작업을 여러 짧은 작업으로 나눠 브라우저가 중간에 입력과 렌더링을 처리할 기회를 준다.

## 실습 정리

다음 세 가지 방식으로 같은 스크립트를 불러오고 DevTools Network, Performance 탭에서 차이를 확인한다.

```html
<script src="/main.js"></script>
<script defer src="/main.js"></script>
<script async src="/main.js"></script>
```

기록할 것:

- 다운로드 시점
- 실행 시점
- DOM 파싱 차단 여부
- 실행 순서 보장 여부
- 사용자 입력 지연 여부

## 면접 답변 핵심

일반 script는 HTML 파싱을 멈추고 다운로드와 실행을 끝낸 뒤 파싱을 재개한다. `defer`는 파싱을 막지 않고 다운로드한 뒤 DOM 파싱 완료 후 선언 순서대로 실행된다. `async`는 파싱을 막지 않고 다운로드하지만 다운로드가 끝나는 즉시 실행되며 실행 순서는 보장되지 않는다. 긴 JavaScript 작업은 Main Thread를 점유해 사용자 입력과 렌더링을 지연시킬 수 있다.
