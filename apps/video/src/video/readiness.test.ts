import { describe, expect, it, vi } from "vitest";

import { installVideoReadinessResponder } from "./readiness";

describe("Video readiness responder", () => {
  it("responds once only to the configured Paper parent and exact request", () => {
    let listener: ((event: MessageEvent) => void) | undefined;
    const parent = { postMessage: vi.fn() } as unknown as Window;
    const windowRef = {
      parent,
      addEventListener: vi.fn((_type, next) => { listener = next; }),
      removeEventListener: vi.fn()
    } as unknown as Window;
    const request = { type: "vedaxi:video-readiness-request", version: 1 };

    installVideoReadinessResponder("https://paper.example.test/path", windowRef);
    listener?.({ origin: "https://wrong.example.test", source: parent, data: request } as MessageEvent);
    listener?.({ origin: "https://paper.example.test", source: {} as Window, data: request } as MessageEvent);
    listener?.({ origin: "https://paper.example.test", source: parent, data: { ...request, extra: true } } as MessageEvent);
    expect(parent.postMessage).not.toHaveBeenCalled();

    listener?.({ origin: "https://paper.example.test", source: parent, data: request } as MessageEvent);
    expect(parent.postMessage).toHaveBeenCalledOnce();
    expect(parent.postMessage).toHaveBeenCalledWith(
      { type: "vedaxi:video-readiness", version: 1 },
      "https://paper.example.test"
    );
    listener?.({ origin: "https://paper.example.test", source: parent, data: request } as MessageEvent);
    expect(parent.postMessage).toHaveBeenCalledOnce();
    expect(windowRef.removeEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("does not install in a standalone window and explicitly cleans up an unanswered listener", () => {
    const windowRef = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as Window;
    Object.assign(windowRef, { parent: windowRef });

    installVideoReadinessResponder("https://paper.example.test", windowRef);
    expect(windowRef.addEventListener).not.toHaveBeenCalled();

    const parent = { postMessage: vi.fn() } as unknown as Window;
    Object.assign(windowRef, { parent });
    const cleanup = installVideoReadinessResponder("https://paper.example.test", windowRef);
    cleanup();
    expect(windowRef.removeEventListener).toHaveBeenCalledWith("message", expect.any(Function));
    expect(parent.postMessage).not.toHaveBeenCalled();
  });
});
