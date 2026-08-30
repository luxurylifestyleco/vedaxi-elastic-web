/// <reference path="./webmcp.d.ts" />

export type WebMcpRegistrationStatus = "registered" | "unsupported" | "empty" | "error";

export type WebMcpUiStatus = "checking" | "active" | "disabled" | "unsupported" | "error";

export type WebMcpTool = ModelContextTool;
export type ModelContextRegisterToolOptions = globalThis.ModelContextRegisterToolOptions;

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

export async function registerWebMcpTools(
  tools: WebMcpTool[],
  exposedTo: string[]
): Promise<WebMcpRegistration> {
  const modelContext = typeof document === "undefined" ? undefined : document.modelContext;

  if (!modelContext) {
    return createRegistration("unsupported", "unsupported", () => "unsupported");
  }

  if (tools.length === 0) {
    return createRegistration("empty", "error", () => "error");
  }

  const controller = new AbortController();

  try {
    await Promise.all(
      tools.map((tool) =>
        modelContext.registerTool(tool, { signal: controller.signal, exposedTo })
      )
    );

    return createRegistration("registered", "active", () => {
      controller.abort();
      return "disabled";
    });
  } catch (error) {
    controller.abort();
    return createRegistration("error", "error", () => "error", error);
  }
}
