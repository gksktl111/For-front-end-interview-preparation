export const EFFECT_USER_OPTIONS = {
  "user-a": {
    delay: 2200,
    label: "User A (느림)",
  },
  "user-b": {
    delay: 450,
    label: "User B (빠름)",
  },
  error: {
    delay: 350,
    label: "HTTP 500 응답",
  },
} as const;

export type EffectUserId = keyof typeof EFFECT_USER_OPTIONS;

export type DataUserId = Exclude<EffectUserId, "error">;

export type EffectUser = {
  id: DataUserId;
  name: string;
  role: string;
  responseDelay: number;
};

export function getEffectUserLabel(userId: EffectUserId) {
  return EFFECT_USER_OPTIONS[userId].label;
}
