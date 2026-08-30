import { createPaperEvidenceTool, PAPER_EVIDENCE } from "../paper-probe";
import { createProbeController, type ProbeController } from "../../shared/probe-controller";
import { PAPER_ORIGIN, PAPER_VIDEO_FRAME } from "../../shared/origins";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("Protocol probe root is missing");
}

function element<K extends keyof HTMLElementTagNameMap>(name: K, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(name);
  if (text) node.textContent = text;
  return node;
}

const page = element("article");
const heading = element("h1", "VEDAXI paper protocol probe");
const origin = element("p", `Publisher origin: ${PAPER_ORIGIN}. Runtime origin: ${window.location.origin}.`);
const secureContext = element("p", `window.isSecureContext: ${String(window.isSecureContext)}`);
const status = element("p");
status.setAttribute("aria-live", "polite");
const nativeError = element("p");
nativeError.setAttribute("aria-live", "polite");
const controls = element("p");
const enable = element("button", "Enable native tool");
enable.type = "button";
const disable = element("button", "Disable native tool");
disable.type = "button";
controls.append(enable, document.createTextNode(" "), disable);
const methodsHeading = element("h2", "Methods evidence");
const methods = element("p", PAPER_EVIDENCE.excerpt);
const provenance = element("p", `Provenance: ${PAPER_EVIDENCE.locator} — ${PAPER_EVIDENCE.provenance}`);
const videoHeading = element("h2", "Independent video publisher");
const frame = element("iframe") as HTMLIFrameElement;
frame.src = PAPER_VIDEO_FRAME.src;
frame.title = PAPER_VIDEO_FRAME.title;
frame.setAttribute("allow", PAPER_VIDEO_FRAME.allow);

page.append(
  heading,
  origin,
  secureContext,
  status,
  nativeError,
  controls,
  methodsHeading,
  methods,
  provenance,
  videoHeading,
  frame
);
appRoot.replaceChildren(page);

let controller: ProbeController;
const updateStatus = () => {
  status.textContent = `Registration/UI state: ${controller.status}`;
  nativeError.textContent = `Native registration error: ${controller.error ?? "none"}`;
  enable.disabled = controller.status === "checking" || controller.status === "active";
  disable.disabled = controller.status === "disabled" || controller.status === "unsupported" || controller.status === "error";
};

controller = createProbeController(createPaperEvidenceTool(), [], updateStatus);
enable.addEventListener("click", () => void controller.enable());
disable.addEventListener("click", () => controller.disable());
updateStatus();
window.addEventListener("pagehide", () => controller.teardown(), { once: true });
void controller.enable();
