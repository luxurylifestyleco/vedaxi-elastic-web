import { describe, expect, it, vi } from "vitest";
import type { WebMcpRegistration, WebMcpTool } from "@vedaxi/contracts";
import { createPublisherStore, type FocusRequest, type PublisherStorage } from "@vedaxi/state";

import {
  createDiscrepancyFocusTool,
  createPaperEvidenceService,
  createPaperEvidenceTool,
  createPaperFixture
} from "../../../apps/paper/src/paper";
import {
  PaperRegistrationController,
  type PaperToolRegistrar,
  type PaperTools
} from "../../../apps/paper/src/paper/use-paper-registration";

import {
  createVideoEvidenceService,
  createVideoFixture,
  createVideoSearchTool,
  createVideoTranscriptTool
} from "../../../apps/video/src/video";
import { VideoRegistrationController } from "../../../apps/video/src/video/use-video-registration";

import {
  validateOrderedTrace,
  type DiscoveredCapabilityEvent,
  type OriginDiscoveryEvent,
  type TraceEvent,
  type ValidatedResultEvent
} from "./ordered-trace";

const PAPER_ORIGIN = "https://paper.example.test";
const VIDEO_ORIGIN = "https://video.example.test";

const validFocusRequest: FocusRequest = {
  paperEvidenceId: "paper.methods.final-analysis",
  videoEvidenceId: "video.transcript.calibration-drift",
  analyzedSample: 34,
  reasoning: "The video excludes six of the paper's forty reported participants.",
  provenance: {
    paper: "VEDAXI controlled paper fixture — Methods, participants",
    video: "VEDAXI controlled video fixture — transcript cue at 00:03:12",
    derivation: "Externally supplied comparison: 40 - 6 = 34"
  }
};

function memoryStorage(): PublisherStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value); }
  };
}

