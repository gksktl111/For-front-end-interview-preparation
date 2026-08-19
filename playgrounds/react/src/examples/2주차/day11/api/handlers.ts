import { delay, http, HttpResponse } from "msw";
import { EFFECT_USER_OPTIONS } from "./types";
import type { DataUserId, EffectUser, EffectUserId } from "./types";

const USER_DATA: Record<
  DataUserId,
  {
    name: string;
    role: string;
  }
> = {
  "user-a": {
    name: "Avery Slow",
    role: "느린 이전 요청",
  },
  "user-b": {
    name: "Blair Current",
    role: "빠른 최신 요청",
  },
};

export const day11Handlers = [
  http.get("/api/day11/users/:userId", async ({ params }) => {
    const userId = params.userId;

    if (!isEffectUserId(userId)) {
      return HttpResponse.json(
        {
          message: "지원하지 않는 userId입니다.",
        },
        {
          status: 400,
        },
      );
    }

    const option = EFFECT_USER_OPTIONS[userId];

    await delay(option.delay);

    if (userId === "error") {
      return HttpResponse.json(
        {
          message: "학습용 HTTP 500 응답입니다.",
        },
        {
          status: 500,
        },
      );
    }

    const user = USER_DATA[userId];

    return HttpResponse.json<EffectUser>({
      id: userId,
      name: user.name,
      role: user.role,
      responseDelay: option.delay,
    });
  }),
];

function isEffectUserId(value: string | readonly string[] | undefined): value is EffectUserId {
  return value === "user-a" || value === "user-b" || value === "error";
}
