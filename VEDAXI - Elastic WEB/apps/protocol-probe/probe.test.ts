import { afterEach, describe, expect, it } from "vitest";

import { PAPER_ORIGIN, PAPER_SERVER_PORT, PAPER_VIDEO_FRAME, VIDEO_ORIGIN, VIDEO_SERVER_PORT } from "./shared/origins";
import { createPaperEvidenceTool, PAPER_EVIDENCE } from "./paper/paper-probe";
import { createProbeController } from "./shared/probe-controller";
import { createVideoEvidenceTool, VIDEO_EVIDENCE, videoRegistrationOrigins } from "./video/video-probe";

const originalDocument = globalThis.document;

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

afterEach(() => {
  Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
});

describe("M0B protocol probe", () => {
  it("keeps the required two-origin iframe and registration topology explicit", () => {
    expect(PAPER_ORIGIN).toBe("http://localhost:4173");
    expect(VIDEO_ORIGIN).toBe("http://localhost:4174");
    expect(PAPER_SERVER_PORT).toBe(4173);
    expect(VIDEO_SERVER_PORT).toBe(4174);
    expect(PAPER_VIDEO_FRAME).toEqual({
      src: VIDEO_ORIGIN,
      title: "Independent video evidence publisher",
      allow: "tools"
    });
    expect(videoRegistrationOrigins).toEqual([PAPER_ORIGIN]);
  });

  it("returns exact paper evidence and only evidence fields", async () => {
    const result = await createPaperEvidenceTool().execute({
      query: "Find evidence for the final analyzed sample."
    });

    expect(result).toEqual([{ evidence: PAPER_EVIDENCE, score: 3 }]);
    expect(PAPER_EVIDENCE.sourceOrigin).toBe(PAPER_ORIGIN);
    expect(PAPER_EVIDENCE.provenance).toBe("Protocol probe paper methods passage");
    expect(JSON.stringify(result)).not.toMatch(/34|contradiction|discrepancy/i);
  });

  it("returns exact video evidence and only evidence fields", async () => {
    const result = await createVideoEvidenceTool().execute({ query: "calibration drift" });

    expect(result).toEqual([{ evidence: VIDEO_EVIDENCE, score: 2 }]);
    expect(VIDEO_EVIDENCE.sourceOrigin).toBe(VIDEO_ORIGIN);
    expect(VIDEO_EVIDENCE.provenance).toBe("Protocol probe video transcript at 00:03:12");
    expect(JSON.stringify(result)).not.toMatch(/34|contradiction|discrepancy/i);
  });

  it("rejects blank, oversized, and extra-property tool input", async () => {
    const tool = createPaperEvidenceTool();

    await expect(tool.execute({ query: "  " })).rejects.toThrow("query must be a non-blank string");
    await expect(tool.execute({ query: "x".repeat(161) })).rejects.toThrow("query is too long");
    await expect(tool.execute({ query: "final analysis", extra: true })).rejects.toThrow(
      "input must contain only query"
    );
    await expect(tool.execute(null as never)).rejects.toThrow("input must contain only query");
  });

  it("keeps the declared JSON Schema aligned with runtime input validation", async () => {
    const tool = createPaperEvidenceTool();
    const schema = tool.inputSchema as {
      type: string;
      required: string[];
      additionalProperties: boolean;
      properties: { query: { type: string; maxLength: number; pattern: string } };
    };
    const schemaAllows = (input: unknown): boolean => {
      if (!input || typeof input !== "object" || Array.isArray(input)) return false;
      const fields = input as Record<string, unknown>;
      const query = fields.query;
      return (
        Object.keys(fields).length === 1 &&
        typeof query === "string" &&
        query.length <= schema.properties.query.maxLength &&
        new RegExp(schema.properties.query.pattern).test(query)
      );
    };
    const corpus: Array<{ input: unknown; allowed: boolean }> = [
      { input: { query: "final analyzed sample" }, allowed: true },
      { input: { query: "" }, allowed: false },
      { input: { query: "  \t" }, allowed: false },
      { input: { query: "x".repeat(160) }, allowed: true },
      { input: { query: "x".repeat(161) }, allowed: false },
      { input: { query: "final analysis", extra: true }, allowed: false },
      { input: { query: 42 }, allowed: false },
      { input: null, allowed: false }
    ];

    expect(schema).toMatchObject({
      type: "object",
      required: ["query"],
      additionalProperties: false,
      properties: { query: { type: "string", maxLength: 160, pattern: "\\S" } }
    });
    for (const { input, allowed } of corpus) {
      expect(schemaAllows(input)).toBe(allowed);
      if (allowed) {
        await expect(tool.execute(input as Record<string, unknown>)).resolves.toEqual(expect.any(Array));
      } else {
        await expect(tool.execute(input as never)).rejects.toThrow();
      }
    }
  });

  it("reflects checking, active, disabled, and teardown states without a fallback", async () => {
    const registered: Array<{ signal?: AbortSignal }> = [];
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: async (_tool: unknown, options: { signal?: AbortSignal }) => {
            registered.push(options);
          }
        }
      }
    });
    const observed: string[] = [];
    const controller = createProbeController(createPaperEvidenceTool(), [], (status) => observed.push(status));

    expect(controller.status).toBe("checking");
    await controller.enable();
    expect(controller.status).toBe("active");
    controller.disable();
    controller.teardown();

    expect(registered).toHaveLength(1);
    expect(registered[0].signal?.aborted).toBe(true);
    expect(observed).toEqual(["checking", "active", "disabled"]);
  });

  it("reports unsupported without registering or invoking a tool", async () => {
    Object.defineProperty(globalThis, "document", { configurable: true, value: {} });
    const observed: string[] = [];
    const controller = createProbeController(createPaperEvidenceTool(), [], (status) => observed.push(status));

    await controller.enable();

    expect(controller.status).toBe("unsupported");
    expect(observed).toEqual(["checking", "unsupported"]);
  });

  it("prevents duplicate active registrations and creates a fresh registration after abort", async () => {
    const signals: AbortSignal[] = [];
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: async (_tool: unknown, options: { signal: AbortSignal }) => signals.push(options.signal)
        }
      }
    });
    const controller = createProbeController(createPaperEvidenceTool(), [], () => undefined);

    await controller.enable();
    await controller.enable();
    expect(signals).toHaveLength(1);
    controller.disable();
    await controller.enable();

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1]).not.toBe(signals[0]);
    expect(controller.status).toBe("active");
  });

  it("shares one pending enable and aborts its late handle after disable", async () => {
    const registered: AbortSignal[] = [];
    const registration = deferred<void>();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: (_tool: unknown, options: { signal: AbortSignal }) => {
            registered.push(options.signal);
            return registration.promise;
          }
        }
      }
    });
    const observed: string[] = [];
    const controller = createProbeController(createPaperEvidenceTool(), [], (status) => observed.push(status));

    const first = controller.enable();
    const second = controller.enable();
    expect(second).toBe(first);
    expect(registered).toHaveLength(1);
    expect(controller.status).toBe("checking");
    controller.disable();
    expect(registered[0].aborted).toBe(true);
    registration.resolve();

    await expect(first).resolves.toBe("disabled");
    expect(registered[0].aborted).toBe(true);
    expect(controller.status).toBe("disabled");
    expect(observed).toEqual(["checking", "disabled"]);
  });

  it("starts a fresh attempt when re-enabled after cancelling a pending registration", async () => {
    const registered: AbortSignal[] = [];
    const registrations = [deferred<void>(), deferred<void>()];
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: (_tool: unknown, options: { signal: AbortSignal }) => {
            registered.push(options.signal);
            return registrations[registered.length - 1].promise;
          }
        }
      }
    });
    const controller = createProbeController(createPaperEvidenceTool(), [], () => undefined);

    const cancelled = controller.enable();
    controller.disable();
    const replacement = controller.enable();
    expect(registered).toHaveLength(2);
    expect(registered[0].aborted).toBe(true);
    expect(registered[1].aborted).toBe(false);
    registrations[0].resolve();
    await expect(cancelled).resolves.toBe("checking");
    expect(registered[0].aborted).toBe(true);
    expect(controller.status).toBe("checking");
    registrations[1].resolve();

    await expect(replacement).resolves.toBe("active");
    expect(registered[1].aborted).toBe(false);
  });

  it("aborts a late registration handle when teardown occurs during enable", async () => {
    const registered: AbortSignal[] = [];
    const registration = deferred<void>();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: (_tool: unknown, options: { signal: AbortSignal }) => {
            registered.push(options.signal);
            return registration.promise;
          }
        }
      }
    });
    const observed: string[] = [];
    const controller = createProbeController(createPaperEvidenceTool(), [], (status) => observed.push(status));

    const pending = controller.enable();
    controller.teardown();
    expect(registered[0].aborted).toBe(true);
    registration.resolve();

    await expect(pending).resolves.toBe("disabled");
    expect(registered[0].aborted).toBe(true);
    expect(controller.status).toBe("disabled");
    expect(observed).toEqual(["checking", "disabled"]);
  });

  it("surfaces a sanitized native registration error", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: async () => {
            throw new Error("native\n<fault>");
          }
        }
      }
    });
    const controller = createProbeController(createPaperEvidenceTool(), [], () => undefined);

    await controller.enable();

    expect(controller.status).toBe("error");
    expect(controller.error).toBe("Error: native fault");
  });

  it("maps non-Error native rejection to a fixed sanitized message", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: async () => {
            throw { message: "private value", token: "do not expose" };
          }
        }
      }
    });
    const controller = createProbeController(createPaperEvidenceTool(), [], () => undefined);

    await controller.enable();

    expect(controller.status).toBe("error");
    expect(controller.error).toBe("Native registration failed");
  });
});
