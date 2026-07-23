import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

async function enableMocking() {
  const { startMockWorker } = await import("./examples/1주차/day2/api/browser");

  await startMockWorker();
}

void enableMocking()
  .catch((error) => {
    console.error("MSW worker start failed.", error);
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
