// ========================================
// 1. 함수 스코프: var
// ========================================

function functionScopeExample() {
  if (true) {
    // var는 if 블록이 아니라
    // 자신을 감싼 함수 전체를 스코프로 사용한다.
    var message = "hello";
  }

  // if 블록 밖이지만 같은 함수 내부이므로 접근 가능하다.
  console.log(message); // hello
}

functionScopeExample();

// 함수 내부에서 선언한 var는 함수 밖에서는 접근할 수 없다.
function anotherFunctionScopeExample() {
  var functionMessage = "함수 내부 변수";
}

anotherFunctionScopeExample();

// 아래 코드를 실행하면 ReferenceError가 발생한다.
// console.log(functionMessage);


// ========================================
// 2. 블록 스코프: let, const
// ========================================

function blockScopeExample() {
  if (true) {
    // const와 let은 자신을 감싼 가장 가까운 {} 블록을 스코프로 사용한다.
    const message = "hello";
    let count = 1;

    // 같은 if 블록 내부이므로 접근 가능하다.
    console.log(message); // hello
    console.log(count); // 1
  }

  // if 블록 밖에서는 message와 count에 접근할 수 없다.
  // 아래 코드를 실행하면 ReferenceError가 발생한다.
  // console.log(message);
  // console.log(count);
}

blockScopeExample();


// ========================================
// 3. var와 let의 차이 비교
// ========================================

function compareScopeExample() {
  if (true) {
    var functionScopedValue = "var";
    const blockScopedValue = "const";
    let anotherBlockScopedValue = "let";
  }

  // var는 함수 스코프이므로 접근 가능하다.
  console.log(functionScopedValue); // var

  // const와 let은 블록 스코프이므로 접근할 수 없다.
  // 아래 코드를 실행하면 ReferenceError가 발생한다.
  // console.log(blockScopedValue);
  // console.log(anotherBlockScopedValue);
}

compareScopeExample();