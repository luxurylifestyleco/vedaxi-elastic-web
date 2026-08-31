import { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import type { PublisherStorage } from "@vedaxi/state";

import { PaperApp } from "./paper/PaperApp";
import {
  createDiscrepancyFocusTool,
  createPaperEvidenceService,
  createPaperEvidenceTool,
  createPaperFixture
} from "./paper";
import { usePaperRegistration } from "./paper/use-paper-registration";
import { createPublisherRuntime } from "./stage/publisher-runtime";
import "./styles.css";

const root = document.querySelector<HTMLElement>("#root");

if (!root) {
  throw new Error("Paper application root is missing");
}

const fixture = createPaperFixture(window.location.origin);
const service = createPaperEvidenceService(fixture.evidence);
const unavailableStorage: PublisherStorage = {
  getItem: () => { throw new Error("localStorage unavailable"); },
  setItem: () => { throw new Error("localStorage unavailable"); }
};
let browserStorage: PublisherStorage;
try {
  browserStorage = window.localStorage;
} catch {
  browserStorage = unavailableStorage;
}
const publisherRuntime = createPublisherRuntime(browserStorage);
const paperEvidenceTool = createPaperEvidenceTool(service);
const focusTool = createDiscrepancyFocusTool(publisherRuntime.dispatch);
const tools = [paperEvidenceTool, focusTool] as const;
const videoOrigin = (import.meta.env as { VITE_VIDEO_ORIGIN?: string }).VITE_VIDEO_ORIGIN
  || "http://localhost:4174";

function PaperRoot() {
  const protocol = usePaperRegistration(tools);
  const publisherView = useSyncExternalStore(
    publisherRuntime.subscribe,
    publisherRuntime.getSnapshot,
    publisherRuntime.getSnapshot
  );
  return <PaperApp
    fixture={fixture}
    service={service}
    protocol={protocol}
    publisherState={publisherView.state}
    dispatchPublisher={publisherRuntime.dispatch}
    publisherError={publisherView.error}
    videoOrigin={videoOrigin}
  />;
}

createRoot(root).render(<PaperRoot />);
