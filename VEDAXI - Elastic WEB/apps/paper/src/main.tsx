import { createRoot } from "react-dom/client";

import { PaperApp } from "./paper/PaperApp";
import { createPaperEvidenceService, createPaperEvidenceTool, createPaperFixture } from "./paper";
import { usePaperRegistration } from "./paper/use-paper-registration";
import "./styles.css";

const root = document.querySelector<HTMLElement>("#root");

if (!root) {
  throw new Error("Paper application root is missing");
}

const fixture = createPaperFixture(window.location.origin);
const service = createPaperEvidenceService(fixture.evidence);
const tool = createPaperEvidenceTool(service);

function PaperRoot() {
  const protocol = usePaperRegistration(tool);
  return <PaperApp fixture={fixture} service={service} protocol={protocol} />;
}

createRoot(root).render(<PaperRoot />);
