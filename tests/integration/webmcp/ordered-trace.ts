export type TraceEventType =
  | "external-intent"
  | "origin-discovery"
  | "discovered-capability"
  | "tool-call"
  | "validated-result"
  | "rationale-derivation"
  | "focus-request"
  | "human-decision"
  | "mutation-result"
  | "audit-result"
  | "lifecycle-disable"
  | "fresh-inventory";

export interface BaseTraceEvent {
  step: number;
  type: TraceEventType;
  timestamp: string;
}

export interface ExternalIntentEvent extends BaseTraceEvent {
  type: "external-intent";
  intent: string;
}

export interface OriginDiscoveryEvent extends BaseTraceEvent {
  type: "origin-discovery";
  origin: string;
  expectedOriginKind: "paper" | "video";
}

export interface DiscoveredCapabilityEvent extends BaseTraceEvent {
  type: "discovered-capability";
  origin: string;
  toolName: string;
  readOnly: boolean;
}

export interface ToolCallEvent extends BaseTraceEvent {
  type: "tool-call";
  origin: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface ValidatedResultEvent extends BaseTraceEvent {
  type: "validated-result";
  origin: string;
  toolName: string;
  evidenceId: "paper.methods.final-analysis" | "video.transcript.calibration-drift";
  excerpt: string;
}

export interface RationaleDerivationEvent extends BaseTraceEvent {
  type: "rationale-derivation";
  derivedBy: "external-agent";
  sampleClaim: 34;
  derivationSummary: string;
}

export interface FocusRequestEvent extends BaseTraceEvent {
  type: "focus-request";
  origin: string;
  paperEvidenceId: "paper.methods.final-analysis";
  videoEvidenceId: "video.transcript.calibration-drift";
  analyzedSample: 34;
  reasoning: string;
}

export interface HumanDecisionEvent extends BaseTraceEvent {
  type: "human-decision";
  decision: "confirm" | "reject";
  decidedBy: "human";
}

export interface MutationResultEvent extends BaseTraceEvent {
  type: "mutation-result";
  ok: boolean;
  citationStatus: "blocked" | "unblocked";
  hasDiscrepancyNote: boolean;
  noteId: string | null;
}

export interface AuditResultEvent extends BaseTraceEvent {
  type: "audit-result";
  auditCount: number;
  latestEvent: "focus-requested" | "focus-rejected" | "focus-confirmed";
  persisted: boolean;
}

export interface LifecycleDisableEvent extends BaseTraceEvent {
  type: "lifecycle-disable";
  disabledOrigins: string[];
}

export interface FreshInventoryEvent extends BaseTraceEvent {
  type: "fresh-inventory";
  observedToolCount: 0;
}

export type TraceEvent =
  | ExternalIntentEvent
  | OriginDiscoveryEvent
  | DiscoveredCapabilityEvent
  | ToolCallEvent
  | ValidatedResultEvent
  | RationaleDerivationEvent
  | FocusRequestEvent
  | HumanDecisionEvent
  | MutationResultEvent
  | AuditResultEvent
  | LifecycleDisableEvent
  | FreshInventoryEvent;

export interface TraceValidationResult {
  valid: boolean;
  errors: string[];
  reasons: string[];
}

function normalizedHttpOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function validateOrderedTrace(trace: TraceEvent[]): TraceValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(trace) || trace.length === 0) {
    return { valid: false, errors: ["Trace must be a non-empty array of events."], reasons: ["Empty trace"] };
  }

  // Step sequence integrity
  for (let i = 0; i < trace.length; i++) {
    if (trace[i].step !== i + 1) {
      errors.push(`Step index mismatch at index ${i}: expected step ${i + 1}, got ${trace[i].step}.`);
    }
  }

  // Check event indices
  const findIndices = (type: TraceEventType) =>
    trace.map((e, i) => (e.type === type ? i : -1)).filter((i) => i !== -1);

  const intentIndices = findIndices("external-intent");
  const discoveryIndices = findIndices("origin-discovery");
  const capabilityIndices = findIndices("discovered-capability");
  const callIndices = findIndices("tool-call");
  const resultIndices = findIndices("validated-result");
  const derivationIndices = findIndices("rationale-derivation");
  const focusIndices = findIndices("focus-request");
  const humanIndices = findIndices("human-decision");
  const mutationIndices = findIndices("mutation-result");
  const auditIndices = findIndices("audit-result");
  const disableIndices = findIndices("lifecycle-disable");
  const freshIndices = findIndices("fresh-inventory");

  const requireExactlyOne = (label: string, indices: number[]) => {
    if (indices.length !== 1) {
      errors.push(`Trace must contain exactly one ${label} event; found ${indices.length}.`);
    }
  };

  requireExactlyOne("external-intent", intentIndices);
  requireExactlyOne("rationale-derivation", derivationIndices);
  requireExactlyOne("focus-request", focusIndices);
  requireExactlyOne("human-decision", humanIndices);
  requireExactlyOne("mutation-result", mutationIndices);
  requireExactlyOne("audit-result", auditIndices);
  requireExactlyOne("lifecycle-disable", disableIndices);
  requireExactlyOne("fresh-inventory", freshIndices);
  if (capabilityIndices.length !== 2) errors.push(`Trace must contain exactly two discovered-capability events; found ${capabilityIndices.length}.`);
  if (callIndices.length !== 2) errors.push(`Trace must contain exactly two tool-call events; found ${callIndices.length}.`);

  let priorTimestamp = -Infinity;
  for (const event of trace) {
    const timestamp = Date.parse(event.timestamp);
    if (!Number.isFinite(timestamp) || timestamp <= priorTimestamp) {
      errors.push("Trace timestamps must be valid and strictly increasing.");
      break;
    }
    priorTimestamp = timestamp;
  }

  // Rule: Must start with external intent
  if (intentIndices.length === 0 || intentIndices[0] !== 0) {
    errors.push("Trace must begin with external-intent at step 1.");
  }

  // Rule: Must have both Paper and Video evidence results
  const discoveries = trace.filter((e): e is OriginDiscoveryEvent => e.type === "origin-discovery");
  const paperDiscoveries = discoveries.filter((event) => event.expectedOriginKind === "paper");
  const videoDiscoveries = discoveries.filter((event) => event.expectedOriginKind === "video");
  if (paperDiscoveries.length !== 1) {
    errors.push(`Trace must contain exactly one Paper origin-discovery event; found ${paperDiscoveries.length}.`);
  }
  if (videoDiscoveries.length !== 1) {
    errors.push(`Trace must contain exactly one Video origin-discovery event; found ${videoDiscoveries.length}.`);
  }
  if (discoveryIndices.length !== 2) {
    errors.push(`Trace must contain exactly two origin-discovery events; found ${discoveryIndices.length}.`);
  }

  const normalizedDiscoveryOrigins = new Map<OriginDiscoveryEvent, string>();
  for (const discovery of discoveries) {
    const origin = normalizedHttpOrigin(discovery.origin);
    if (origin) normalizedDiscoveryOrigins.set(discovery, origin);
    else errors.push(`${discovery.expectedOriginKind} origin-discovery must use a valid HTTP(S) URL.`);
  }

  const results = trace.filter((e): e is ValidatedResultEvent => e.type === "validated-result");
  const paperResult = results.find((r) => r.evidenceId === "paper.methods.final-analysis");
  const videoResult = results.find((r) => r.evidenceId === "video.transcript.calibration-drift");

  if (results.filter((r) => r.evidenceId === "paper.methods.final-analysis").length !== 1) {
    errors.push("Trace must contain exactly one Paper evidence result.");
  }
  if (results.filter((r) => r.evidenceId === "video.transcript.calibration-drift").length !== 1) {
    errors.push("Trace must contain exactly one Video evidence result.");
  }

  if (!paperResult) {
    errors.push("Missing Paper evidence result (paper.methods.final-analysis).");
  }
  if (!videoResult) {
    errors.push("Missing Video evidence result (video.transcript.calibration-drift).");
  }

  const normalizedResultOrigins = new Map<ValidatedResultEvent, string>();
  for (const result of results) {
    const origin = normalizedHttpOrigin(result.origin);
    if (origin) normalizedResultOrigins.set(result, origin);
    else errors.push(`${result.evidenceId} result must use a valid HTTP(S) URL.`);
  }

  const paperDiscoveryOrigin = paperDiscoveries.length === 1
    ? normalizedDiscoveryOrigins.get(paperDiscoveries[0])
    : undefined;
  const videoDiscoveryOrigin = videoDiscoveries.length === 1
    ? normalizedDiscoveryOrigins.get(videoDiscoveries[0])
    : undefined;
  const paperResultOrigin = paperResult ? normalizedResultOrigins.get(paperResult) : undefined;
  const videoResultOrigin = videoResult ? normalizedResultOrigins.get(videoResult) : undefined;

  if (paperDiscoveryOrigin && paperResultOrigin && paperDiscoveryOrigin !== paperResultOrigin) {
    errors.push("Paper evidence result origin must match the Paper origin-discovery event.");
  }
  if (videoDiscoveryOrigin && videoResultOrigin && videoDiscoveryOrigin !== videoResultOrigin) {
    errors.push("Video evidence result origin must match the Video origin-discovery event.");
  }

  // Rule: Normalized publisher origins must differ.
  if (
    (paperDiscoveryOrigin && videoDiscoveryOrigin && paperDiscoveryOrigin === videoDiscoveryOrigin)
    || (paperResultOrigin && videoResultOrigin && paperResultOrigin === videoResultOrigin)
  ) {
    errors.push("Paper and Video evidence must originate from distinct normalized origins.");
  }

  if (focusIndices.length === 1) {
    const focusRequest = trace[focusIndices[0]] as FocusRequestEvent;
    const focusOrigin = normalizedHttpOrigin(focusRequest.origin);
    if (!focusOrigin) {
      errors.push("Focus-request origin must use a valid HTTP(S) URL.");
    } else if (
      (paperDiscoveryOrigin && focusOrigin !== paperDiscoveryOrigin)
      || (paperResultOrigin && focusOrigin !== paperResultOrigin)
    ) {
      errors.push("Focus-request origin must match the Paper discovery and evidence origin.");
    }
  }

  for (const result of results) {
    const resultIndex = trace.indexOf(result);
    const callIndex = trace.findIndex((event) => event.type === "tool-call"
      && event.origin === result.origin
      && event.toolName === result.toolName);
    const capabilityIndex = trace.findIndex((event) => event.type === "discovered-capability"
      && event.origin === result.origin
      && event.toolName === result.toolName);
    const expectedKind = result.evidenceId === "paper.methods.final-analysis" ? "paper" : "video";
    const discoveryIndex = trace.findIndex((event) => event.type === "origin-discovery"
      && event.origin === result.origin
      && event.expectedOriginKind === expectedKind);
    if (discoveryIndex < 0 || capabilityIndex < 0 || callIndex < 0) {
      errors.push(`Evidence result ${result.evidenceId} must link to matching discovery, capability, and tool-call events.`);
    } else if (!(discoveryIndex < capabilityIndex && capabilityIndex < callIndex && callIndex < resultIndex)) {
      errors.push(`Evidence result ${result.evidenceId} has an invalid discovery-to-result order.`);
    }
  }

  // Rule: Paper & Video results must precede external derivation
  if (derivationIndices.length === 0) {
    errors.push("Missing rationale-derivation event.");
  } else {
    const derivationIndex = derivationIndices[0];
    const derivation = trace[derivationIndex] as RationaleDerivationEvent;

    if (derivation.derivedBy !== "external-agent") {
      errors.push("Derivation must be produced by external-agent, not a publisher tool.");
    }
    if (derivation.sampleClaim !== 34) {
      errors.push("External derivation must compute exactly sample 34.");
    }

    if (paperResult) {
      const paperIndex = trace.indexOf(paperResult);
      if (paperIndex > derivationIndex) {
        errors.push("Paper evidence must precede rationale-derivation.");
      }
    }
    if (videoResult) {
      const videoIndex = trace.indexOf(videoResult);
      if (videoIndex > derivationIndex) {
        errors.push("Video evidence must precede rationale-derivation.");
      }
    }
  }

  // Rule: Derivation must precede focus request
  if (focusIndices.length === 0) {
    errors.push("Missing focus-request event.");
  } else if (derivationIndices.length > 0) {
    if (focusIndices[0] < derivationIndices[0]) {
      errors.push("Rationale-derivation must precede focus-request.");
    }
  }

  // Rule: Focus request must precede human decision
  if (humanIndices.length === 0) {
    errors.push("Missing human-decision event.");
  } else if (focusIndices.length > 0) {
    if (humanIndices[0] < focusIndices[0]) {
      errors.push("Focus-request must precede human-decision.");
    }
  }

  // Rule: Human confirmation must precede mutation
  if (mutationIndices.length === 0) {
    errors.push("Missing mutation-result event.");
  } else if (humanIndices.length > 0) {
    const humanEvent = trace[humanIndices[0]] as HumanDecisionEvent;
    if (humanEvent.decidedBy !== "human") {
      errors.push("Decision must be confirmed by human, not an agent.");
    }
    if (mutationIndices[0] < humanIndices[0]) {
      errors.push("Human-decision must precede mutation-result.");
    }
    const mutation = trace[mutationIndices[0]] as MutationResultEvent;
    if (!mutation.ok) {
      errors.push("Mutation result must record a successful state transition.");
    }
    if (humanEvent.decision === "confirm" && mutation.citationStatus !== "blocked") {
      errors.push("Confirmed focus proposal must mutate citationStatus to blocked.");
    }
    if (humanEvent.decision === "confirm" && (!mutation.hasDiscrepancyNote || mutation.noteId !== "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift")) {
      errors.push("Confirmed focus proposal must persist exactly one linked discrepancy note.");
    }
    if (humanEvent.decision === "reject" && mutation.citationStatus !== "unblocked") {
      errors.push("Rejected focus proposal must leave citationStatus unblocked.");
    }
    if (humanEvent.decision === "reject" && (mutation.hasDiscrepancyNote || mutation.noteId !== null)) {
      errors.push("Rejected focus proposal must not create a discrepancy note.");
    }
  }

  // Rule: Mutation must precede a successful, matching persisted audit event.
  if (auditIndices.length > 0 && mutationIndices.length > 0) {
    if (auditIndices[0] < mutationIndices[0]) {
      errors.push("Mutation-result must precede audit-result.");
    }
    const audit = trace[auditIndices[0]] as AuditResultEvent;
    const human = humanIndices.length > 0 ? trace[humanIndices[0]] as HumanDecisionEvent : null;
    const expectedLatestEvent = human?.decision === "confirm" ? "focus-confirmed" : "focus-rejected";
    if (!audit.persisted || audit.auditCount < 2 || audit.latestEvent !== expectedLatestEvent) {
      errors.push("Audit-result must prove the matching persisted human decision.");
    }
  }

  // Rule: Kill switch (lifecycle-disable) must precede fresh zero inventory
  if (disableIndices.length > 0 && freshIndices.length > 0) {
    if (auditIndices.length > 0 && disableIndices[0] < auditIndices[0]) {
      errors.push("Audit-result must precede lifecycle-disable.");
    }
    if (freshIndices[0] < disableIndices[0]) {
      errors.push("Lifecycle-disable must precede fresh-inventory.");
    }
    const disableEvent = trace[disableIndices[0]] as LifecycleDisableEvent;
    if (paperResult && !disableEvent.disabledOrigins.includes(paperResult.origin)) {
      errors.push("Lifecycle-disable must include the Paper origin.");
    }
    if (videoResult && !disableEvent.disabledOrigins.includes(videoResult.origin)) {
      errors.push("Lifecycle-disable must include the Video origin.");
    }
    if (new Set(disableEvent.disabledOrigins).size !== disableEvent.disabledOrigins.length) {
      errors.push("Lifecycle-disable origins must be unique.");
    }
    const expectedOrigins = new Set(results.map((result) => result.origin));
    if (disableEvent.disabledOrigins.length !== expectedOrigins.size
      || disableEvent.disabledOrigins.some((origin) => !expectedOrigins.has(origin))) {
      errors.push("Lifecycle-disable must contain exactly the observed Paper and Video origins.");
    }
    const freshEvent = trace[freshIndices[0]] as FreshInventoryEvent;
    if (freshEvent.observedToolCount !== 0) {
      errors.push("Fresh inventory after disable must observe zero tools.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    reasons: errors
  };
}
