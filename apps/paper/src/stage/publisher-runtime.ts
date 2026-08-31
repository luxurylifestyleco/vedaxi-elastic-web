import {
  createPublisherStore,
  type PublisherAction,
  type PublisherFailure,
  type PublisherResult,
  type PublisherState,
  type PublisherStorage
} from "@vedaxi/state";

export interface PublisherView {
  state: PublisherState;
  error: string | null;
}

export interface PublisherRuntime {
  dispatch(action: PublisherAction): PublisherResult;
  getSnapshot(): PublisherView;
  subscribe(listener: () => void): () => void;
}

export function createPublisherRuntime(storage: PublisherStorage): PublisherRuntime {
  const store = createPublisherStore(storage);
  const listeners = new Set<() => void>();
  const rehydrated = store.rehydrate();
  let view: PublisherView = rehydrated.ok
    ? { state: rehydrated.state, error: null }
    : { state: store.getState(), error: failureCopy(rehydrated.code) };

  const dispatch = (action: PublisherAction): PublisherResult => {
    const result = store.dispatch(action);
    view = result.ok
      ? { state: result.state, error: null }
      : { state: store.getState(), error: failureCopy(result.code) };
    listeners.forEach((listener) => listener());
    return result;
  };

  return {
    dispatch,
    getSnapshot: () => view,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function failureCopy(code: PublisherFailure["code"]): string {
  if (code === "rehydration-failed") {
    return "Publisher state could not be restored. Reset the review to recover.";
  }
  if (code === "persistence-failed") {
    return "Publisher state could not be saved. Retry the action or reset the review.";
  }
  return `Publisher action failed (${code}). Review the current state and retry.`;
}
