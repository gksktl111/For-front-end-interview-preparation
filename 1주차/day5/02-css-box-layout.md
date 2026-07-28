# CSS 박스 모델과 배치

## Box Model

브라우저는 각 요소를 사각형 박스로 계산한다. 박스는 Content, Padding, Border, Margin으로 구성된다.

```text
margin
└─ border
   └─ padding
      └─ content
```

각 영역의 의미:

- Content: 텍스트, 이미지 같은 실제 콘텐츠 영역
- Padding: 콘텐츠와 테두리 사이의 내부 여백
- Border: 요소의 테두리
- Margin: 다른 요소와의 외부 간격

## `box-sizing`

`box-sizing`은 `width`와 `height`가 어떤 영역까지 포함하는지 결정한다.

### `content-box`

기본값이다. `width`는 content 영역만 의미한다.

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
content 200px
+ left padding 16px
+ right padding 16px
+ left border 2px
+ right border 2px
= 236px
```

### `border-box`

`width` 안에 content, padding, border가 포함된다.

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

실무에서는 전체 요소에 `border-box`를 적용하면 레이아웃 계산이 쉬워진다.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## Normal Flow

Normal Flow는 별도 배치 규칙 없이 HTML 순서대로 요소가 배치되는 기본 흐름이다.

```html
<h1>제목</h1>
<p>본문</p>
<button type="button">저장</button>
```

브라우저는 기본적으로 위에서 아래로, 인라인 콘텐츠는 줄 안에서 왼쪽에서 오른쪽으로 배치한다.

Normal Flow를 먼저 이해해야 하는 이유:

- 대부분의 레이아웃은 기본 흐름을 바탕으로 만들어진다.
- 불필요한 `position: absolute`를 줄일 수 있다.
- 반응형 레이아웃에서 요소가 자연스럽게 밀리고 줄바꿈되는 흐름을 예측할 수 있다.

## `block`, `inline`, `inline-block`

| display | 특징 | 예시 요소 |
| --- | --- | --- |
| `block` | 새 줄에서 시작하고 가능한 가로 공간을 차지한다 | `div`, `p`, `section` |
| `inline` | 줄 안에서 텍스트처럼 흐른다 | `span`, `a`, `strong` |
| `inline-block` | 줄 안에 놓이지만 박스 크기를 가질 수 있다 | 버튼형 태그, 배지 |

`inline` 요소는 일반 흐름에서 `width`, `height`가 기대처럼 적용되지 않을 수 있다.

```css
.label {
  display: inline;
  width: 120px; /* 기대처럼 고정 너비가 되지 않을 수 있다 */
}
```

필요하면 `inline-block`이나 flex/grid 레이아웃을 검토한다.

## `position`

`position`은 요소가 어떤 기준으로 배치되는지 결정한다.

### `static`

기본값이다. Normal Flow를 따른다.

```css
.item {
  position: static;
}
```

### `relative`

원래 위치를 기준으로 이동한다. 요소가 차지하던 공간은 유지된다.

```css
.badge {
  position: relative;
  top: -4px;
}
```

### `absolute`

가장 가까운 상위 요소 중 position이 static이 아닌 요소를 기준으로 위치가 정해진다.
배치 공간을 차지하지 않으므로, 다른 요소들은 이 요소가 없는 것처럼 배치된다.

```css
.card {
  position: relative;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
}
```

기준 부모가 없으면 viewport나 초기 containing block 기준으로 잡혀 예상과 다르게 보일 수 있다.

### `fixed`

viewport를 기준으로 고정된다.

```css
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
}
```

### `sticky`

처음에는 Normal Flow를 따르다가 특정 스크롤 위치에 도달하면 고정된다.

```css
.toolbar {
  position: sticky;
  top: 0;
}
```

부모의 스크롤 영역과 overflow 설정에 영향을 받으므로 동작하지 않을 때는 조상 요소의 `overflow`를 확인한다.

## `z-index`

`z-index`는 쌓임 순서를 제어한다. 단, 모든 요소끼리 전역 숫자 비교를 하는 것이 아니라 같은 stacking context 안에서 비교된다.

```css
.modal {
  position: fixed;
  z-index: 1000;
}

.dropdown {
  position: absolute;
  z-index: 10;
}
```

`z-index`가 적용되려면 보통 `position`이 `static`이 아니어야 한다. 다만 flex/grid item 등 일부 예외가 있다.

## Stacking Context 기초

Stacking Context는 자식 요소들의 쌓임 순서를 독립적으로 관리하는 영역이다.

새 stacking context를 만들 수 있는 대표 사례:

- `position`이 있고 `z-index`가 `auto`가 아닌 요소
- `position: fixed` 또는 `position: sticky`
- `opacity`가 1보다 작은 요소
- `transform`이 `none`이 아닌 요소
- `filter`, `mix-blend-mode`, `isolation: isolate`
- `will-change`로 관련 속성을 예고한 요소

예상과 다른 코드:

```css
.panel {
  transform: translateZ(0);
}

.tooltip {
  position: absolute;
  z-index: 9999;
}
```

`.panel`이 새로운 stacking context를 만들면 `.tooltip`의 `z-index: 9999`는 그 안에서만 강하다. 바깥의 다른 stacking context보다 반드시 위에 올라간다는 뜻은 아니다.

## Reflow와 Repaint

Reflow는 Layout을 다시 계산하는 작업이다.

Reflow 가능성이 큰 변경:

- `width`, `height`
- `padding`, `border`, `margin`
- `display`
- 폰트 크기
- DOM 추가/삭제
- 텍스트 변경으로 인한 줄바꿈

Repaint는 이미 계산된 박스를 다시 칠하는 작업이다.

Repaint 가능성이 큰 변경:

- `color`
- `background-color`
- `box-shadow`
- `visibility`

Composite는 만들어진 레이어를 합성하는 단계다. `transform`, `opacity` 애니메이션은 Layout을 덜 건드릴 수 있어 성능상 유리한 경우가 많다.

## DevTools 실습

다음 CSS를 가진 요소를 만들고 DevTools에서 값을 바꿔본다.

```css
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 16px;
  border: 2px solid black;
}
```

확인 순서:

1. Computed 탭에서 실제 너비를 확인한다.
2. `box-sizing`을 `border-box`로 바꾼다.
3. `padding`, `border`, `width`를 각각 바꿔 실제 렌더링 크기를 비교한다.
4. Performance 탭에서 크기 변경이 Layout을 유발하는지 확인한다.

## 면접 답변 핵심

CSS Box Model은 요소가 Content, Padding, Border, Margin으로 계산되는 구조다. `content-box`에서는 width가 content만 의미하고, `border-box`에서는 padding과 border까지 포함한다. 요소의 크기나 위치가 바뀌면 Layout을 다시 계산하는 Reflow가 발생할 수 있고, 색상처럼 픽셀만 바뀌는 경우에는 주로 Repaint가 발생한다.
