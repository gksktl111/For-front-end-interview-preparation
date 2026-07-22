// hoisting-practice.js

// ========================================
// 1. var 호이스팅
// ========================================

console.log(varMessage); // undefined

// var는 코드 평가 단계에서 선언되고
// undefined로 초기화된다.
var varMessage = "hello";

console.log(varMessage); // hello


// ========================================
// 2. var의 선언과 할당 분리
// ========================================

// 아래 코드:
//
// var name = "민규";
//
// 는 개념적으로 다음 두 단계로 나눠서 이해할 수 있다.

// 선언은 실행 전에 처리된다.
var name;

// 할당은 코드가 실행되면서 처리된다.
name = "민규";

console.log(name); // 민규


// ========================================
// 3. let 호이스팅과 TDZ
// ========================================

{
  // let도 호이스팅되지만 선언문을 만나기 전에는
  // 초기화되지 않은 상태다.
  //
  // 이 구간을 TDZ(Temporal Dead Zone)라고 한다.

  // 아래 주석을 해제하면 ReferenceError가 발생한다.
  // console.log(letMessage);

  let letMessage = "hello";

  // 선언문이 실행된 이후에는 정상적으로 접근할 수 있다.
  console.log(letMessage); // hello
}


// ========================================
// 4. const 호이스팅과 TDZ
// ========================================

{
  // const도 let과 마찬가지로 호이스팅된다.
  // 하지만 선언문 이전에는 TDZ에 있기 때문에 접근할 수 없다.

  // 아래 주석을 해제하면 ReferenceError가 발생한다.
  // console.log(constMessage);

  const constMessage = "hello";

  console.log(constMessage); // hello
}


// ========================================
// 5. 함수 선언문 호이스팅
// ========================================

// 함수 선언문은 선언과 함수 객체 생성까지
// 코드 실행 전에 처리된다.
// 따라서 선언문보다 먼저 호출할 수 있다.

greet(); // hello

function greet() {
  console.log("hello");
}


// ========================================
// 6. var 함수 표현식 호이스팅
// ========================================

// varFunction 변수는 호이스팅되어 undefined로 초기화된다.
//
// 하지만 함수 객체가 할당되는 것은
// 이 할당문이 실행되는 시점이다.

// 아래 주석을 해제하면 TypeError가 발생한다.
// undefined를 함수처럼 호출하기 때문이다.
// varFunction();

var varFunction = function () {
  console.log("var 함수 표현식");
};

varFunction(); // var 함수 표현식


// ========================================
// 7. const 함수 표현식 호이스팅
// ========================================

// constFunction 변수는 호이스팅되지만
// 선언문 이전까지 TDZ에 존재한다.

// 아래 주석을 해제하면 ReferenceError가 발생한다.
// constFunction();

const constFunction = function () {
  console.log("const 함수 표현식");
};

constFunction(); // const 함수 표현식


// ========================================
// 8. 화살표 함수 호이스팅
// ========================================

// 화살표 함수도 함수 표현식이다.
// 따라서 함수 자체가 아니라 변수를 선언한 키워드의 규칙을 따른다.

// 아래 주석을 해제하면 ReferenceError가 발생한다.
// arrowFunction();

const arrowFunction = () => {
  console.log("화살표 함수");
};

arrowFunction(); // 화살표 함수


// ========================================
// 9. 함수 내부의 var 호이스팅
// ========================================

function functionVarExample() {
  // localValue는 함수 전체에서 선언된 것으로 처리되고
  // 실행 전에 undefined로 초기화된다.

  console.log(localValue); // undefined

  var localValue = 10;

  console.log(localValue); // 10
}

functionVarExample();


// ========================================
// 10. 블록 내부의 let 호이스팅
// ========================================

{
  // blockValue는 이 블록 시작부터 선언문 전까지 TDZ에 있다.

  // 아래 주석을 해제하면 ReferenceError가 발생한다.
  // console.log(blockValue);

  let blockValue = 20;

  console.log(blockValue); // 20
}


// ========================================
// 11. 같은 이름의 변수와 TDZ
// ========================================

const value = "전역 값";

{
  // 이 블록 안에는 별도의 value가 선언되어 있다.
  // 따라서 선언문 이전에 전역 value를 사용하는 것이 아니라,
  // 아직 초기화되지 않은 블록 내부 value를 참조하려고 한다.

  // 아래 주석을 해제하면 ReferenceError가 발생한다.
  // console.log(value);

  const value = "블록 값";

  console.log(value); // 블록 값
}

console.log(value); // 전역 값


// ========================================
// 12. 선언 전에 typeof 사용
// ========================================

// 선언되지 않은 식별자에 typeof를 사용하면 에러가 발생하지 않는다.
console.log(typeof notDeclared); // undefined

{
  // 하지만 let 또는 const로 선언될 식별자가 TDZ에 있다면
  // typeof를 사용해도 ReferenceError가 발생한다.

  // 아래 주석을 해제하면 ReferenceError가 발생한다.
  // console.log(typeof tdzValue);

  const tdzValue = 10;

  console.log(typeof tdzValue); // number
}