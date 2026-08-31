import {
  registerWebMcpTools,
  type WebMcpRegistration,
  type WebMcpTool,
  type WebMcpUiStatus
} from "@vedaxi/contracts";

export interface ProbeController {
  readonly status: WebMcpUiStatus;
  readonly error: string | undefined;
  enable: () => Promise<WebMcpUiStatus>;
  disable: () => WebMcpUiStatus;
  teardown: () => void;
}

export function createProbeController(
  tool: WebMcpTool,
  exposedTo: string[],
  onStatusChange: (status: WebMcpUiStatus) => void
): ProbeController {
  let status: WebMcpUiStatus = "checking";
  let registration: WebMcpRegistration | undefined;
  let pendingEnable: Promise<WebMcpUiStatus> | undefined;
  let pendingAbortController: AbortController | undefined;
  let attempt = 0;
  let error: string | undefined;

  const setStatus = (nextStatus: WebMcpUiStatus): WebMcpUiStatus => {
    status = nextStatus;
    onStatusChange(status);
    return status;
  };

  const sanitizeError = (value: unknown): string | undefined => {
    if (!(value instanceof Error)) return value === undefined ? undefined : "Native registration failed";

    const cleanName = value.name.replace(/[^a-zA-Z0-9._ -]/g, "").trim();
    const cleanMessage = value.message.replace(/[^a-zA-Z0-9._ -]/g, " ").replace(/\s+/g, " ").trim();
    return `${cleanName || "Error"}: ${cleanMessage || "Native registration failed"}`.slice(0, 180);
  };

  const disable = (): WebMcpUiStatus => {
    attempt += 1;
    pendingAbortController?.abort();
    pendingAbortController = undefined;
    pendingEnable = undefined;
    return setStatus(registration ? registration.disable() : "disabled");
  };

  return {
    get status() {
      return status;
    },
    get error() {
      return error;
    },
    enable() {
      if (registration?.uiStatus === "active") {
        return Promise.resolve(status);
      }
      if (pendingEnable) return pendingEnable;

      setStatus("checking");
      error = undefined;
      const currentAttempt = ++attempt;
      const abortController = new AbortController();
      let pending: Promise<WebMcpUiStatus>;
      pending = registerWebMcpTools([tool], exposedTo, { lifecycleSignal: abortController.signal })
        .then((nextRegistration) => {
          if (currentAttempt !== attempt) {
            nextRegistration.disable();
            return status;
          }

          registration = nextRegistration;
          error =
            nextRegistration.uiStatus === "error"
              ? sanitizeError(nextRegistration.error) ?? "Native registration failed"
              : undefined;
          return setStatus(nextRegistration.uiStatus);
        })
        .finally(() => {
          if (pendingAbortController === abortController) pendingAbortController = undefined;
          if (pendingEnable === pending) pendingEnable = undefined;
        });
      pendingAbortController = abortController;
      pendingEnable = pending;
      return pending;
    },
    disable,
    teardown() {
      if (status === "checking" || status === "active") disable();
    }
  };
}
