import { describe, expect, it, vi } from "vitest";

import type { WebMcpRegistration } from "@vedaxi/contracts";

import { createPaperEvidenceService } from "./service";
import { createPaperFixture } from "./fixture";
import { createPaperEvidenceTool } from "./tool";
import {
  PaperRegistrationController,
  type PaperToolRegistrar
} from "./use-paper-registration";

const tool = createPaperEvidenceTool(
  createPaperEvidenceService(createPaperFixture("https://paper.example.test").evidence)
);
const focusTool = { ...tool, name: "request_discrepancy_focus" };
const tools = [tool, focusTool] as const;

function registration(
  registrationStatus: WebMcpRegistration["registrationStatus"],
  disable = vi.fn(() => "disabled" as const)
): WebMcpRegistration {
  const uiStatus = registrationStatus === "registered" ? "active" :
    registrationStatus === "unsupported" ? "unsupported" :
      registrationStatus === "cancelled" ? "disabled" : "error";
  return { registrationStatus, uiStatus, disable };
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("M1 paper registration controller", () => {
  it.each([
    ["registered", "active"],
    ["unsupported", "unsupported"],
    ["cancelled", "disabled"],
    ["empty", "error"],
    ["error", "error"]
  ] as const)("maps %s registration truthfully to %s", async (nativeStatus, expected) => {
    const statuses: string[] = [];
    const registerMock = vi.fn(async () => registration(nativeStatus));
    const controller = new PaperRegistrationController(
      tools,
      (status) => statuses.push(status),
      registerMock as unknown as PaperToolRegistrar
    );

    controller.enable();
    await settle();

    expect(statuses).toEqual(["checking", expected]);
    expect(registerMock).toHaveBeenCalledWith(
      tools,
      [],
      { lifecycleSignal: expect.any(AbortSignal) }
    );
  });

  it("reports registration rejection as error", async () => {
    const statuses: string[] = [];
    const registerMock = vi.fn(async () => { throw new Error("registration failed"); });
    const controller = new PaperRegistrationController(
      tools,
      (status) => statuses.push(status),
      registerMock as unknown as PaperToolRegistrar
    );

    controller.enable();
    await settle();

    expect(statuses).toEqual(["checking", "error"]);
  });

  it("disables a pending attempt and suppresses its stale success", async () => {
    const statuses: string[] = [];
    const lateDisable = vi.fn(() => "disabled" as const);
    let resolvePending!: (value: WebMcpRegistration) => void;
    const pending = new Promise<WebMcpRegistration>((resolve) => { resolvePending = resolve; });
    const registerMock = vi.fn(() => pending);
    const controller = new PaperRegistrationController(
      tools,
      (status) => statuses.push(status),
      registerMock as unknown as PaperToolRegistrar
    );

    controller.enable();
    const call = registerMock.mock.calls[0] as unknown as Parameters<PaperToolRegistrar>;
    const signal = call[2]?.lifecycleSignal;
    controller.disable();
    resolvePending(registration("registered", lateDisable));
    await settle();

    expect(signal?.aborted).toBe(true);
    expect(statuses).toEqual(["checking", "disabled"]);
    expect(lateDisable).toHaveBeenCalledOnce();
  });

  it("can re-enable after disable and tears down the live registration", async () => {
    const statuses: string[] = [];
    const activeDisable = vi.fn(() => "disabled" as const);
    const registerMock = vi.fn(async () => registration("registered", activeDisable));
    const controller = new PaperRegistrationController(
      tools,
      (status) => statuses.push(status),
      registerMock as unknown as PaperToolRegistrar
    );

    controller.enable();
    await settle();
    controller.disable();
    controller.enable();
    await settle();
    controller.teardown();

    expect(statuses).toEqual(["checking", "active", "disabled", "checking", "active"]);
    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(activeDisable).toHaveBeenCalledTimes(2);
  });
});
