import type { Confirmation, FocusRequest, PublisherAction } from "@vedaxi/state";

export function requestFocusAction(request: FocusRequest): PublisherAction {
  return { type: "request-focus", request };
}

export function rejectFocusAction(): PublisherAction {
  return { type: "reject-focus" };
}

export function confirmFocusAction(confirmation: Confirmation): PublisherAction {
  return { type: "confirm-focus", confirmation };
}

export function resetPublisherAction(): PublisherAction {
  return { type: "reset" };
}
