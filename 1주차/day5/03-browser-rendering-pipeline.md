# 브라우저 렌더링 과정

## 전체 흐름

브라우저가 HTML과 CSS를 화면에 표시하는 과정은 다음 순서로 이해할 수 있다.

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

이 흐름은 한 번만 실행되고 끝나는 것이 아니다. DOM, 스타일, 크기, 위치가 바뀔 때 필요한 단계가 다시 실행된다.

## 1. HTML 파싱과 DOM 생성

브라우저는 서버에서 받은 HTML을 토큰으로 나누고 노드 객체를 만들며 DOM Tree를 구성한다.

```html
<main>
  <h1>클립 목록</h1>
  <p>저장한 클립을 확인합니다.</p>
</main>
```

DOM Tree는 JavaScript가 접근하고 수정할 수 있는 문서 구조다.

```js
const title = document.querySelector("h1");
title.textContent = "최근 클립";
```

DOM은 HTML 원문 그 자체가 아니라 브라우저가 해석해서 만든 객체 모델이다.

## 2. CSS 파싱과 CSSOM 생성

브라우저는 CSS도 파싱해서 CSSOM을 만든다.

```css
h1 {
  color: #111827;
  font-size: 32px;
}
```

CSSOM은 어떤 선택자에 어떤 스타일 규칙이 적용되는지를 담는다.

CSSOM이 중요한 이유:

- 최종 스타일 계산에 필요하다.
- CSS는 렌더링을 막을 수 있다.
- JavaScript가 스타일 정보를 읽거나 변경할 때 영향을 준다.

## 3. Render Tree 생성

Render Tree는 화면에 실제로 그릴 노드와 계산된 스타일을 조합한 트리다.

DOM에 있어도 Render Tree에서 제외될 수 있다.

```html
<p>보이는 문장</p>
<p style="display: none">보이지 않는 문장</p>
```

`display: none` 요소는 화면에 그리지 않으므로 Render Tree에 포함되지 않는다.

반면 다음 요소는 공간을 차지한다.

```html
<p style="visibility: hidden">공간은 차지하는 문장</p>
```

`visibility: hidden`은 보이지 않지만 Layout에는 참여한다.

## 4. Layout

Layout은 각 요소의 크기와 위치를 계산하는 단계다.

계산 대상:

- 박스의 너비와 높이
- 각 요소의 x, y 위치
- 줄바꿈
- 부모와 자식의 배치 관계
- viewport 크기에 따른 반응형 결과

Layout이 필요한 변경 예:

```js
element.style.width = "300px";
element.textContent = "긴 문장으로 바꾸면 줄바꿈이 달라질 수 있다.";
```

요소의 크기나 위치가 바뀌면 주변 요소의 위치도 다시 계산해야 할 수 있다. 이 작업을 Reflow라고 부르기도 한다.

## 5. Paint

Paint는 Layout 결과를 바탕으로 실제 픽셀을 어떻게 칠할지 준비하는 단계다.

Paint 대상:

- 글자 색
- 배경 색
- 테두리
- 그림자
- 이미지

예를 들어 `background-color`만 바꾸면 요소의 위치는 그대로이므로 Layout 없이 Paint만 다시 일어날 수 있다.

```js
element.style.backgroundColor = "black";
```

## 6. Composite

Composite는 여러 레이어를 합쳐 최종 화면을 만드는 단계다.

브라우저는 특정 요소를 별도 레이어로 올릴 수 있다.

대표적으로 Composite 단계에서 처리되기 쉬운 속성:

- `transform`
- `opacity`

예:

```css
.panel {
  transform: translateX(20px);
  opacity: 0.8;
}
```

이 속성들은 Layout을 다시 계산하지 않고 레이어 합성으로 처리될 수 있어 애니메이션에 자주 쓰인다. 하지만 레이어가 많아지면 메모리와 합성 비용이 늘 수 있으므로 무조건 좋은 것은 아니다.

## DOM, CSSOM, Render Tree 차이

| 구분 | 의미 | 포함 정보 |
| --- | --- | --- |
| DOM | HTML을 해석한 문서 구조 | 요소, 텍스트, 속성, 계층 |
| CSSOM | CSS를 해석한 스타일 규칙 구조 | 선택자, 속성, 상속, 우선순위 |
| Render Tree | 실제 화면에 그릴 구조 | 보이는 노드와 계산된 스타일 |

## Reflow와 Repaint 차이

| 구분 | 다시 계산하는 것 | 예시 변경 |
| --- | --- | --- |
| Reflow | 요소의 크기와 위치 | `width`, `height`, `display`, DOM 추가 |
| Repaint | 픽셀 색과 시각 표현 | `color`, `background-color`, `box-shadow` |
| Composite | 레이어 합성 | `transform`, `opacity` |

Reflow가 발생하면 보통 Paint와 Composite도 이어질 수 있다. Paint가 발생한다고 항상 Layout이 다시 필요한 것은 아니다.

## 렌더링 비용을 줄이는 기준

실무에서 고려할 점:

- DOM 변경을 불필요하게 반복하지 않는다.
- 크기와 위치를 바꾸는 애니메이션은 신중히 사용한다.
- 레이아웃 측정과 스타일 변경을 반복해서 섞지 않는다.
- 긴 JavaScript 작업으로 Main Thread를 오래 점유하지 않는다.
- DevTools Performance 탭으로 실제 병목을 확인한다.

피해야 할 패턴:

```js
items.forEach((item) => {
  const height = item.offsetHeight;
  item.style.height = `${height + 10}px`;
});
```

위 코드는 레이아웃 값을 읽고 스타일을 쓰는 작업을 반복한다. 브라우저가 최신 레이아웃 값을 보장하기 위해 계산을 자주 강제할 수 있다.

개선 방향:

```js
const heights = items.map((item) => item.offsetHeight);

items.forEach((item, index) => {
  item.style.height = `${heights[index] + 10}px`;
});
```

읽기와 쓰기를 분리하면 불필요한 레이아웃 계산을 줄일 수 있다.

## 면접 답변 핵심

브라우저는 HTML을 파싱해 DOM을 만들고, CSS를 파싱해 CSSOM을 만든다. DOM과 CSSOM을 조합해 실제로 그릴 Render Tree를 만든 뒤, Layout에서 크기와 위치를 계산하고 Paint에서 픽셀을 그릴 명령을 만든다. 마지막으로 Composite 단계에서 레이어를 합쳐 최종 화면을 표시한다.
