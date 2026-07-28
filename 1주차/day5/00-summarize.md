# Day 5 빠른 복습 정리

## 학습 목표

- HTML과 CSS가 실제 화면으로 변환되는 과정을 설명한다.
- 시맨틱 HTML과 접근성의 관계를 이해한다.
- 브라우저 렌더링을 막는 요소를 설명한다.

## 상세 개념 파일

- [시맨틱 HTML과 접근성](./01-semantic-html-accessibility.md)
- [CSS 박스 모델과 배치](./02-css-box-layout.md)
- [브라우저 렌더링 과정](./03-browser-rendering-pipeline.md)
- [스크립트 로딩과 Main Thread](./04-script-loading-main-thread.md)

## 실행 예시

React playground에서 다음 경로로 실행한다.

- 시맨틱 요소 비교: `/week1/day5/semantic-elements-comparison`
- Box Model과 배치 검사기: `/week1/day5/box-model-inspector`
- 스크립트 로딩 타임라인: `/week1/day5/script-loading-comparison`
- 긴 Task 재현: `/week1/day5/long-task-playground`

```bash
cd playgrounds/react
npm run dev
```

## 1. HTML은 DOM Tree로 변환된다

브라우저는 HTML 문자열을 위에서 아래로 읽으면서 노드 객체를 만들고, 이 노드들이 부모-자식 관계를 이루면 DOM Tree가 된다.

```html
<main>
  <h1>클립 목록</h1>
  <button type="button">클립 복사</button>
</main>
```

위 HTML은 대략 다음과 같은 구조로 해석된다.

```text
document
└─ main
   ├─ h1
   └─ button
```

핵심:

- DOM은 JavaScript가 조작할 수 있는 문서 객체 모델이다.
- HTML 태그 이름과 계층은 접근성 트리와 렌더링 구조에도 영향을 준다.
- 태그를 의미에 맞게 쓰면 브라우저 기본 동작, 키보드 조작, 스크린 리더 해석이 자연스러워진다.

## 2. 시맨틱 HTML과 접근성

시맨틱 HTML은 화면 모양이 아니라 요소의 의미에 맞는 태그를 사용하는 것이다.

| 목적 | 우선 사용할 요소 |
| --- | --- |
| 페이지의 주요 제목 | `h1` |
| 섹션 제목 | `h2` ~ `h6` |
| 클릭해서 동작 실행 | `button` |
| 다른 URL이나 위치로 이동 | `a` |
| 사용자 입력 묶음 | `form` |
| 입력 이름 설명 | `label` |
| 텍스트 입력 | `input` |

`button`과 `a`는 역할이 다르다.

- `button`: 저장, 삭제, 복사, 모달 열기처럼 현재 화면에서 동작을 실행한다.
- `a`: 다른 페이지, 파일, 섹션, 외부 URL로 이동한다.

`div role="button"`은 실제 버튼처럼 보일 수는 있지만 기본 버튼 동작을 직접 구현해야 한다.

```tsx
<div role="button" tabIndex={0} onClick={handleCopy}>
  클립 복사
</div>
```

문제점:

- Enter와 Space 키 동작을 직접 맞춰야 한다.
- 비활성화 상태, 폼 제출 동작, 포커스 처리 등 기본 동작이 부족하다.
- 스크린 리더와 브라우저가 기대하는 기본 의미를 온전히 얻기 어렵다.

권장 방식:

```tsx
<button type="button" onClick={handleCopy}>
  클립 복사
</button>
```

좋은 점:

- 기본적으로 포커스 가능하다.
- Enter와 Space 키로 실행된다.
- 접근성 트리에 버튼 역할로 노출된다.
- `disabled`, `type` 같은 기본 속성을 사용할 수 있다.

ARIA는 기본 HTML로 표현할 수 없는 의미를 보완할 때 사용한다. 기본 요소로 충분히 표현할 수 있다면 ARIA보다 HTML 요소를 먼저 선택해야 한다.

## 3. Heading 구조

Heading은 글씨 크기 조절용 태그가 아니라 문서의 목차 구조를 만든다.

```html
<h1>설정</h1>
<h2>프로필</h2>
<h2>알림</h2>
<h3>이메일 알림</h3>
```

주의할 점:

- 한 화면의 대표 제목은 보통 `h1` 하나로 둔다.
- 시각적으로 작게 보여야 해도 의미상 섹션 제목이면 적절한 heading을 사용하고 CSS로 크기를 조절한다.
- `h1` 다음에 갑자기 `h4`가 나오는 식의 구조는 문서 탐색을 어렵게 만든다.

## 4. Form, Label, Input

입력 요소는 설명 텍스트와 연결되어야 한다.

```html
<label for="clip-title">클립 제목</label>
<input id="clip-title" name="title" />
```

연결된 `label`의 장점:

- 라벨을 클릭해도 입력 요소에 포커스가 간다.
- 스크린 리더가 입력 목적을 읽어줄 수 있다.
- 자동완성, 검증, 폼 제출 흐름을 이해하기 쉬워진다.

React에서는 `for` 대신 `htmlFor`를 사용한다.

