// 카운트 상태 변경 함수
const increase = (function () {
  // 카운트 상태 변수
  let num = 0;

  // 클로저
  return function () {
    // 카운트 상태를 1만큼 증가 시킨다.
    return ++num;
  };
}());


// num에는 직접 접근하지 못하고 클로저를 통해서만 내부 변수에 접근 가능하게하여 
// 상태를 안전하게 변경한다
console.log(increase()); // 1
console.log(increase()); // 2
console.log(increase()); // 3