const original = {
  user: {
    name: "Minkyu",
  },
};

// Spread는 바깥 객체만 새로 만든다.
const copied = { ...original };

copied.user.name = "Changed";

console.log(original.user.name); // Changed
console.log(original === copied); // false
console.log(original.user === copied.user); // true

// 중첩 객체까지 새로 만들면 참조 공유가 끊어진다.
const safelyCopied = {
  ...original,
  user: {
    ...original.user,
  },
};

console.log(original.user === safelyCopied.user); // false
