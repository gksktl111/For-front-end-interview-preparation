import { delay, http, HttpResponse } from "msw";
import { getClipsForRevision } from "./fixtures";
import type { Clip } from "./types";

export const day10Handlers = [
  http.get("/api/day10/clips", async ({ request }) => {
    const url = new URL(request.url);
    const requestedRevision = Number(url.searchParams.get("revision"));
    const revision =
      Number.isInteger(requestedRevision) && requestedRevision >= 0
        ? requestedRevision
        : 0;

    await delay(250);

    return HttpResponse.json<Clip[]>(getClipsForRevision(revision));
  }),
];
