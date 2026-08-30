import { useCallback, useEffect, useMemo, useState } from "react";

import { registerWebMcpTools, type WebMcpRegistration, type WebMcpTool } from "@vedaxi/contracts";

import type { PaperProtocolStatus } from "./protocol-status";

export interface PaperProtocolControls {
  status: PaperProtocolStatus;
  enable(): void;
  disable(): void;
}

export type PaperToolRegistrar = typeof registerWebMcpTools;

export class PaperRegistrationController implements PaperProtocolControls {
  status: PaperProtocolStatus = "checking";
  private registration: WebMcpRegistration | null = null;
  private lifecycle: AbortController | null = null;
  private attempt = 0;

  constructor(
    private readonly tool: WebMcpTool,
    private readonly onStatus: (status: PaperProtocolStatus) => void,
    private readonly register: PaperToolRegistrar = registerWebMcpTools
  ) {}

  enable = () => {
    const currentAttempt = ++this.attempt;
    this.lifecycle?.abort();
    this.registration?.disable();
    const nextLifecycle = new AbortController();
    this.lifecycle = nextLifecycle;
    this.setStatus("checking");

    void this.register([this.tool], [], { lifecycleSignal: nextLifecycle.signal })
      .then((nextRegistration) => {
        if (currentAttempt !== this.attempt) {
          nextRegistration.disable();
          return;
        }
        this.registration = nextRegistration;
        switch (nextRegistration.registrationStatus) {
          case "registered":
            this.setStatus("active");
            break;
          case "unsupported":
            this.setStatus("unsupported");
            break;
          case "cancelled":
            this.setStatus("disabled");
            break;
          case "empty":
          case "error":
            this.setStatus("error");
            break;
        }
      })
      .catch(() => {
        if (currentAttempt === this.attempt) this.setStatus("error");
      });
  };

  disable = () => {
    this.attempt += 1;
    this.lifecycle?.abort();
    this.registration?.disable();
    this.registration = null;
    this.setStatus("disabled");
  };

  teardown = () => {
    this.attempt += 1;
    this.lifecycle?.abort();
    this.registration?.disable();
    this.registration = null;
  };

  private setStatus(status: PaperProtocolStatus) {
    this.status = status;
    this.onStatus(status);
  }
}

export function usePaperRegistration(tool: WebMcpTool): PaperProtocolControls {
  const [status, setStatus] = useState<PaperProtocolStatus>("checking");
  const controller = useMemo(() => new PaperRegistrationController(tool, setStatus), [tool]);
  const enable = useCallback(controller.enable, [controller]);
  const disable = useCallback(controller.disable, [controller]);

  useEffect(() => {
    const teardown = () => {
      controller.teardown();
    };

    enable();
    window.addEventListener("pagehide", teardown, { once: true });
    return () => {
      window.removeEventListener("pagehide", teardown);
      teardown();
    };
  }, [controller, enable]);

  return { status, enable, disable };
}
