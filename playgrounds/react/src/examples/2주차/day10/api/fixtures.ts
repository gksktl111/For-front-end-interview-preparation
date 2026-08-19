import type { Clip } from "./types";

const serverClipVersions: Clip[][] = [
  [
    {
      id: "clip-state",
      title: "State Ownership 정리",
      updatedAt: "v1",
    },
    {
      id: "clip-context",
      title: "Context 사용 기준",
      updatedAt: "v1",
    },
  ],
  [
    {
      id: "clip-state",
      title: "State Ownership 정리",
      updatedAt: "v2",
    },
    {
      id: "clip-context",
      title: "Context 사용 기준",
      updatedAt: "v2",
    },
    {
      id: "clip-server",
      title: "Server State 복제 점검",
      updatedAt: "v2",
    },
  ],
  [
    {
      id: "clip-state",
      title: "State Ownership 정리",
      updatedAt: "v3",
    },
    {
      id: "clip-context",
      title: "Context Provider 범위",
      updatedAt: "v3",
    },
    {
      id: "clip-server",
      title: "Server State 복제 점검",
      updatedAt: "v3",
    },
  ],
];

export const INITIAL_CLIPS = serverClipVersions[0];

export function getClipsForRevision(revision: number) {
  const versionIndex = Math.abs(revision) % serverClipVersions.length;

  return serverClipVersions[versionIndex].map((clip) => ({ ...clip }));
}
