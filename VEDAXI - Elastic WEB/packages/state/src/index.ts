export type CitationStatus = "unblocked" | "blocked";

export interface FocusProvenance {
  paper: string;
  video: string;
  derivation: string;
}

export interface FocusRequest {
  paperEvidenceId: "paper.methods.final-analysis";
  videoEvidenceId: "video.transcript.calibration-drift";
  analyzedSample: 34;
  reasoning: string;
  provenance: FocusProvenance;
}

export interface Confirmation {
  confirmedBy: "human" | "webmcp";
}

export interface DiscrepancyNote extends FocusRequest {
  id: string;
}

export type AuditEvent =
  | { type: "focus-requested" }
  | { type: "focus-rejected" }
  | { type: "focus-confirmed"; confirmedBy: Confirmation["confirmedBy"] };

export interface PublisherState {
  citationStatus: CitationStatus;
  discrepancyNote: DiscrepancyNote | null;
  focusProposal: FocusRequest | null;
  auditEvents: AuditEvent[];
}

export type PublisherAction =
  | { type: "request-focus"; request: FocusRequest }
  | { type: "reject-focus" }
  | { type: "confirm-focus"; confirmation: Confirmation }
  | { type: "reset" };

export interface PublisherSuccess {
  ok: true;
  state: PublisherState;
}

export interface PublisherFailure {
  ok: false;
  code:
    | "citation-already-blocked"
    | "focus-already-proposed"
    | "invalid-action"
    | "invalid-confirmation"
    | "invalid-focus-request"
    | "no-focus-proposal"
    | "persistence-failed"
    | "rehydration-failed";
  recoverable: true;
}

export type PublisherResult = PublisherSuccess | PublisherFailure;

export interface PublisherStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface PublisherStore {
  getState(): PublisherState;
  dispatch(action: PublisherAction): PublisherResult;
  rehydrate(): PublisherResult;
}

const STORAGE_KEY = "vedaxi.publisher-state.v1";

const initialState = (): PublisherState => ({
  citationStatus: "unblocked",
  discrepancyNote: null,
  focusProposal: null,
  auditEvents: []
});

const failure = (code: PublisherFailure["code"]): PublisherFailure => ({
  ok: false,
  code,
  recoverable: true
});

function cloneFocus(request: FocusRequest): FocusRequest {
  return { ...request, provenance: { ...request.provenance } };
}

function cloneState(state: PublisherState): PublisherState {
  return {
    citationStatus: state.citationStatus,
    discrepancyNote: state.discrepancyNote
      ? { ...cloneFocus(state.discrepancyNote), id: state.discrepancyNote.id }
      : null,
    focusProposal: state.focusProposal && cloneFocus(state.focusProposal),
    auditEvents: state.auditEvents.map((event) => ({ ...event }))
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidFocusRequest(value: unknown): value is FocusRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<FocusRequest>;
  return (
    request.paperEvidenceId === "paper.methods.final-analysis" &&
    request.videoEvidenceId === "video.transcript.calibration-drift" &&
    request.analyzedSample === 34 &&
    isNonEmptyString(request.reasoning) &&
    request.reasoning.length <= 280 &&
    !!request.provenance &&
    isNonEmptyString(request.provenance.paper) &&
    isNonEmptyString(request.provenance.video) &&
    isNonEmptyString(request.provenance.derivation)
  );
}

function isValidConfirmation(value: unknown): value is Confirmation {
  return (
    !!value &&
    typeof value === "object" &&
    ((value as Partial<Confirmation>).confirmedBy === "human" ||
      (value as Partial<Confirmation>).confirmedBy === "webmcp")
  );
}

function isValidAuditEvent(value: unknown): value is AuditEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<AuditEvent>;
  return (
    event.type === "focus-requested" ||
    event.type === "focus-rejected" ||
    (event.type === "focus-confirmed" &&
      (event.confirmedBy === "human" || event.confirmedBy === "webmcp"))
  );
}