async function settleRegistration(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("M5 WebMCP Adapters & Lifecycle", () => {
  describe("Paper Registration Adapter", () => {
    it("composes read-only evidence tool and discrepancy focus mutation tool", () => {
      const paperFixture = createPaperFixture(PAPER_ORIGIN);
      const paperService = createPaperEvidenceService(paperFixture.evidence);
      const store = createPublisherStore();

      const tools = [
        createPaperEvidenceTool(paperService),
        createDiscrepancyFocusTool(store.dispatch)
      ] as const;
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.name)).toEqual(["search_paper_evidence", "request_discrepancy_focus"]);
      expect(tools[0].annotations?.readOnlyHint).toBe(true);
      expect(tools[1].annotations?.readOnlyHint).toBe(false);
    });

    it("executes search query returning paper evidence without derived discrepancy", async () => {
      const paperFixture = createPaperFixture(PAPER_ORIGIN);
      const paperService = createPaperEvidenceService(paperFixture.evidence);
      const store = createPublisherStore();
      const tools = [
        createPaperEvidenceTool(paperService),
        createDiscrepancyFocusTool(store.dispatch)
      ] as const;

      const searchTool = tools.find((t) => t.name === "search_paper_evidence")!;
      const result = (await searchTool.execute({ query: "final analysis participants" })) as Array<{
        evidence: { id: string; excerpt: string };
      }>;

      expect(result).toHaveLength(1);
      expect(result[0].evidence.id).toBe("paper.methods.final-analysis");
      expect(result[0].evidence.excerpt).toContain("Forty participants");
      expect(JSON.stringify(result)).not.toMatch(/(?:\b34\b|contradiction|discrepancy)/i);
    });

    it("routes focus mutation tool through M3 publisher store and never auto-confirms", async () => {
      const paperFixture = createPaperFixture(PAPER_ORIGIN);
      const paperService = createPaperEvidenceService(paperFixture.evidence);
      const storage = memoryStorage();
      const store = createPublisherStore(storage);
      const tools = [
        createPaperEvidenceTool(paperService),
        createDiscrepancyFocusTool(store.dispatch)
      ] as const;

      const focusTool = tools.find((t) => t.name === "request_discrepancy_focus")!;
      const result = await focusTool.execute({ ...validFocusRequest });

      expect(result).toEqual({
        status: "pending-human-confirmation",
        citationStatus: "unblocked"
      });

      // Verify that citation status is NOT mutated to blocked until human confirms
      expect(store.getState().citationStatus).toBe("unblocked");
      expect(store.getState().focusProposal).toEqual(validFocusRequest);
      expect(store.getState().discrepancyNote).toBeNull();

      // Now explicit human confirmation completes the mutation
      const confirmResult = store.dispatch({ type: "confirm-focus", confirmation: { confirmedBy: "human" } });
      expect(confirmResult.ok).toBe(true);
      expect(store.getState().citationStatus).toBe("blocked");
      expect(store.getState().discrepancyNote).not.toBeNull();

      const rehydratedStore = createPublisherStore(storage);
      expect(rehydratedStore.rehydrate()).toMatchObject({ ok: true });
      expect(rehydratedStore.getState()).toMatchObject({
        citationStatus: "blocked",
        discrepancyNote: {
          id: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
        },
        auditEvents: [
          { type: "focus-requested" },
          { type: "focus-confirmed", confirmedBy: "human" }
        ]
      });
    });

    it("supports renamed tool metadata without breaking execution semantics", async () => {
      const paperFixture = createPaperFixture(PAPER_ORIGIN);
      const paperService = createPaperEvidenceService(paperFixture.evidence);
      const store = createPublisherStore();

      const tools = [
        createDiscrepancyFocusTool(store.dispatch),
        createPaperEvidenceTool(paperService, {
          name: "find_paper_methods_evidence",
          title: "Find paper methods evidence"
        })
      ] as const;

      const renamedSearch = tools.find((tool) => tool.name === "find_paper_methods_evidence")!;
      const result = (await renamedSearch.execute({ query: "final analysis" })) as unknown[];
      expect(result).toHaveLength(1);
    });

    it("manages enable, disable, and teardown lifecycle faithfully", async () => {
      const paperFixture = createPaperFixture(PAPER_ORIGIN);
      const paperService = createPaperEvidenceService(paperFixture.evidence);
      const store = createPublisherStore();

      const mockRegister = vi.fn(async () => ({
        registrationStatus: "registered" as const,
        uiStatus: "active" as const,
        disable: vi.fn(() => "disabled" as const)
      }));

      const statuses: string[] = [];
      const tools = [
        createPaperEvidenceTool(paperService),
        createDiscrepancyFocusTool(store.dispatch)
      ] as const;
      const controller = new PaperRegistrationController(
        tools,
        (status) => statuses.push(status),
        mockRegister as unknown as PaperToolRegistrar
      );

      expect(controller.status).toBe("checking");
      controller.enable();
      await settleRegistration();
      expect(controller.status).toBe("active");
      expect(mockRegister).toHaveBeenCalledTimes(1);

      controller.disable();
      expect(controller.status).toBe("disabled");

      controller.teardown();
      expect(controller.status).toBe("disabled");
      expect(statuses).toEqual(["checking", "active", "disabled"]);
    });
  });

  describe("Video Registration Adapter", () => {
    it("composes Video read-only tools without importing Paper or state internals", () => {
      const videoFixture = createVideoFixture(VIDEO_ORIGIN);
      const videoService = createVideoEvidenceService(videoFixture);

      const tools = [createVideoSearchTool(videoService), createVideoTranscriptTool(videoService)];
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.name)).toEqual(["search_video_evidence", "read_video_transcript"]);
      expect(tools[0].annotations?.readOnlyHint).toBe(true);
      expect(tools[1].annotations?.readOnlyHint).toBe(true);
    });

    it("executes video transcript read and search with exact evidence and provenance only", async () => {
      const videoFixture = createVideoFixture(VIDEO_ORIGIN);
      const videoService = createVideoEvidenceService(videoFixture);
      const tools = [createVideoSearchTool(videoService), createVideoTranscriptTool(videoService)];

      const searchTool = tools.find((t) => t.name === "search_video_evidence")!;
      const searchResult = (await searchTool.execute({ query: "six calibration drift" })) as Array<{
        evidence: { id: string; excerpt: string; sourceOrigin: string };
      }>;

      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].evidence.id).toBe("video.transcript.calibration-drift");
      expect(searchResult[0].evidence.sourceOrigin).toBe(VIDEO_ORIGIN);
      expect(searchResult[0].evidence.excerpt).toContain("Six sessions had calibration drift");
      expect(JSON.stringify(searchResult)).not.toMatch(/(?:\b34\b|contradiction|discrepancy)/i);

      const readTool = tools.find((t) => t.name === "read_video_transcript")!;
      const readResult = (await readTool.execute({})) as {
        evidence: { id: string };
        cues: Array<{ start: number; text: string }>;
      };
      expect(readResult.evidence.id).toBe("video.transcript.calibration-drift");
      expect(readResult.cues[0].text).toContain("Six sessions");
    });

    it("manages video adapter lifecycle transitions cleanly", async () => {
      const videoFixture = createVideoFixture(VIDEO_ORIGIN);
      const videoService = createVideoEvidenceService(videoFixture);

      const mockRegister = vi.fn(async () => ({
        registrationStatus: "registered" as const,
        uiStatus: "active" as const,
        disable: vi.fn(() => "disabled" as const)
      }));

      const statuses: string[] = [];
      const tools = [createVideoSearchTool(videoService), createVideoTranscriptTool(videoService)];
      const controller = new VideoRegistrationController(
        tools,
        (status) => statuses.push(status),
        mockRegister
      );
      expect(controller.status).toBe("checking");

      controller.enable();
      await settleRegistration();
      expect(controller.status).toBe("active");

      controller.disable();
      expect(controller.status).toBe("disabled");
      expect(statuses).toEqual(["checking", "active", "disabled"]);
    });
  });

  describe("Kill Switch & Zero Inventory", () => {
    it("disables all tools cleanly and fresh observation yields zero active registrations", async () => {
      const activeTools = new Set<string>();

      const mockRegister = vi.fn(async (tools: WebMcpTool[]) => {
        tools.forEach((t) => activeTools.add(t.name));
        return {
          registrationStatus: "registered" as const,
          uiStatus: "active" as const,
          disable: () => {
            tools.forEach((t) => activeTools.delete(t.name));
            return "disabled" as const;
          }
        };
      });

      const paperService = createPaperEvidenceService(createPaperFixture(PAPER_ORIGIN).evidence);
      const paperTools = [
        createPaperEvidenceTool(paperService),
        createDiscrepancyFocusTool(vi.fn())
      ] as const satisfies PaperTools;
      const videoService = createVideoEvidenceService(createVideoFixture(VIDEO_ORIGIN));
      const videoTools = [createVideoSearchTool(videoService), createVideoTranscriptTool(videoService)];
      const paperController = new PaperRegistrationController(
        paperTools,
        vi.fn(),
        mockRegister as unknown as PaperToolRegistrar
      );
      const videoController = new VideoRegistrationController(
        videoTools,
        vi.fn(),
        mockRegister
      );

      paperController.enable();
      videoController.enable();
      await settleRegistration();
      expect(activeTools.size).toBe(4);

      // Kill switch: disable both
      paperController.disable();
      videoController.disable();

      // Fresh observation must yield 0 active tools
      expect(activeTools.size).toBe(0);
      expect(paperController.status).toBe("disabled");
      expect(videoController.status).toBe("disabled");
    });

    it("preserves atomic rollback in publisher store when storage persistence fails during focus tool dispatch", async () => {
      let failWrites = false;
      const failingStorage: PublisherStorage = {
        getItem: () => null,
        setItem: () => {
          if (failWrites) throw new Error("Disk write failed");
        }
      };

      const store = createPublisherStore(failingStorage);
      const paperFixture = createPaperFixture(PAPER_ORIGIN);
      const paperService = createPaperEvidenceService(paperFixture.evidence);
      const tools = [
        createPaperEvidenceTool(paperService),
        createDiscrepancyFocusTool(store.dispatch)
      ] as const;
      const focusTool = tools.find((t) => t.name === "request_discrepancy_focus")!;

      // Normal dispatch works
      await focusTool.execute({ ...validFocusRequest });
      expect(store.getState().focusProposal).not.toBeNull();

      // Now reset and fail writes
      store.dispatch({ type: "reset" });
      failWrites = true;

      // Tool dispatch throws on storage failure and state rolls back cleanly
      await expect(
        focusTool.execute({ ...validFocusRequest })
      ).rejects.toThrow("publisher storage could not save the proposal");

      expect(store.getState().focusProposal).toBeNull();
      expect(store.getState().citationStatus).toBe("unblocked");
    });

    it("handles unsupported native WebMCP without fallback mutation or errors", async () => {
      const mockUnsupportedRegister = vi.fn(async () => ({
        registrationStatus: "unsupported" as const,
        uiStatus: "unsupported" as const,
        disable: () => "unsupported" as const
      }));

      const service = createPaperEvidenceService(createPaperFixture(PAPER_ORIGIN).evidence);
      const tools = [
        createPaperEvidenceTool(service),
        createDiscrepancyFocusTool(vi.fn())
      ] as const;
      const controller = new PaperRegistrationController(
        tools,
        vi.fn(),
        mockUnsupportedRegister as unknown as PaperToolRegistrar
      );

      controller.enable();
      await settleRegistration();
      expect(controller.status).toBe("unsupported");
    });

    it("prevents stale registration completion from overriding subsequent disable", async () => {
      let resolveSlowRegistration: ((reg: WebMcpRegistration) => void) | null = null;
      const mockSlowRegister = vi.fn(
        () =>
          new Promise<WebMcpRegistration>((resolve) => {
            resolveSlowRegistration = resolve;
          })
      );

      const service = createPaperEvidenceService(createPaperFixture(PAPER_ORIGIN).evidence);
      const tools = [
        createPaperEvidenceTool(service),
        createDiscrepancyFocusTool(vi.fn())
      ] as const;
      const controller = new PaperRegistrationController(
        tools,
        vi.fn(),
        mockSlowRegister as unknown as PaperToolRegistrar
      );

      controller.enable();
      expect(controller.status).toBe("checking");
      const signal = (mockSlowRegister.mock.calls[0] as unknown as Parameters<PaperToolRegistrar>)[2]?.lifecycleSignal;

      // User immediately disables before slow registration completes
      controller.disable();
      expect(controller.status).toBe("disabled");
      expect(signal?.aborted).toBe(true);

      // Late registration completes
      const mockDisable = vi.fn(() => "disabled" as const);
      resolveSlowRegistration!({
        registrationStatus: "registered",
        uiStatus: "active",
        disable: mockDisable
      });

      await settleRegistration();

      // Status must remain disabled, stale active status must not resurrect
      expect(controller.status).toBe("disabled");
      expect(mockDisable).toHaveBeenCalled();
    });
  });
});

