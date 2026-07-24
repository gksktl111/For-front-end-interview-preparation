const clips = [{ id: 1, title: "React" }];

// 같은 배열을 직접 바꾸면 참조는 그대로다.
const mutatedClips = clips;
mutatedClips.push({ id: 2, title: "JavaScript" });

console.log(Object.is(clips, mutatedClips)); // true
console.log(clips.length); // 2

// 새 배열을 만들면 React가 감지할 수 있는 새 참조가 된다.
const nextClips = [...clips, { id: 3, title: "Immutability" }];

console.log(Object.is(clips, nextClips)); // false
console.log(nextClips.length); // 3
