import type { WebMcpTool } from "@vedaxi/contracts";
import type {
  FocusRequest,
  PublisherAction,
  PublisherFailure,
  PublisherResult
} from "@vedaxi/state";

import { requestFocusAction } from "../actions";

const MAX_TEXT_LENGTH = 280;
const REQUEST_KEYS = [
  "paperEvidenceId",
  "videoEvidenceId",
  "analyzedSample",
  "reasoning",
  "provenance"
] as const;
const PROVENANCE_KEYS = ["paper", "video", "derivation"] as const;

type PublisherDispatch = (action: PublisherAction) => PublisherResult;

function exactObject(
  value: unknown,
  keys: readonly string[],
  label: string
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Focus request input ${label} must be an object.`);
  }
  const fields = value as Record<string, unknown>;
  const actualKeys = Object.keys(fields);
  if (actualKeys.length !== keys.length || actualKeys.some((key) => !keys.includes(key))) {
    throw new Error(`Focus request input ${label} must contain only ${keys.join(", ")}.`);
  }
  return fields;
}

function boundedText(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > MAX_TEXT_LENGTH) {
    throw new Error(
      `Focus request input ${label} must be non-blank and at most ${MAX_TEXT_LENGTH} characters.`
    );
  }
  return value;
}

function validateInput(input: unknown): FocusRequest {
  const fields = exactObject(input, REQUEST_KEYS, "object");
  if (fields.paperEvidenceId !== "paper.methods.final-analysis") {
    throw new Error("Focus request input paperEvidenceId must match the controlled paper evidence ID.");
  }
  if (fields.videoEvidenceId !== "video.transcript.calibration-drift") {
    throw new Error("Focus request input videoEvidenceId must match the controlled video evidence ID.");
  }
  if (fields.analyzedSample !== 34) {
    throw new Error("Focus request input analyzedSample must be the externally derived value 34.");
  }
  const provenance = exactObject(fields.provenance, PROVENANCE_KEYS, "provenance");
  return {
    paperEvidenceId: fields.paperEvidenceId,
    videoEvidenceId: fields.videoEvidenceId,
    analyzedSample: fields.analyzedSample,
    reasoning: boundedText(fields.reasoning, "reasoning"),
    provenance: {
      paper: boundedText(provenance.paper, "provenance.paper"),
      video: boundedText(provenance.video, "provenance.video"),
      derivation: boundedText(provenance.derivation, "provenance.derivation")
    }
  };
}

function failureMessage(code: PublisherFailure["code"]): string {
  if (code === "focus-already-proposed") {
    return "Focus request failed: review or reject the existing pending proposal first.";
  }
  if (code === "citation-already-blocked") {
    return "Focus request failed: reset the blocked citation review before requesting another focus.";
  }
  if (code === "persistence-failed") {
    return "Focus request failed: publisher storage could not save the proposal; fix storage and retry.";
  }
  if (code === "invalid-focus-request") {
    return "Focus request failed: check the controlled evidence IDs, analyzed sample, and text fields.";
  }
  return `Focus request failed (${code}): review the current publisher state and retry.`;
}

export function createDiscrepancyFocusTool(dispatch: PublisherDispatch): WebMcpTool {
  return {
    name: "request_discrepancy_focus",
    title: "Request discrepancy focus",
    description:
      "Submit an externally derived paper/video discrepancy for explicit human confirmation. Does not confirm or block the citation.",
    inputSchema: {
      type: "object",
      properties: {
        paperEvidenceId: {
          type: "string",
          const: "paper.methods.final-analysis",
          description: "Exact paper evidence ID to focus."
        },
        videoEvidenceId: {
          type: "string",
          const: "video.transcript.calibration-drift",
          description: "Exact video evidence ID to focus."
        },
        analyzedSample: {
          type: "integer",
          const: 34,
          description: "Externally derived analyzed sample; this tool does not compute it."
        },
        reasoning: {
          type: "string",
          minLength: 1,
          maxLength: MAX_TEXT_LENGTH,
          pattern: "\\S",
          description: "Concise external reasoning for human review."
        },
        provenance: {
          type: "object",
          description: "External provenance for the paper, video, and derivation.",
          properties: {
            paper: {
              type: "string",
              minLength: 1,
              maxLength: MAX_TEXT_LENGTH,
              pattern: "\\S",
              description: "Paper evidence provenance."
            },
            video: {
              type: "string",
              minLength: 1,
              maxLength: MAX_TEXT_LENGTH,
              pattern: "\\S",
              description: "Video evidence provenance."
            },
            derivation: {
              type: "string",
              minLength: 1,
              maxLength: MAX_TEXT_LENGTH,
              pattern: "\\S",
              description: "Provenance of the external derivation."
            }
          },
          required: PROVENANCE_KEYS,
          additionalProperties: false
        }
      },
      required: REQUEST_KEYS,
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute: async (input) => {
      const result = dispatch(requestFocusAction(validateInput(input)));
      if (!result.ok) throw new Error(failureMessage(result.code));
      return {
        status: "pending-human-confirmation",
        citationStatus: result.state.citationStatus
      };
    }
  };
}