describe("Deterministic Ordered Trace Validator", () => {
  function findOriginDiscovery(trace: TraceEvent[], kind: OriginDiscoveryEvent["expectedOriginKind"]): OriginDiscoveryEvent {
    const event = trace.find(
      (candidate): candidate is OriginDiscoveryEvent =>
        candidate.type === "origin-discovery" && candidate.expectedOriginKind === kind
    );
    if (!event) throw new Error(`Missing ${kind} origin-discovery fixture event`);
    return event;
  }

  function findValidatedResult(trace: TraceEvent[], evidenceId: ValidatedResultEvent["evidenceId"]): ValidatedResultEvent {
    const event = trace.find(
      (candidate): candidate is ValidatedResultEvent =>
        candidate.type === "validated-result" && candidate.evidenceId === evidenceId
    );
    if (!event) throw new Error(`Missing ${evidenceId} validated-result fixture event`);
    return event;
  }

  function validGoldenTrace(): TraceEvent[] {
    return [
      {
        step: 1,
        type: "external-intent",
        timestamp: "2026-08-31T12:00:00Z",
        intent: "Audit participants cohort for potential calibration discrepancy"
      },
      {
        step: 2,
        type: "origin-discovery",
        timestamp: "2026-08-31T12:00:01Z",
        origin: PAPER_ORIGIN,
        expectedOriginKind: "paper"
      },
      {
        step: 3,
        type: "discovered-capability",
        timestamp: "2026-08-31T12:00:02Z",
        origin: PAPER_ORIGIN,
        toolName: "search_paper_evidence",
        readOnly: true
      },
      {
        step: 4,
        type: "tool-call",
        timestamp: "2026-08-31T12:00:03Z",
        origin: PAPER_ORIGIN,
        toolName: "search_paper_evidence",
        input: { query: "final analysis" }
      },
      {
        step: 5,
        type: "validated-result",
        timestamp: "2026-08-31T12:00:04Z",
        origin: PAPER_ORIGIN,
        toolName: "search_paper_evidence",
        evidenceId: "paper.methods.final-analysis",
        excerpt: "Forty participants completed the study and were included in the final analysis."
      },
      {
        step: 6,
        type: "origin-discovery",
        timestamp: "2026-08-31T12:00:05Z",
        origin: VIDEO_ORIGIN,
        expectedOriginKind: "video"
      },
      {
        step: 7,
        type: "discovered-capability",
        timestamp: "2026-08-31T12:00:06Z",
        origin: VIDEO_ORIGIN,
        toolName: "search_video_evidence",
        readOnly: true
      },
      {
        step: 8,
        type: "tool-call",
        timestamp: "2026-08-31T12:00:07Z",
        origin: VIDEO_ORIGIN,
        toolName: "search_video_evidence",
        input: { query: "calibration drift" }
      },
      {
        step: 9,
        type: "validated-result",
        timestamp: "2026-08-31T12:00:08Z",
        origin: VIDEO_ORIGIN,
        toolName: "search_video_evidence",
        evidenceId: "video.transcript.calibration-drift",
        excerpt: "Six sessions had calibration drift, so we removed them before modeling and did not replace them."
      },
      {
        step: 10,
        type: "rationale-derivation",
        timestamp: "2026-08-31T12:00:09Z",
        derivedBy: "external-agent",
        sampleClaim: 34,
        derivationSummary: "40 reported participants in paper - 6 excluded in video = 34 analyzed sample"
      },
      {
        step: 11,
        type: "focus-request",
        timestamp: "2026-08-31T12:00:10Z",
        origin: PAPER_ORIGIN,
        paperEvidenceId: "paper.methods.final-analysis",
        videoEvidenceId: "video.transcript.calibration-drift",
        analyzedSample: 34,
        reasoning: "The video excludes six of the paper's forty reported participants."
      },
      {
        step: 12,
        type: "human-decision",
        timestamp: "2026-08-31T12:00:11Z",
        decision: "confirm",
        decidedBy: "human"
      },
      {
        step: 13,
        type: "mutation-result",
        timestamp: "2026-08-31T12:00:12Z",
        ok: true,
        citationStatus: "blocked",
        hasDiscrepancyNote: true,
        noteId: "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift"
      },
      {
        step: 14,
        type: "audit-result",
        timestamp: "2026-08-31T12:00:13Z",
        auditCount: 2,
        latestEvent: "focus-confirmed",
        persisted: true
      },
      {
        step: 15,
        type: "lifecycle-disable",
        timestamp: "2026-08-31T12:00:14Z",
        disabledOrigins: [PAPER_ORIGIN, VIDEO_ORIGIN]
      },
      {
        step: 16,
        type: "fresh-inventory",
        timestamp: "2026-08-31T12:00:15Z",
        observedToolCount: 0
      }
    ];
  }

  function validRejectTrace(): TraceEvent[] {
    return validGoldenTrace().map((event) => {
      if (event.type === "human-decision") return { ...event, decision: "reject" };
      if (event.type === "mutation-result") {
        return {
          ...event,
          citationStatus: "unblocked",
          hasDiscrepancyNote: false,
          noteId: null
        };
      }
      if (event.type === "audit-result") return { ...event, latestEvent: "focus-rejected" };
      return event;
    });
  }

  it("passes validation for a completely ordered golden workflow trace", () => {
    const trace = validGoldenTrace();
    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails closed when derivation occurs before retrieving video evidence", () => {
    const trace = validGoldenTrace();
    // Move derivation (step 10) to step 5 (before video search)
    const derivation = trace.splice(9, 1)[0];
    trace.splice(4, 0, derivation);
    // Re-index steps
    trace.forEach((e, i) => { e.step = i + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes("Video evidence must precede"))).toBe(true);
  });

  it("fails closed when mutation occurs before human confirmation", () => {
    const trace = validGoldenTrace();
    // Swap human decision (step 12) and mutation (step 13)
    const mutation = trace.splice(12, 1)[0];
    trace.splice(11, 0, mutation);
    trace.forEach((e, i) => { e.step = i + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes("Human-decision must precede"))).toBe(true);
  });

  it("fails closed when paper and video evidence share the same origin", () => {
    const trace = validGoldenTrace();
    // Make video result have PAPER_ORIGIN
    const videoResult = trace.find((e) => e.type === "validated-result" && e.evidenceId === "video.transcript.calibration-drift")!;
    (videoResult as { origin: string }).origin = PAPER_ORIGIN;

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes("distinct normalized origins"))).toBe(true);
  });

  it("fails closed when publisher URLs use different paths on the same normalized origin", () => {
    const trace = validGoldenTrace();
    const paperDiscovery = findOriginDiscovery(trace, "paper");
    const videoDiscovery = findOriginDiscovery(trace, "video");
    const paperResult = findValidatedResult(trace, "paper.methods.final-analysis");
    const videoResult = findValidatedResult(trace, "video.transcript.calibration-drift");
    paperDiscovery.origin = "https://shared.example.test/paper";
    videoDiscovery.origin = "https://shared.example.test/video";
    paperResult.origin = "https://shared.example.test/paper/result";
    videoResult.origin = "https://shared.example.test/video/result";

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Paper and Video evidence must originate from distinct normalized origins.");
  });

  it("fails closed on malformed, non-HTTP, or uncorrelated publisher origins", () => {
    const trace = validGoldenTrace();
    const paperDiscovery = findOriginDiscovery(trace, "paper");
    const videoDiscovery = findOriginDiscovery(trace, "video");
    const videoResult = findValidatedResult(trace, "video.transcript.calibration-drift");
    paperDiscovery.origin = "not a URL";
    videoDiscovery.origin = "file:///video";
    videoResult.origin = "https://different-video.example.test/result";

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("paper origin-discovery must use a valid HTTP(S) URL.");
    expect(result.errors).toContain("video origin-discovery must use a valid HTTP(S) URL.");
  });

  it("requires evidence results to match their corresponding normalized discoveries", () => {
    const trace = validGoldenTrace();
    const videoResult = findValidatedResult(trace, "video.transcript.calibration-drift");
    videoResult.origin = "https://other-video.example.test/path";

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Video evidence result origin must match the Video origin-discovery event.");
  });

  it("fails closed when the focus request does not return to the normalized Paper origin", () => {
    const trace = validGoldenTrace();
    const focusRequest = trace.find((event) => event.type === "focus-request")!;
    focusRequest.origin = `${VIDEO_ORIGIN}/mutation`;

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Focus-request origin must match the Paper discovery and evidence origin.");
  });

  it("passes validation for a persisted human rejection without a discrepancy note", () => {
    const result = validateOrderedTrace(validRejectTrace());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails closed when rejection blocks the citation or creates a note", () => {
    const trace = validRejectTrace();
    const mutation = trace.find((event) => event.type === "mutation-result")!;
    mutation.citationStatus = "blocked";
    mutation.hasDiscrepancyNote = true;
    mutation.noteId = "discrepancy:paper.methods.final-analysis:video.transcript.calibration-drift";

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Rejected focus proposal must leave citationStatus unblocked.");
    expect(result.errors).toContain("Rejected focus proposal must not create a discrepancy note.");
  });

  it("fails closed when rejection carries a mismatched confirmation audit", () => {
    const trace = validRejectTrace();
    const audit = trace.find((event) => event.type === "audit-result")!;
    audit.latestEvent = "focus-confirmed";

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Audit-result must prove the matching persisted human decision.");
  });

  it("fails closed when fresh inventory after kill-switch observes non-zero tools", () => {
    const trace = validGoldenTrace();
    const freshEvent = trace.find((e) => e.type === "fresh-inventory")!;
    (freshEvent as { observedToolCount: number }).observedToolCount = 2 as 0;

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes("observe zero tools"))).toBe(true);
  });

  it("fails closed when kill-switch evidence is omitted", () => {
    const trace = validGoldenTrace().filter((event) => event.type !== "lifecycle-disable" && event.type !== "fresh-inventory");
    trace.forEach((event, index) => { event.step = index + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Trace must contain exactly one lifecycle-disable event; found 0.");
    expect(result.errors).toContain("Trace must contain exactly one fresh-inventory event; found 0.");
  });

  it("fails closed on duplicate decision-bearing events", () => {
    const trace = validGoldenTrace();
    const duplicate = { ...trace.find((event) => event.type === "human-decision")! };
    trace.splice(12, 0, duplicate);
    trace.forEach((event, index) => { event.step = index + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Trace must contain exactly one human-decision event; found 2.");
  });

  it("fails closed when audit precedes mutation or does not prove persistence", () => {
    const trace = validGoldenTrace();
    const mutationIndex = trace.findIndex((event) => event.type === "mutation-result");
    const auditIndex = trace.findIndex((event) => event.type === "audit-result");
    [trace[mutationIndex], trace[auditIndex]] = [trace[auditIndex], trace[mutationIndex]];
    const audit = trace.find((event) => event.type === "audit-result")!;
    (audit as { persisted: boolean }).persisted = false;
    trace.forEach((event, index) => { event.step = index + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Mutation-result must precede audit-result.");
    expect(result.errors).toContain("Audit-result must prove the matching persisted human decision.");
  });

  it("fails closed when discovery or tool-call evidence is missing", () => {
    const trace = validGoldenTrace().filter((event) => event.type !== "origin-discovery" && event.type !== "tool-call");
    trace.forEach((event, index) => { event.step = index + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Trace must contain exactly two origin-discovery events; found 0.");
    expect(result.errors).toContain("Trace must contain exactly two tool-call events; found 0.");
  });

  it("fails closed when capability provenance does not match its result", () => {
    const trace = validGoldenTrace();
    const videoCapability = trace.find(
      (event): event is DiscoveredCapabilityEvent =>
        event.type === "discovered-capability" && event.origin === VIDEO_ORIGIN
    )!;
    videoCapability.toolName = "wrong_video_tool";

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("must link to matching discovery"))).toBe(true);
  });

  it("fails closed when kill-switch precedes mutation audit", () => {
    const trace = validGoldenTrace();
    const disableIndex = trace.findIndex((event) => event.type === "lifecycle-disable");
    const disable = trace.splice(disableIndex, 1)[0];
    trace.splice(11, 0, disable);
    trace.forEach((event, index) => { event.step = index + 1; });

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Audit-result must precede lifecycle-disable.");
  });

  it("fails closed when timestamps are invalid or non-monotonic", () => {
    const trace = validGoldenTrace();
    trace[5].timestamp = trace[4].timestamp;

    const result = validateOrderedTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Trace timestamps must be valid and strictly increasing.");
  });
});
