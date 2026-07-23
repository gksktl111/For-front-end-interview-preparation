import { setupWorker } from "msw/browser";
import { day2Handlers } from "./handlers";

const worker = setupWorker(...day2Handlers);

export async function startMockWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  await worker.start({
    onUnhandledRequest: "bypass",
  });
}
