const READY_REQUEST = { type: "vedaxi:video-readiness-request", version: 1 } as const;
const READY_RESPONSE = { type: "vedaxi:video-readiness", version: 1 } as const;

function exactRequest(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const fields = value as Record<string, unknown>;
  return Object.keys(fields).length === 2 &&
    fields.type === READY_REQUEST.type &&
    fields.version === READY_REQUEST.version;
}

export function installVideoReadinessResponder(
  paperOrigin: string,
  windowRef: Window = window
): () => void {
  const expectedOrigin = new URL(paperOrigin).origin;
  const parent = windowRef.parent;
  if (parent === windowRef) return () => undefined;

  let active = true;
  const cleanup = () => {
    active = false;
    windowRef.removeEventListener("message", onMessage);
  };
  const onMessage = (event: MessageEvent) => {
    if (!active || event.origin !== expectedOrigin || event.source !== parent || !exactRequest(event.data)) return;
    cleanup();
    parent.postMessage(READY_RESPONSE, expectedOrigin);
  };

  windowRef.addEventListener("message", onMessage);
  return cleanup;
}
