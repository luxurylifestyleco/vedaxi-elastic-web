import { createProbeController, type ProbeController } from "../../shared/probe-controller";
import { VIDEO_ORIGIN } from "../../shared/origins";
import { createVideoEvidenceTool, videoRegistrationOrigins, VIDEO_EVIDENCE } from "../video-probe";

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
const heading = element("h1", "VEDAXI video protocol probe");
const origin = element("p", `Publisher origin: ${VIDEO_ORIGIN}. Runtime origin: ${window.location.origin}.`);
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
const transcriptHeading = element("h2", "Transcript evidence");
const transcript = element("p", VIDEO_EVIDENCE.excerpt);
const provenance = element("p", `Provenance: ${VIDEO_EVIDENCE.locator} — ${VIDEO_EVIDENCE.provenance}`);

page.append(heading, origin, secureContext, status, nativeError, controls, transcriptHeading, transcript, provenance);
appRoot.replaceChildren(page);

let controller: ProbeController;
const updateStatus = () => {
  status.textContent = `Registration/UI state: ${controller.status}`;
  nativeError.textContent = `Native registration error: ${controller.error ?? "none"}`;
  enable.disabled = controller.status === "checking" || controller.status === "active";
  disable.disabled = controller.status === "disabled" || controller.status === "unsupported" || controller.status === "error";
};

controller = createProbeController(createVideoEvidenceTool(), videoRegistrationOrigins, updateStatus);
enable.addEventListener("click", () => void controller.enable());
disable.addEventListener("click", () => controller.disable());
updateStatus();
window.addEventListener("pagehide", () => controller.teardown(), { once: true });
void controller.enable();
