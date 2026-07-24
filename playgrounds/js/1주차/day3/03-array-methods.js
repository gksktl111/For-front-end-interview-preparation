const clips = [
  { id: "clip-1", folderId: "frontend", isFavorite: true, isDeleted: false, isSynced: true, createdAt: "2026-07-24T10:00:00.000Z" },
  { id: "clip-2", folderId: "javascript", isFavorite: false, isDeleted: true, isSynced: false, createdAt: "2026-07-24T09:00:00.000Z" },
  { id: "clip-3", folderId: "frontend", isFavorite: true, isDeleted: false, isSynced: true, createdAt: "2026-07-24T11:00:00.000Z" },
];

// sort는 원본을 바꾼다.
const sortedBySort = [...clips];
sortedBySort.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
console.log(sortedBySort.map((clip) => clip.id)); // [ 'clip-3', 'clip-1', 'clip-2' ]

// toSorted는 원본을 유지하고 새 배열을 반환한다.
const sortedByToSorted = clips.toSorted(
  (left, right) => right.createdAt.localeCompare(left.createdAt),
);
console.log(sortedByToSorted.map((clip) => clip.id)); // [ 'clip-3', 'clip-1', 'clip-2' ]
console.log(clips.map((clip) => clip.id)); // [ 'clip-1', 'clip-2', 'clip-3' ]

console.log(clips.filter((clip) => clip.isFavorite).map((clip) => clip.id));
console.log(clips.find((clip) => clip.id === "clip-2"));
console.log(clips.some((clip) => clip.isDeleted)); // true
console.log(clips.every((clip) => clip.isSynced)); // false

const countByFolder = clips.reduce((acc, clip) => {
  acc[clip.folderId] = (acc[clip.folderId] ?? 0) + 1;
  return acc;
}, {});

console.log(countByFolder); // { frontend: 2, javascript: 1 }
