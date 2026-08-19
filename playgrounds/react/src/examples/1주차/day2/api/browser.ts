import { setupWorker } from "msw/browser";
import { day10Handlers } from "../../../2주차/day10/api/handlers";
import { day11Handlers } from "../../../2주차/day11/api/handlers";
import { day2Handlers } from "./handlers";

const worker = setupWorker(...day2Handlers, ...day10Handlers, ...day11Handlers);

export async function startMockWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  await worker.start({
    onUnhandledRequest: "bypass",
  });
}