```tsx
<label htmlFor="clip-title">클립 제목</label>
<input id="clip-title" name="title" />
```

## 5. CSS Box Model

요소의 실제 크기는 Content, Padding, Border, Margin으로 결정된다.

```text
margin
└─ border
   └─ padding
      └─ content
```

`box-sizing: content-box`에서는 `width`가 content 너비만 의미한다.

```css
.card {
  box-sizing: content-box;
  width: 200px;
  padding: 16px;
  border: 2px solid black;
}
```

실제 렌더링 너비:

```text
200 + 16 * 2 + 2 * 2 = 236px
```

`box-sizing: border-box`에서는 `width` 안에 content, padding, border가 포함된다.

```css
.card {
  box-sizing: border-box;
  width: 200px;
  padding: 16px;
  border: 2px solid black;
}
```

실제 렌더링 너비:

```text
200px
```

## 6. Normal Flow와 Display

Normal Flow는 별도 배치 규칙을 주지 않았을 때 문서가 자연스럽게 배치되는 기본 흐름이다.

| 값 | 특징 |
| --- | --- |
| `block` | 새 줄에서 시작하고 가능한 가로 공간을 차지한다 |
| `inline` | 줄 안에서 텍스트처럼 흐르고 width/height 적용이 제한적이다 |
| `inline-block` | 줄 안에 배치되지만 width/height를 가질 수 있다 |

`position`은 기본 흐름에서 벗어나거나 기준점을 바꿀 때 사용한다.

| 값 | 의미 |
| --- | --- |
| `static` | 기본값, Normal Flow를 따른다 |
| `relative` | 원래 위치를 기준으로 이동하고, 원래 자리 공간은 유지된다 |
| `absolute` | 가장 가까운 positioned ancestor를 기준으로 배치되고, 흐름에서 빠진다 |
| `fixed` | viewport를 기준으로 고정된다 |
| `sticky` | 스크롤 위치에 따라 흐름 배치와 고정 배치를 오간다 |

## 7. z-index와 Stacking Context

`z-index`는 단순히 숫자가 크면 항상 위로 올라가는 규칙이 아니다. 비교는 같은 stacking context 안에서만 의미가 있다.

Stacking Context가 생길 수 있는 예:

- `position`이 있고 `z-index`가 `auto`가 아닌 요소
- `opacity`가 1보다 작은 요소
- `transform`이 적용된 요소
- `filter`, `isolation`, `will-change` 등이 적용된 요소

실무에서 `z-index`가 예상대로 동작하지 않으면 다음을 확인한다.

- 비교 대상이 같은 stacking context 안에 있는가?
- 부모 요소가 새로운 stacking context를 만들고 있지는 않은가?
- 불필요한 `position`, `transform`, `opacity`가 있는가?

## 8. 브라우저 렌더링 과정

브라우저가 HTML과 CSS를 화면으로 바꾸는 흐름은 다음과 같다.

```text
HTML 파싱
→ DOM 생성
→ CSS 파싱
→ CSSOM 생성
→ Render Tree 생성
→ Layout
→ Paint
→ Composite
```

각 단계의 의미:

- DOM: HTML 구조
- CSSOM: CSS 규칙 구조
- Render Tree: 실제 화면에 그릴 노드와 스타일의 조합
- Layout: 각 요소의 크기와 위치 계산
- Paint: 픽셀로 그릴 명령 생성
- Composite: 여러 레이어를 합성해 최종 화면 표시

`display: none` 요소는 Render Tree에 포함되지 않는다. 반면 `visibility: hidden`은 보이지 않지만 공간은 차지하므로 Layout에는 영향을 준다.

## 9. Reflow와 Repaint

Reflow는 Layout을 다시 계산하는 작업이다. 요소의 크기, 위치, 문서 흐름이 바뀌면 발생할 수 있다.

Reflow를 유발하기 쉬운 변경:

- `width`, `height`
- `padding`, `border`, `margin`
- `display`
- DOM 노드 추가/삭제
- 텍스트 변경으로 인한 줄바꿈

Repaint는 레이아웃은 그대로 두고 픽셀을 다시 칠하는 작업이다.

Repaint를 유발하기 쉬운 변경:

- `color`
- `background-color`
- `box-shadow`
- `visibility`

`transform`, `opacity`는 경우에 따라 Composite 단계에서 처리될 수 있어 애니메이션에 자주 사용된다. 하지만 무조건 성능이 좋아지는 것은 아니므로 DevTools Performance 탭으로 확인해야 한다.

## 10. Render-blocking CSS와 JavaScript

CSS는 화면에 어떤 스타일을 적용할지 결정하므로 렌더링을 막을 수 있다. 브라우저는 CSSOM이 준비되기 전까지 잘못된 스타일로 화면을 그리는 일을 피하려고 한다.

일반 `<script>`는 HTML 파싱을 멈추게 할 수 있다.

```html
<script src="/main.js"></script>
```

`defer`는 HTML 파싱을 막지 않고 스크립트를 다운로드한 뒤, DOM 파싱이 끝난 후 순서대로 실행한다.

