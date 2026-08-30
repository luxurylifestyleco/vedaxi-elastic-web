/// <reference path="./webmcp.d.ts" />

export type WebMcpRegistrationStatus = "registered" | "unsupported" | "empty" | "error" | "cancelled";

export type WebMcpUiStatus = "checking" | "active" | "disabled" | "unsupported" | "error";

export type WebMcpTool = ModelContextTool;
export type ModelContextRegisterToolOptions = globalThis.ModelContextRegisterToolOptions;

export interface WebMcpRegistrationOptions {
  lifecycleSignal?: AbortSignal;
}

export interface WebMcpRegistration {
  registrationStatus: WebMcpRegistrationStatus;
  readonly uiStatus: WebMcpUiStatus;
  disable: () => WebMcpUiStatus;
  error?: unknown;
}

function createRegistration(
  registrationStatus: WebMcpRegistrationStatus,
  initialUiStatus: WebMcpUiStatus,
  disable: () => WebMcpUiStatus,
  error?: unknown
): WebMcpRegistration {
  let uiStatus = initialUiStatus;

  return {
    registrationStatus,
    get uiStatus() {
      return uiStatus;
    },
    disable: () => {
      uiStatus = disable();
      return uiStatus;
    },
    error
  };
}

function linkLifecycleAbort(lifecycleSignal: AbortSignal | undefined, abort: () => void): () => void {
  if (!lifecycleSignal) return () => undefined;

  if (lifecycleSignal.aborted) {
    abort();
    return () => undefined;
  }

  lifecycleSignal.addEventListener("abort", abort, { once: true });
  return () => lifecycleSignal.removeEventListener("abort", abort);
}

export async function registerWebMcpTools(
  tools: WebMcpTool[],
  exposedTo: string[],
  options: WebMcpRegistrationOptions = {}
): Promise<WebMcpRegistration> {
  const modelContext = typeof document === "undefined" ? undefined : document.modelContext;

  if (!modelContext) {
    return createRegistration("unsupported", "unsupported", () => "unsupported");
  }

  if (tools.length === 0) {
    return createRegistration("empty", "error", () => "error");
  }

  if (options.lifecycleSignal?.aborted) {
    return createRegistration("cancelled", "disabled", () => "disabled");
  }

  const controller = new AbortController();
  let registration: WebMcpRegistration | undefined;
  const unlinkLifecycleAbort = linkLifecycleAbort(options.lifecycleSignal, () => {
    controller.abort();
    registration?.disable();
  });

  try {
    await Promise.all(
      tools.map((tool) =>
        modelContext.registerTool(tool, { signal: controller.signal, exposedTo })
      )
    );

    if (controller.signal.aborted) {
      return createRegistration("cancelled", "disabled", () => "disabled");
    }

    registration = createRegistration("registered", "active", () => {
      controller.abort();
      unlinkLifecycleAbort();
      return "disabled";
    });
    return registration;
  } catch (error) {
    const wasCancelled = controller.signal.aborted;
    controller.abort();
    if (wasCancelled) {
      return createRegistration("cancelled", "disabled", () => "disabled");
    }
    return createRegistration("error", "error", () => "error", error);
  } finally {
    if (!registration) unlinkLifecycleAbort();
  }
}