function isValidAuditSequence(
  events: AuditEvent[],
  citationStatus: unknown,
  hasFocusProposal: boolean
): boolean {
  let index = 0;
  while (
    events[index]?.type === "focus-requested" &&
    events[index + 1]?.type === "focus-rejected"
  ) {
    index += 2;
  }

  const remaining = events.length - index;
  if (remaining === 0) return citationStatus === "unblocked" && !hasFocusProposal;
  if (remaining === 1) {
    return (
      events[index]?.type === "focus-requested" &&
      citationStatus === "unblocked" &&
      hasFocusProposal
    );
  }
  return (
    remaining === 2 &&
    events[index]?.type === "focus-requested" &&
    events[index + 1]?.type === "focus-confirmed" &&
    citationStatus === "blocked" &&
    !hasFocusProposal
  );
}

function isValidState(value: unknown): value is PublisherState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PublisherState>;
  if (!Array.isArray(state.auditEvents) || !state.auditEvents.every(isValidAuditEvent)) return false;
  if (!isValidAuditSequence(state.auditEvents, state.citationStatus, state.focusProposal !== null)) return false;
  const unblocked = state.citationStatus === "unblocked" && state.discrepancyNote === null;
  const blocked =
    state.citationStatus === "blocked" &&
    state.focusProposal === null &&
    !!state.discrepancyNote &&
    isValidFocusRequest(state.discrepancyNote) &&
    state.discrepancyNote.id ===
      `discrepancy:${state.discrepancyNote.paperEvidenceId}:${state.discrepancyNote.videoEvidenceId}`;
  return (
    (unblocked || blocked) &&
    (state.focusProposal === null || isValidFocusRequest(state.focusProposal))
  );
}

function persisted(nextState: PublisherState, storage: PublisherStorage | undefined): boolean {
  if (!storage) return true;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return true;
  } catch {
    return false;
  }
}

export function createPublisherStore(storage?: PublisherStorage): PublisherStore {
  let state = initialState();

  const commit = (nextState: PublisherState): PublisherResult => {
    if (!persisted(nextState, storage)) return failure("persistence-failed");
    state = nextState;
    return { ok: true, state: cloneState(state) };
  };

  return {
    getState: () => cloneState(state),
    dispatch: (action) => {
      if (!action || typeof action !== "object") return failure("invalid-action");

      if (action.type === "request-focus") {
        if (!isValidFocusRequest(action.request)) return failure("invalid-focus-request");
        if (state.focusProposal) return failure("focus-already-proposed");
        if (state.citationStatus === "blocked") return failure("citation-already-blocked");
        return commit({
          ...state,
          focusProposal: cloneFocus(action.request),
          auditEvents: [...state.auditEvents, { type: "focus-requested" }]
        });
      }

      if (action.type === "reject-focus") {
        return commit({
          ...state,
          focusProposal: null,
          auditEvents: state.focusProposal
            ? [...state.auditEvents, { type: "focus-rejected" }]
            : state.auditEvents
        });
      }

      if (action.type === "confirm-focus") {
        if (!state.focusProposal) return failure("no-focus-proposal");
        if (!isValidConfirmation(action.confirmation)) return failure("invalid-confirmation");
        const proposal = state.focusProposal;
        return commit({
          citationStatus: "blocked",
          focusProposal: null,
          discrepancyNote: {
            ...cloneFocus(proposal),
            id: `discrepancy:${proposal.paperEvidenceId}:${proposal.videoEvidenceId}`
          },
          auditEvents: [
            ...state.auditEvents,
            { type: "focus-confirmed", confirmedBy: action.confirmation.confirmedBy }
          ]
        });
      }

      if (action.type === "reset") return commit(initialState());

      return failure("invalid-action");
    },
    rehydrate: () => {
      if (!storage) return { ok: true, state: cloneState(state) };
      try {
        const saved = storage.getItem(STORAGE_KEY);
        if (saved === null) return { ok: true, state: cloneState(state) };
        const parsed: unknown = JSON.parse(saved);
        if (!isValidState(parsed)) return failure("rehydration-failed");
        state = cloneState(parsed);
        return { ok: true, state: cloneState(state) };
      } catch {
        return failure("rehydration-failed");
      }
    }
  };
}