```html
<script defer src="/main.js"></script>
```

`async`는 HTML 파싱을 막지 않고 다운로드하지만, 다운로드가 끝나는 즉시 실행되며 실행 시점에는 파싱을 잠시 멈출 수 있다. 여러 async 스크립트의 실행 순서는 보장되지 않는다.

```html
<script async src="/main.js"></script>
```

선택 기준:

- DOM에 의존하고 실행 순서가 중요하면 `defer`
- 독립적인 분석 스크립트처럼 순서가 중요하지 않으면 `async`
- 꼭 필요한 경우가 아니면 head의 일반 script는 피한다

## 11. Main Thread와 긴 JavaScript Task

브라우저의 Main Thread는 JavaScript 실행, 스타일 계산, Layout, Paint, 사용자 입력 처리를 많이 담당한다. 긴 JavaScript 작업이 Main Thread를 오래 점유하면 버튼 클릭, 스크롤, 렌더링이 멈춘 것처럼 보일 수 있다.

```js
const startedAt = performance.now();

while (performance.now() - startedAt < 3000) {
  // Main Thread 점유
}
```

관찰할 점:

- 반복문이 도는 동안 버튼 클릭 반응이 늦어진다.
- 화면 업데이트가 즉시 반영되지 않을 수 있다.
- DevTools Performance 탭에서 긴 Task를 확인할 수 있다.

## 코드 실습

### 1. 시맨틱 요소 비교

다음 코드를 실제 버튼으로 변경한다.

```tsx
<div role="button" tabIndex={0} onClick={handleCopy}>
  클립 복사
</div>
```

```tsx
<button type="button" onClick={handleCopy}>
  클립 복사
</button>
```

비교할 것:

- Tab 키로 포커스가 이동하는가?
- Enter와 Space 키로 실행되는가?
- `disabled` 상태를 자연스럽게 표현할 수 있는가?
- 스크린 리더가 요소 역할을 어떻게 읽는가?

### 2. Box Model 확인

DevTools에서 다음을 바꿔본다.

- `box-sizing: content-box`
- `box-sizing: border-box`
- `padding`
- `border`
- `width`

정리할 것:

- `content-box`에서 실제 렌더링 너비가 어떻게 계산되는가?
- `border-box`에서 왜 레이아웃 계산이 예측하기 쉬운가?

### 3. 스크립트 로딩 비교

동일한 스크립트를 다음 방식으로 불러온다.

```html
<script src="/main.js"></script>
<script defer src="/main.js"></script>
<script async src="/main.js"></script>
```

정리할 것:

- HTML 파싱을 막는가?
- 실행 시점은 언제인가?
- 여러 스크립트의 실행 순서가 보장되는가?

### 4. 긴 Task 재현

```js
const startedAt = performance.now();

while (performance.now() - startedAt < 3000) {
  // Main Thread 점유
}
```

확인할 것:

- 버튼 반응이 지연되는가?
- 렌더링이 멈추는가?
- Performance 탭에서 Long Task가 보이는가?

## 프로젝트 연결 점검

다음 코드를 찾으면 day5 개념으로 설명하고 개선할 수 있어야 한다.

- `div`를 버튼처럼 사용한 코드
- Heading 순서가 어색한 화면
- `label`이 연결되지 않은 입력 요소
- `z-index`가 예상대로 동작하지 않는 코드
- `position`을 과도하게 사용한 레이아웃
- Layout을 자주 유발하는 애니메이션
- head에서 HTML 파싱을 막는 일반 `<script>`

## 면접 직전 체크

- 브라우저가 HTML을 화면에 표시하는 과정은?
  - HTML을 파싱해 DOM을 만들고, CSS를 파싱해 CSSOM을 만든다. 둘을 조합해 Render Tree를 만든 뒤 Layout, Paint, Composite 과정을 거쳐 화면에 표시한다.
- DOM, CSSOM, Render Tree의 차이는?
  - DOM은 HTML 구조, CSSOM은 CSS 규칙 구조, Render Tree는 실제 화면에 그릴 노드와 계산된 스타일의 조합이다.
- Layout과 Paint의 차이는?
  - Layout은 요소의 크기와 위치를 계산하는 단계이고, Paint는 계산된 박스를 픽셀로 그리는 단계다.
- `async`와 `defer`의 차이는?
  - 둘 다 다운로드 중 HTML 파싱을 막지 않지만, `defer`는 파싱이 끝난 뒤 순서대로 실행되고 `async`는 다운로드가 끝나는 즉시 실행되며 순서가 보장되지 않는다.
- `div role="button"`보다 실제 `button`이 나은 이유는?
  - 실제 `button`은 포커스, 키보드 조작, 접근성 역할, 비활성화 상태 같은 기본 동작을 브라우저가 제공하기 때문이다.

## 완료 조건

- [ ] DOM, CSSOM, Render Tree를 구분할 수 있다.
- [ ] Layout과 Paint의 차이를 설명할 수 있다.
- [ ] 시맨틱 HTML을 접근성과 유지보수 관점에서 설명할 수 있다.
