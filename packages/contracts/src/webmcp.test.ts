import { afterEach, describe, expect, it } from "vitest";

import {
  registerWebMcpTools,
  type WebMcpTool
} from "./webmcp";
import { FakeModelContext } from "./webmcp-test-harness";

type Assert<T extends true> = T;
type WebMcpExecuteUsesOneInput = Assert<
  Parameters<WebMcpTool["execute"]> extends [Record<string, unknown>] ? true : false
>;

const originalDocument = globalThis.document;

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument
  });
});

describe("registerWebMcpTools", () => {
  it("aborts a pending native registration immediately when its lifecycle signal aborts", async () => {
    const registrationPromise = deferred<void>();
    const signals: AbortSignal[] = [];
    const registered: Array<{ signal: AbortSignal }> = [];
    const lifecycle = new AbortController();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        modelContext: {
          registerTool: (_tool: unknown, options: { signal: AbortSignal }) => {
            signals.push(options.signal);
            registered.push(options);
            options.signal.addEventListener("abort", () => registered.splice(0, 1), { once: true });
            return registrationPromise.promise;
          }
        }
      }
    });

    const pending = registerWebMcpTools(
      [{ name: "search_paper_evidence", description: "Search paper evidence.", execute: async () => [] }],
      [],
      { lifecycleSignal: lifecycle.signal }
    );
    expect(signals).toHaveLength(1);
    expect(signals[0].aborted).toBe(false);

    lifecycle.abort();

    expect(signals[0].aborted).toBe(true);
    expect(registered).toEqual([]);
    registrationPromise.resolve();

    await expect(pending).resolves.toMatchObject({ registrationStatus: "cancelled", uiStatus: "disabled" });
  });

  it("short-circuits an already aborted lifecycle signal without retaining a native tool", async () => {
    const modelContext = new FakeModelContext();
    const lifecycle = new AbortController();
    lifecycle.abort();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    const registration = await registerWebMcpTools(
      [{ name: "search_paper_evidence", description: "Search paper evidence.", execute: async () => [] }],
      [],
      { lifecycleSignal: lifecycle.signal }
    );

    expect(modelContext.attempted).toEqual([]);
    expect(modelContext.registered).toEqual([]);
    expect(registration.registrationStatus).toBe("cancelled");
    expect(registration.uiStatus).toBe("disabled");
  });

  it("keeps an active registration linked to its lifecycle signal", async () => {
    const modelContext = new FakeModelContext();
    const lifecycle = new AbortController();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    const registration = await registerWebMcpTools(
      [{ name: "search_paper_evidence", description: "Search paper evidence.", execute: async () => [] }],
      [],
      { lifecycleSignal: lifecycle.signal }
    );
    expect(registration.registrationStatus).toBe("registered");
    expect(registration.uiStatus).toBe("active");
    expect(modelContext.registered).toHaveLength(1);

    lifecycle.abort();

    expect(modelContext.attempted[0].options.signal?.aborted).toBe(true);
    expect(modelContext.registered).toEqual([]);
    expect(registration.registrationStatus).toBe("registered");
    expect(registration.uiStatus).toBe("disabled");
  });

  it("reports unsupported without invoking a publisher tool", async () => {
    let calls = 0;
    Object.defineProperty(globalThis, "document", { configurable: true, value: {} });

    const registration = await registerWebMcpTools(
      [
        {
          name: "search_paper_evidence",
          description: "Search paper evidence.",
          execute: async () => {
            calls += 1;
            return { found: true };
          }
        }
      ],
      ["http://localhost:4173"]
    );

    expect(registration.registrationStatus).toBe("unsupported");
    expect(registration.uiStatus).toBe("unsupported");
    expect(calls).toBe(0);
  });

  it("awaits registration and passes read-only origin exposure to every native tool", async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    const registration = await registerWebMcpTools(
      [
        {
          name: "search_video_transcript",
          title: "Search transcript evidence",
          description: "Search video transcript evidence.",
          inputSchema: { type: "object" },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute: async () => ({ id: "video.transcript.calibration-drift" })
        }
      ],
      ["http://localhost:4173"]
    );

    expect(registration.registrationStatus).toBe("registered");
    expect(registration.uiStatus).toBe("active");
    expect(modelContext.registered).toHaveLength(1);
    expect(modelContext.registered[0].options.exposedTo).toEqual(["http://localhost:4173"]);
    expect(modelContext.registered[0].tool.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true
    });
  });

  it("uses native execution semantics to expose a JSON-string result", async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    await registerWebMcpTools(
      [
        {
          name: "search_paper_evidence",
          description: "Search paper evidence.",
          execute: async () => ({ evidenceId: "paper.methods.final-analysis" })
        }
      ],
      []
    );

    await expect(modelContext.executeTool("search_paper_evidence", {})).resolves.toBe(
      '{"evidenceId":"paper.methods.final-analysis"}'
    );
  });

  it("reports an empty tool configuration as a non-active registration", async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    const registration = await registerWebMcpTools([], []);

    expect(registration.registrationStatus).toBe("empty");
    expect(registration.uiStatus).toBe("error");
    expect(modelContext.attempted).toEqual([]);
  });

  it("aborts every shared registration when one native registration rejects", async () => {
    const modelContext = new FakeModelContext("search_video_transcript");
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    const registration = await registerWebMcpTools(
      [
        {
          name: "search_paper_evidence",
          description: "Search paper evidence.",
          execute: async () => []
        },
        {
          name: "search_video_transcript",
          description: "Search video transcript evidence.",
          execute: async () => []
        }
      ],
      ["http://localhost:4173"]
    );

    expect(registration.registrationStatus).toBe("error");
    expect(registration.uiStatus).toBe("error");
    expect(modelContext.attempted).toHaveLength(2);
    expect(modelContext.attempted[0].options.signal).toBe(modelContext.attempted[1].options.signal);
    expect(modelContext.attempted[0].options.signal?.aborted).toBe(true);
    expect(modelContext.registered).toEqual([]);
  });

  it("reports disabled after an idempotent abort-based removal", async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { modelContext }
    });

    const registration = await registerWebMcpTools(
      [
        {
          name: "search_paper_evidence",
          description: "Search paper evidence.",
          execute: async () => []
        },
        {
          name: "search_video_transcript",
          description: "Search video transcript evidence.",
          execute: async () => []
        }
      ],
      ["http://localhost:4173"]
    );

    expect(registration.disable()).toBe("disabled");
    expect(registration.disable()).toBe("disabled");
    expect(registration.registrationStatus).toBe("registered");
    expect(registration.uiStatus).toBe("disabled");
    expect(modelContext.registered).toEqual([]);
  });
});
