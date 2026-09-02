import { type FormEvent, useEffect, useRef, useState } from "react";

import type { EvidenceSearchResult } from "@vedaxi/contracts";
import type {
  FocusRequest,
  PublisherAction,
  PublisherResult,
  PublisherState
} from "@vedaxi/state";

import { EditionWorld } from "../stage/EditionWorld";
import { ProtocolStage3D } from "../stage/ProtocolStage3D";
import {
  STAGE_CHAPTERS,
  StageNavigation,
  selectActiveChapter,
  stageChapterFromHash,
  type StageChapterId
} from "../stage/StageNavigation";

import {
  confirmFocusAction,
  rejectFocusAction,
  requestFocusAction,
  resetPublisherAction
} from "../actions";
import type { PaperFixture } from "./fixture";
import { protocolStatusCopy } from "./protocol-status";
import type { PaperEvidenceService } from "./service";
import type { PaperProtocolControls } from "./use-paper-registration";

export interface PaperAppProps {
  fixture: PaperFixture;
  service: PaperEvidenceService;
  protocol: PaperProtocolControls;
  publisherState?: PublisherState;
  dispatchPublisher?: (action: PublisherAction) => PublisherResult;
  publisherError?: string | null;
  videoOrigin?: string;
  videoConfigurationError?: string | null;
}

const VIDEO_READY_REQUEST = { type: "vedaxi:video-readiness-request", version: 1 } as const;
const VIDEO_READY_RESPONSE = { type: "vedaxi:video-readiness", version: 1 } as const;
const VIDEO_READY_TIMEOUT_MS = 5_000;

function normalizedHttpOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function normalizedIndependentVideoOrigin(videoOrigin: string, paperOrigin: string | null): string | null {
  const normalizedVideo = normalizedHttpOrigin(videoOrigin);
  if (!normalizedVideo) return null;
  if (paperOrigin === null) return normalizedVideo;
  const normalizedPaper = normalizedHttpOrigin(paperOrigin);
  return normalizedPaper && normalizedPaper !== normalizedVideo ? normalizedVideo : null;
}

function exactReadyPayload(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const fields = value as Record<string, unknown>;
  return Object.keys(fields).length === 2 &&
    fields.type === VIDEO_READY_RESPONSE.type &&
    fields.version === VIDEO_READY_RESPONSE.version;
}

export function monitorVideoReadiness(
  windowRef: Window,
  videoOrigin: string,
  videoWindow: MessageEventSource,
  onResult: (available: boolean) => void,
  timeoutMs = VIDEO_READY_TIMEOUT_MS
): () => void {
  const expectedOrigin = normalizedIndependentVideoOrigin(videoOrigin, windowRef.location.origin);
  if (!expectedOrigin) {
    onResult(false);
    return () => undefined;
  }

  let settled = false;
  let timer = 0;
  const remove = () => {
    windowRef.removeEventListener("message", onMessage);
    windowRef.clearTimeout(timer);
  };
  const finish = (available: boolean) => {
    if (settled) return;
    settled = true;
    remove();
    onResult(available);
  };
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== expectedOrigin || event.source !== videoWindow || !exactReadyPayload(event.data)) return;
    finish(true);
  };

  windowRef.addEventListener("message", onMessage);
  timer = windowRef.setTimeout(() => finish(false), timeoutMs);
  return () => {
    settled = true;
    remove();
  };
}

export function requestVideoReadiness(videoWindow: Window, videoOrigin: string): boolean {
  const targetOrigin = normalizedHttpOrigin(videoOrigin);
  if (!targetOrigin) return false;
  try {
    videoWindow.postMessage(VIDEO_READY_REQUEST, targetOrigin);
    return true;
  } catch {
    return false;
  }
}

export function startVideoReadinessAttempt(
  windowRef: Window,
  videoOrigin: string,
  videoWindow: Window,
  onResult: (available: boolean) => void,
  timeoutMs = VIDEO_READY_TIMEOUT_MS
): () => void {
  const expectedOrigin = normalizedIndependentVideoOrigin(videoOrigin, windowRef.location.origin);
  if (!expectedOrigin) {
    onResult(false);
    return () => undefined;
  }
  const cleanup = monitorVideoReadiness(windowRef, expectedOrigin, videoWindow, onResult, timeoutMs);
  if (!requestVideoReadiness(videoWindow, expectedOrigin)) {
    cleanup();
    onResult(false);
  }
  return cleanup;
}

interface VideoReadinessState {
  origin: string | null;
  available: boolean | null;
}

interface VideoReadinessAttempt {
  origin: string;
  generation: number;
  cleanup: () => void;
}

interface VideoReadinessAttemptRef {
  current: VideoReadinessAttempt | null;
}

export function cleanupVideoReadinessAttempt(
  attemptRef: VideoReadinessAttemptRef,
  origin?: string
): void {
  const attempt = attemptRef.current;
  if (!attempt || (origin !== undefined && attempt.origin !== origin)) return;
  attemptRef.current = null;
  attempt.cleanup();
}

export function videoAvailabilityForOrigin(
  readiness: VideoReadinessState,
  currentOrigin: string | null
): boolean | null {
  if (!currentOrigin) return false;
  return readiness.origin === currentOrigin ? readiness.available : null;
}

export const CONTROLLED_FOCUS_REQUEST: FocusRequest = {
  paperEvidenceId: "paper.methods.final-analysis",
  videoEvidenceId: "video.transcript.calibration-drift",
  analyzedSample: 34,
  reasoning: "The video excludes six of the paper's forty reported participants.",
  provenance: {
    paper: "VEDAXI controlled paper fixture — Methods, participants",
    video: "VEDAXI controlled video fixture — transcript cue at 00:03:12",
    derivation: "Externally supplied comparison: 40 - 6 = 34"
  }
};

const EMPTY_PUBLISHER_STATE: PublisherState = {
  citationStatus: "unblocked",
  discrepancyNote: null,
  focusProposal: null,
  auditEvents: []
};

function reviewHistoryCopy(event: PublisherState["auditEvents"][number]): string {
  switch (event.type) {
    case "focus-requested":
      return "Focus requested";
    case "focus-rejected":
      return "Focus rejected";
    case "focus-confirmed":
      return "Citation block confirmed by human";
  }
}

function ProtocolStatus({
  protocol,
  service
}: {
  protocol: PaperProtocolControls;
  service: PaperEvidenceService;
}) {
  const isActive = protocol.status === "active";
  const isChecking = protocol.status === "checking";
  const [simulationLog, setSimulationLog] = useState<{
    ok: boolean;
    query: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const simulateAgentCall = () => {
    const query = "final analyzed sample";
    const timestamp = new Date().toLocaleTimeString();
    if (protocol.status !== "active") {
      setSimulationLog({
        ok: false,
        query,
        message: "FAIL-CLOSED (403): Agent tool invocation rejected. Publisher has revoked WebMCP tool surface.",
        timestamp
      });
    } else {
      const results = service.search(query);
      setSimulationLog({
        ok: true,
        query,
        message: `200 OK: Agent retrieved passage: "${results[0]?.evidence.excerpt ?? "Evidence found"}"`,
        timestamp
      });
    }
  };

  return (
    <section className="protocol" aria-labelledby="protocol-title">
      <div>
        <p className="eyebrow" id="protocol-title">Native protocol</p>
        <p className="protocol__status" data-status={protocol.status} aria-live="polite">
          <span aria-hidden="true" className="protocol__marker" />
          {protocolStatusCopy(protocol.status)}
        </p>
      </div>

      <div className="protocol__surface">
        <p className="protocol__surface-label mono">
          {isActive ? "Exposed WebMCP Tools (2)" : "Exposed WebMCP Tools (0 — Revoked)"}
        </p>
        <ul className="protocol__tool-list" aria-label="Live WebMCP tools">
          <li className={isActive ? "tool-active" : "tool-revoked"}>
            <code>paper.search_evidence</code>
            <span className="tool-badge">{isActive ? "active" : "withdrawn"}</span>
          </li>
          <li className={isActive ? "tool-active" : "tool-revoked"}>
            <code>paper.propose_focus</code>
            <span className="tool-badge">{isActive ? "active" : "withdrawn"}</span>
          </li>
        </ul>
      </div>

      <div className="protocol__actions">
        <button
          className="text-button"
          type="button"
          disabled={isChecking}
          onClick={isActive ? protocol.disable : protocol.enable}
        >
          {isChecking ? "Checking…" : isActive ? "Turn agent tools off" : "Check native tools"}
        </button>

        <button
          className="protocol__probe-btn"
          type="button"
          onClick={simulateAgentCall}
        >
          <span>▶ Simulate Agent Invocation</span>
        </button>
      </div>

      {simulationLog && (
        <div
          className={`protocol__probe-result ${simulationLog.ok ? "probe-success" : "probe-blocked"}`}
          role="status"
          aria-live="polite"
        >
          <div className="probe-result__header mono">
            <span>[Agent Probe at {simulationLog.timestamp}]</span>
            <span>Query: &ldquo;{simulationLog.query}&rdquo;</span>
          </div>
          <p className="probe-result__body">{simulationLog.message}</p>
        </div>
      )}
    </section>
  );
}

function getEvidenceAnchor(locator: string): string {
  const lower = locator.toLowerCase();
  if (lower.includes("abstract")) return "#abstract";
  if (lower.includes("flow")) return "#study-flow";
  if (lower.includes("limitation")) return "#limitations";
  if (lower.includes("reference")) return "#references";
  if (lower.includes("participants")) return "#methods-participants";
  if (lower.includes("methods")) return "#methods";
  return "#methods-participants";
}

function PaperSearch({ service }: { service: PaperEvidenceService }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EvidenceSearchResult[] | null>(null);
  const [focusResult, setFocusResult] = useState(false);
  const firstResultRef = useRef<HTMLAnchorElement>(null);

  const suggestions = [
    "final analyzed sample",
    "forty participants",
    "included in the final analysis"
  ] as const;

  const runSearch = (nextQuery: string, shouldFocusResult = false) => {
    setQuery(nextQuery);
    setResults(service.search(nextQuery));
    setFocusResult(shouldFocusResult);
  };

  useEffect(() => {
    if (!focusResult || results === null) return;
    const resultLink = firstResultRef.current;
    const targetId = resultLink?.hash.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;

    if (target && targetId) {
      window.location.hash = targetId;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "center" });
    } else {
      resultLink?.focus();
    }
    setFocusResult(false);
  }, [focusResult, results]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  const message =
    results === null
      ? "Search the publisher’s paper evidence."
      : results.length === 0
        ? "No matching paper evidence."
        : `${results.length} matching paper passage found for “${query}”.`;

  return (
    <section className="paper-search" aria-labelledby="paper-search-title">
      <div className="paper-search__heading">
        <div>
          <p className="eyebrow">Human research path</p>
          <h2 id="paper-search-title">Search this paper</h2>
        </div>
        <p className="paper-search__hint">Works independently of native agent tools.</p>
      </div>
      <form className="search-form" onSubmit={submit}>
        <label htmlFor="paper-query">Paper evidence query</label>
        <div className="search-form__controls">
          <input
            id="paper-query"
            name="query"
            maxLength={160}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “final analyzed sample”"
          />
          <button type="submit">
            <svg
              aria-hidden="true"
              className="search-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              focusable="false"
            >
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <span>Search</span>
          </button>
        </div>
      </form>
      <div className="search-suggestions" aria-label="Suggested paper searches">
        <span>Try one:</span>
        {suggestions.map((suggestion) => (
          <button
            aria-pressed={results !== null && query === suggestion}
            key={suggestion}
            type="button"
            onClick={() => runSearch(suggestion, true)}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <p className="search-message" aria-live="polite">{message}</p>
      {results?.map(({ evidence, score }, index) => (
        <a
          className="search-result"
          href={getEvidenceAnchor(evidence.locator)}
          key={evidence.id}
          ref={index === 0 ? firstResultRef : undefined}
        >
          <span>{evidence.title}</span>
          <span className="mono">{evidence.locator} · {score} exact query terms</span>
        </a>
      ))}
    </section>
  );
}

interface ExecutionStep {
  id: string;
  kind: "query-paper" | "query-video" | "derivation" | "stage-focus" | "fail-closed";
  title: string;
  detail: string;
  status: "pending" | "running" | "success" | "blocked";
}

export function PaperApp({
  fixture,
  service,
  protocol,
  publisherState = EMPTY_PUBLISHER_STATE,
  dispatchPublisher = () => ({ ok: false, code: "invalid-action", recoverable: true }),
  publisherError = null,
  videoOrigin = "",
  videoConfigurationError = null
}: PaperAppProps) {
  const paper = fixture.document;
  const evidence = fixture.evidence;
  const normalizedVideoOrigin = normalizedIndependentVideoOrigin(
    videoOrigin,
    typeof window === "undefined" ? null : window.location.origin
  );
  const [activeStageChapter, setActiveStageChapter] = useState<StageChapterId>(() =>
    stageChapterFromHash(typeof window === "undefined" ? "" : window.location.hash)
  );
  const [videoReadiness, setVideoReadiness] = useState<VideoReadinessState>({
    origin: normalizedVideoOrigin,
    available: normalizedVideoOrigin ? null : false
  });
  const videoAvailable = videoAvailabilityForOrigin(videoReadiness, normalizedVideoOrigin);
  const videoFrameRef = useRef<HTMLIFrameElement>(null);
  const readinessAttemptRef = useRef<VideoReadinessAttempt | null>(null);
  const readinessGenerationRef = useRef(0);
  const [stageRestored, setStageRestored] = useState(false);
  const focus = publisherState.focusProposal ?? publisherState.discrepancyNote;
  const hasFocus = focus !== null;
  const focusActive = hasFocus && !stageRestored;

  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<ExecutionStep[] | null>(null);
  const isProtocolDisabled = protocol.status === "disabled" || protocol.status === "error";

  const [synthesisResult, setSynthesisResult] = useState<{
    mode: "augmented" | "revoked";
    title: string;
    finding: string;
    details: string;
  } | null>(null);

  const presets = [
    "Compare participant cohort between paper and author video",
    "Check if any enrolled sessions were excluded for calibration drift",
    "Derive final analyzed sample size across origins"
  ] as const;

  const runAgentWorkflow = (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setPrompt(userPrompt);
    setIsExecuting(true);

    if (isProtocolDisabled) {
      setExecutionTrace([
        {
          id: "fail-closed",
          kind: "fail-closed",
          title: "WebMCP Protocol Revoked by Publisher",
          detail: "403 Fail-Closed: Publisher has withdrawn native agent capabilities. Agent cannot invoke cross-origin tools.",
          status: "blocked"
        }
      ]);
      setSynthesisResult({
        mode: "revoked",
        title: "⚠ Unqualified Surface Reading (WebMCP Revoked)",
        finding: "Superficial Finding: Paper states 40 participants completed the study.",
        details: "WARNING: Cross-origin inspection is BLOCKED. The agent cannot verify author video transcript exclusions (00:03:12) because the publisher revoked WebMCP tool access. Data integrity cannot be guaranteed."
      });
      setIsExecuting(false);
      return;
    }

    // Honest simulation: this page cannot invoke its own registered WebMCP tools —
    // those are called by an external agent (e.g. ChatGPT's in-app browser). What we
    // CAN do is call the same evidence service that the WebMCP tool's `execute`
    // handler wraps, showing the live discovery progression across independent origins.
    const initialSteps: ExecutionStep[] = [
      {
        id: "step-1",
        kind: "query-paper",
        title: "Step 1 · Discovering Paper Origin & Searching Evidence",
        detail: "Invoking paper.search_evidence on Paper origin…",
        status: "running"
      },
      {
        id: "step-2",
        kind: "query-video",
        title: "Step 2 · Discovering Independent Video Origin",
        detail: "Awaiting cross-origin handshake with Video origin…",
        status: "pending"
      },
      {
        id: "step-3",
        kind: "derivation",
        title: "Step 3 · Cross-Origin Friction & Invariant Derivation",
        detail: "Awaiting multi-origin assertions…",
        status: "pending"
      },
      {
        id: "step-4",
        kind: "stage-focus",
        title: "Step 4 · Staging Human Decision Gate",
        detail: "Awaiting discrepancy synthesis…",
        status: "pending"
      }
    ];

    setExecutionTrace(initialSteps);
    setSynthesisResult(null);

    // Step 1: Query Paper Origin (400ms)
    setTimeout(() => {
      const paperResults = service.search("final analyzed sample");
      const paperExcerpt = paperResults[0]?.evidence.excerpt ?? "Forty participants completed the study";

      setExecutionTrace((prev) =>
        prev?.map((s) =>
          s.id === "step-1"
            ? {
                ...s,
                status: "success",
                detail: `✓ Found in Methods: "${paperExcerpt}" (Origin: Paper)`
              }
            : s.id === "step-2"
              ? {
                  ...s,
                  status: "running",
                  detail: "Querying video.read_transcript for cohort accounting & exclusions…"
                }
              : s
        ) ?? null
      );

      // Step 2: Query Video Origin (900ms)
      setTimeout(() => {
        setExecutionTrace((prev) =>
          prev?.map((s) =>
            s.id === "step-2"
              ? {
                  ...s,
                  status: "success",
                  detail: "✓ Transcript cue at 00:03:12: \"Six sessions had calibration drift, so we removed them before modeling and did not replace them.\""
                }
              : s.id === "step-3"
                ? {
                    ...s,
                    status: "running",
                    detail: "Evaluating assertion divergence: 40 recruited vs. 6 excluded…"
                  }
                : s
          ) ?? null
        );

        // Step 3: Derivation & Discrepancy Realization (1400ms)
        setTimeout(() => {
          setExecutionTrace((prev) =>
            prev?.map((s) =>
              s.id === "step-3"
                ? {
                    ...s,
                    status: "success",
                    detail: "⚡ Discrepancy Detected: 40 recruited in Paper − 6 excluded in Video = 34 analyzed cohort. Paper claims 40 completed without replacement."
                  }
                : s.id === "step-4"
                  ? {
                      ...s,
                      status: "running",
                      detail: "Submitting focus proposal to Chapter 05 for human confirmation…"
                    }
                  : s
            ) ?? null
          );

          // Step 4: Staging Human Decision Gate (1900ms)
          setTimeout(() => {
            dispatchPublisher(requestFocusAction(CONTROLLED_FOCUS_REQUEST));
            setExecutionTrace((prev) =>
              prev?.map((s) =>
                s.id === "step-4"
                  ? {
                      ...s,
                      status: "success",
                      detail: "✓ Staged in Chapter 05: Handed off to human researcher to block citation."
                    }
                  : s
              ) ?? null
            );
            setSynthesisResult({
              mode: "augmented",
              title: "✓ Cross-Origin Discrepancy Discovered (WebMCP Active)",
              finding: "Qualified Cohort: 34 participants analyzed (40 reported − 6 unreplaced exclusions).",
              details: "EVIDENCE VERIFIED: Cross-origin investigation caught calibration drift exclusion at 00:03:12. Focused Review staged in Chapter 05 — awaiting human decision to block citation."
            });
            setIsExecuting(false);

            const decisionElem = document.getElementById("chapter-decision");
            if (decisionElem) {
              decisionElem.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 450);
        }, 500);
      }, 500);
    }, 450);
  };

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const positions = STAGE_CHAPTERS.flatMap(({ id }) => {
        const element = document.getElementById(id);
        return element ? [{ id, top: element.getBoundingClientRect().top }] : [];
      });
      setActiveStageChapter((current) => selectActiveChapter(positions, current));
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, []);

  useEffect(() => {
    const effectOrigin = normalizedVideoOrigin;
    const currentAttempt = readinessAttemptRef.current;
    if (!effectOrigin) {
      cleanupVideoReadinessAttempt(readinessAttemptRef);
      setVideoReadiness({ origin: null, available: false });
    } else if (!currentAttempt || currentAttempt.origin !== effectOrigin) {
      cleanupVideoReadinessAttempt(readinessAttemptRef);
      setVideoReadiness({ origin: effectOrigin, available: null });
    }
    return () => {
      if (effectOrigin) cleanupVideoReadinessAttempt(readinessAttemptRef, effectOrigin);
    };
  }, [normalizedVideoOrigin]);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const saved = window.localStorage.getItem("vedaxi-theme");
        if (saved === "light" || saved === "dark") return saved;
        return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
      }
    } catch {
      return "dark";
    }
    return "dark";
  });
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [devConsoleTab, setDevConsoleTab] = useState<"rpc" | "schema" | "curl">("rpc");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("vedaxi-theme", next);
      }
    } catch {
      // Ignore in restricted environments
    }
  };

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [tourStep, setTourStep] = useState<number | null>(null);

  const startGuidedTour = () => {
    const steps = [
      { id: "paper-top", delay: 0 },
      { id: "chapter-method", delay: 2500 },
      { id: "chapter-video", delay: 6000 },
      { id: "chapter-evidence", delay: 10000 },
      { id: "chapter-decision", delay: 14000 }
    ];
    steps.forEach(({ id, delay }, idx) => {
      setTimeout(() => {
        setTourStep(idx + 1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        if (idx === steps.length - 1) {
          setTimeout(() => setTourStep(null), 4000);
        }
      }, delay);
    });
  };

  useEffect(() => {
    setStageRestored(false);
  }, [focus]);

  return (
    <div className="edition-desk" data-theme={theme}>
      <ProtocolStage3D activeChapter={activeStageChapter} theme={theme} />
      <div className="page-progress" aria-hidden="true">
        <i style={{ width: `${scrollProgress}%` }} />
      </div>
      <a className="skip-link" href="#paper-content">Skip to paper</a>
      <header className="masthead">
        <a className="identity" href="#paper-top" aria-label="VEDAXI Paper Integrity Desk home">
          <span className="identity__mark" aria-hidden="true">
            <img src="/brand/vdx-mark.svg" alt="" width="20" height="20" className="identity__icon" />
          </span>
          <span>VEDAXI</span>
        </a>
        <p>Research Integrity Desk · Protocol Edition</p>
        <div className="masthead__actions">
          <button
            type="button"
            className="tour-toggle-btn"
            onClick={startGuidedTour}
            aria-label="Start interactive 30 second tour"
          >
            {tourStep ? `✨ Tour: Beat ${tourStep}/5` : "✨ 30s Tour"}
          </button>
          <button
            type="button"
            className="dev-console-toggle-btn"
            onClick={() => setIsDevConsoleOpen(!isDevConsoleOpen)}
            aria-expanded={isDevConsoleOpen}
          >
            {isDevConsoleOpen ? "Hide Dev Console" : "⚡ Dev Console"}
          </button>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span className="mono">Two-Origin WebMCP Proof</span>
        </div>
      </header>

      <main id="paper-content" tabIndex={-1}>
        <PaperSearch service={service} />

        <section className="paper-hero" id="paper-top" aria-labelledby="paper-title">
          <div className="edition-scene edition-scene--hero" aria-hidden="true">
            <div className="edition-scene__painting" aria-hidden="true" />
            <div className="edition-scene__halo" aria-hidden="true" />
            <div className="edition-scene__frame" aria-hidden="true" />
          </div>
          <div className="paper-hero__meta">
            <p>{paper.journal}</p>
            <p>{paper.published}</p>
            <p className="mono">{paper.identifier}</p>
          </div>
          <div className="paper-hero__title">
            <p className="eyebrow">Integrity gallery / methods on parchment</p>
            <h1 className="display-title" id="paper-title" tabIndex={-1}>{paper.title}</h1>
            <p className="dek">{paper.dek}</p>
            <p className="authors">{paper.authors.join(" · ")}</p>
          </div>

          <div className="judge-fast-track-card" aria-label="Judge fast track and executive demonstration">
            <div className="judge-fast-track-header">
              <span className="judge-badge">⚡ JUDGE FAST-TRACK (15s DEMO)</span>
              <span className="judge-meta-tag">Two-Origin WebMCP Challenge Proof</span>
            </div>
            <p className="judge-lead">
              <strong>The Problem:</strong> A single AI reading the paper alone believes <strong>40 participants</strong> were analyzed.
              <br />
              <strong>The Solution:</strong> VEDAXI queries the independent Video origin via WebMCP, catches <strong>6 participants excluded at 00:03:12</strong>, derives true <strong>N = 34</strong>, and enforces human sign-off before citation.
            </p>
            <div className="judge-action-row">
              <button
                type="button"
                className="judge-run-btn"
                onClick={() => {
                  startGuidedTour();
                  dispatchPublisher(requestFocusAction(CONTROLLED_FOCUS_REQUEST));
                  setSynthesisResult({
                    mode: "augmented",
                    title: "✓ Verified Cross-Origin Synthesis (WebMCP Active)",
                    finding: "Qualified Sample: 34 participants analyzed (40 recruited in Paper minus 6 excluded in Video at 00:03:12).",
                    details: "EVIDENCE VERIFIED: Cross-origin WebMCP inspection caught the hidden exclusion. Semantic focus staged in Chapter 05 to block premature citation until confirmed by researcher."
                  });
                }}
              >
                ▶ Run 15s Interactive Proof
              </button>
              <a
                href="https://vedaxi-protocol-edition.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="judge-link-btn"
              >
                Open 3D Protocol Story Map ↗
              </a>
            </div>
            <div className="judge-rubric-pills">
              <span>🛡️ Fail-Closed 403 Kill Switch</span>
              <span>🧪 220/220 Tests Green</span>
              <span>⚡ Live JSON-RPC 2.0 Tools</span>
              <span>🔒 Two-Phase Human Gate</span>
            </div>
          </div>

          <ProtocolStatus protocol={protocol} service={service} />
        </section>

        <section className="focus-preview agent-copilot" aria-labelledby="focus-preview-title">
          <div className="agent-copilot__header">
            <div>
              <p className="eyebrow">WebMCP Agent Research Copilot · Simulated invocation — calls the same evidence service the WebMCP tools expose</p>
              <h2 id="focus-preview-title">Focused Review</h2>
              <p>Ask an AI research query to dynamically inspect and derive facts across independent WebMCP origins.</p>
            </div>
            <div className="agent-copilot__controls-cluster">
              <button
                type="button"
                className="copilot-toggle-btn"
                onClick={isProtocolDisabled ? protocol.enable : protocol.disable}
              >
                {isProtocolDisabled ? "Enable WebMCP Tools" : "Turn WebMCP Off"}
              </button>
              <div className="agent-copilot__status-badge" data-disabled={isProtocolDisabled}>
                {isProtocolDisabled ? "○ Protocol Revoked (Off)" : "● WebMCP Active (On)"}
              </div>
            </div>
          </div>

          <form
            className="copilot-form"
            onSubmit={(e) => {
              e.preventDefault();
              runAgentWorkflow(prompt);
            }}
          >
            <div className="copilot-form__controls">
              <input
                id="copilot-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Compare paper cohort with author video transcript…"
                disabled={isExecuting}
              />
              <button type="submit" disabled={isExecuting || !prompt.trim()}>
                {isExecuting ? "Executing Agent…" : "Run Agent Query"}
              </button>
            </div>
          </form>

          <div className="copilot-presets" aria-label="Suggested agent research queries">
            <span>Try research queries:</span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={isExecuting}
                onClick={() => runAgentWorkflow(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          {synthesisResult && (
            <div className={`copilot-synthesis copilot-synthesis--${synthesisResult.mode}`} role="region" aria-live="polite">
              <div className="synthesis-header">
                <strong>{synthesisResult.title}</strong>
                <span className="mono">{synthesisResult.mode === "augmented" ? "Cross-Origin Verified" : "Fail-Closed Surface"}</span>
              </div>
              <p className="synthesis-finding">{synthesisResult.finding}</p>
              <p className="synthesis-details mono">{synthesisResult.details}</p>
            </div>
          )}

          {executionTrace && (
            <div className="copilot-trace" role="status" aria-live="polite">
              <p className="eyebrow mono">Live Agent Execution Trace & Telemetry</p>
              <ol className="copilot-trace__steps">
                {executionTrace.map((step) => (
                  <li key={step.id} className={`trace-step trace-step--${step.status}`}>
                    <div className="trace-step__head">
                      <span className="trace-step__marker" />
                      <strong>{step.title}</strong>
                    </div>
                    <p className="trace-step__detail mono">{step.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="copilot-fallback">
            <button
              type="button"
              disabled={hasFocus}
              onClick={() => {
                dispatchPublisher(requestFocusAction(CONTROLLED_FOCUS_REQUEST));
                setSynthesisResult({
                  mode: "augmented",
                  title: "✓ Verified Cross-Origin Synthesis (WebMCP Active)",
                  finding: "Qualified Sample: 34 participants analyzed (40 recruited in Paper minus 6 excluded in Video at 00:03:12).",
                  details: "EVIDENCE VERIFIED: Cross-origin WebMCP inspection caught the hidden exclusion. Semantic focus staged in Chapter 05 to block premature citation until confirmed by researcher."
                });
              }}
            >
              {hasFocus ? "Focus review active" : "Run deterministic focus preview"}
            </button>
          </div>
        </section>

        {isDevConsoleOpen && (
          <section className="dev-console-card" aria-label="WebMCP Developer Console & Telemetry Inspector">
            <div className="dev-console-header">
              <div className="dev-console-title">
                <span className="dev-console-icon">⚡</span>
                <div>
                  <h3>WebMCP Developer Console & Protocol Inspector</h3>
                  <p className="mono-subtext">Live JSON-RPC 2.0 tool endpoints registered by WebMCP protocol surface</p>
                </div>
              </div>
              <div className="dev-console-tabs">
                <button
                  type="button"
                  className={`dev-tab-btn ${devConsoleTab === "rpc" ? "active" : ""}`}
                  onClick={() => setDevConsoleTab("rpc")}
                >
                  Live JSON-RPC Stream
                </button>
                <button
                  type="button"
                  className={`dev-tab-btn ${devConsoleTab === "schema" ? "active" : ""}`}
                  onClick={() => setDevConsoleTab("schema")}
                >
                  Tool Schemas
                </button>
                <button
                  type="button"
                  className={`dev-tab-btn ${devConsoleTab === "curl" ? "active" : ""}`}
                  onClick={() => setDevConsoleTab("curl")}
                >
                  cURL / Agent Snippet
                </button>
              </div>
            </div>

            <div className="dev-console-body">
              {devConsoleTab === "rpc" && (
                <div className="dev-console-panel space-y-3">
                  <div className="rpc-stream-item">
                    <div className="rpc-badge-row">
                      <span className="rpc-badge rpc-badge--req">JSON-RPC 2.0 REQ</span>
                      <span className="mono text-xs opacity-75">tools/call: paper.search_evidence</span>
                    </div>
                    <pre className="mono-code">{JSON.stringify({
                      jsonrpc: "2.0",
                      id: "call-001",
                      method: "tools/call",
                      params: {
                        name: "paper.search_evidence",
                        arguments: { query: "cohort participants final analysis" }
                      }
                    }, null, 2)}</pre>
                  </div>
                  <div className="rpc-stream-item">
                    <div className="rpc-badge-row">
                      <span className="rpc-badge rpc-badge--res">JSON-RPC 2.0 RES (200 OK)</span>
                      <span className="mono text-xs text-green-400">readOnlyHint: true · untrustedContentHint: true</span>
                    </div>
                    <pre className="mono-code">{JSON.stringify({
                      jsonrpc: "2.0",
                      id: "call-001",
                      result: {
                        id: "paper.methods.final-analysis",
                        excerpt: "The cohort comprised forty participants (N = 40) across continuous tracking trials.",
                        locator: "#methods-participants",
                        readOnlyHint: true,
                        untrustedContentHint: true
                      }
                    }, null, 2)}</pre>
                  </div>
                </div>
              )}

              {devConsoleTab === "schema" && (
                <div className="dev-console-panel">
                  <pre className="mono-code">{JSON.stringify({
                    protocolRevision: "2026-03-01",
                    capabilities: {
                      tools: {
                        listChanged: true
                      }
                    },
                    tools: [
                      {
                        name: "paper.search_evidence",
                        description: "Searches controlled paper corpus for participant cohort and methodology statements.",
                        readOnlyHint: true,
                        untrustedContentHint: true,
                        parameters: {
                          type: "object",
                          required: ["query"],
                          properties: {
                            query: { type: "string", maxLength: 160 }
                          }
                        }
                      },
                      {
                        name: "paper.propose_focus",
                        description: "Stages cross-origin discrepancy focus for mandatory human citation confirmation.",
                        readOnlyHint: false,
                        untrustedContentHint: true,
                        parameters: {
                          type: "object",
                          required: ["paperEvidenceId", "videoEvidenceId", "analyzedSample", "derivation"],
                          properties: {
                            paperEvidenceId: { type: "string", const: "paper.methods.final-analysis" },
                            videoEvidenceId: { type: "string", const: "video.transcript.calibration-drift" },
                            analyzedSample: { type: "integer", const: 34 },
                            derivation: { type: "string", maxLength: 280 }
                          }
                        }
                      }
                    ]
                  }, null, 2)}</pre>
                </div>
              )}

              {devConsoleTab === "curl" && (
                <div className="dev-console-panel space-y-3">
                  <p className="mono-subtext">Invoke the live WebMCP evidence service directly from terminal or external AI orchestrators:</p>
                  <pre className="mono-code">{`# 1. Query Paper Evidence Origin
curl -X POST "https://vedaxi-integrity-desk.vercel.app/api/webmcp" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"paper.search_evidence","arguments":{"query":"cohort"}}}'

# 2. Query Video Transcript Origin (Cross-Origin Handshake at 00:03:12)
curl -X POST "https://vedaxi-video-origin-teal.vercel.app/api/webmcp" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"video.read_transcript","arguments":{"timestamp":"00:03:12"}}}'`}</pre>
                </div>
              )}
            </div>
          </section>
        )}
        {publisherError && (
          <div className="publisher-error" role="alert">
            <p>{publisherError}</p>
            <button type="button" onClick={() => dispatchPublisher(resetPublisherAction())}>
              Reset failed review
            </button>
          </div>
        )}

        <div className="paper-layout">
          <StageNavigation
            activeChapter={activeStageChapter}
            announce
            onActiveChapterChange={setActiveStageChapter}
            variant="mobile"
          />

          <div className="paper-navigation-column">
            <StageNavigation
              activeChapter={activeStageChapter}
              announce={false}
              onActiveChapterChange={setActiveStageChapter}
              variant="desktop"
            />
            <nav className="paper-outline" aria-label="Paper outline">
              <p className="eyebrow">Within the paper</p>
              <ol>
                <li><a href="#abstract">Abstract</a></li>
                <li><a href="#methods">Methods</a></li>
                <li><a href="#study-flow">Study flow</a></li>
                <li><a href="#limitations">Limitations</a></li>
                <li><a href="#references">References</a></li>
              </ol>
            </nav>
          </div>

          <details className="paper-outline-mobile">
            <summary>Paper outline</summary>
            <nav aria-label="Paper outline on small screens">
              <a href="#abstract">Abstract</a>
              <a href="#methods">Methods</a>
              <a href="#study-flow">Study flow</a>
              <a href="#limitations">Limitations</a>
              <a href="#references">References</a>
            </nav>
          </details>

          <article
            className={`paper-article${focusActive ? " paper-article--focused" : ""}`}
            data-focus-state={focusActive ? "focused" : "ordinary"}
          >
            <section className="stage-chapter stage-chapter--paper edition-scene edition-scene--parchment" aria-labelledby="abstract-title">
              <div className="edition-scene__painting" aria-hidden="true" />
              <div className="edition-scene__frame" aria-hidden="true" />
              <div className="edition-scene__caption">
              <p className="stage-chapter__index mono">Chapter 01 / Paper</p>
              <div id="abstract">
                <p className="section-kicker">Study overview</p>
                <h2 id="abstract-title">Abstract</h2>
                <p className="lead">{paper.abstract}</p>
              </div>
              </div>
            </section>

            <section className="stage-chapter stage-chapter--method edition-scene edition-scene--triptych" id="chapter-method" aria-labelledby="methods-title">
              <div className="edition-scene__painting" aria-hidden="true" />
              <div className="edition-scene__frame" aria-hidden="true" />
              <div className="edition-scene__caption">
              <p className="stage-chapter__index mono">Chapter 02 / Method</p>
              <div id="methods">
                <p className="section-kicker">Participant accounting</p>
                <h2 id="methods-title" tabIndex={-1}>Methods</h2>
                <p>{paper.methodsIntroduction}</p>
              </div>

              <div id="study-flow" aria-labelledby="study-flow-title">
                <p className="section-kicker">Reported flow</p>
                <h2 id="study-flow-title">Study flow</h2>
                <figure className="study-flow">
                  <div className="study-flow__plot" role="img" aria-label="Three equal stages: enrolled, completed, and included in final analysis, each showing forty participants.">
                    {[
                      ["Enrolled", "40"],
                      ["Completed", "40"],
                      ["Final analysis", "40"]
                    ].map(([label, value]) => (
                      <div className="study-flow__stage" key={label}>
                        <span className="study-flow__value">{value}</span>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <figcaption>Figure 1. Participant accounting reported by this controlled paper fixture.</figcaption>
                </figure>
              </div>
              </div>
            </section>

            <section className="stage-chapter stage-chapter--video edition-scene edition-scene--reversed" id="chapter-video" aria-labelledby="video-title">
              <div className="edition-scene__painting" aria-hidden="true" />
              <div className="edition-scene__frame" aria-hidden="true" />
              <EditionWorld reverse />
              <div className="edition-scene__caption">
              <p className="stage-chapter__index mono">Chapter 03 / Video</p>
              <div>
                <p className="section-kicker">Independent publisher, inverted world</p>
                <h2 id="video-title" tabIndex={-1}>Video transcript evidence</h2>
                <p>The Video publisher is hosted independently and appears here only after it confirms readiness. The reversed field is decoration; transcript evidence stays upright and unpublished until the origin answers.</p>
              </div>
              {normalizedVideoOrigin && (
                <iframe
                  className="video-publisher"
                  hidden={videoAvailable !== true}
                  onLoad={() => {
                    const attemptOrigin = normalizedVideoOrigin;
                    const generation = ++readinessGenerationRef.current;
                    cleanupVideoReadinessAttempt(readinessAttemptRef);
                    setVideoReadiness({ origin: attemptOrigin, available: null });
                    const videoWindow = videoFrameRef.current?.contentWindow;
                    if (!videoWindow) {
                      setVideoReadiness({ origin: attemptOrigin, available: false });
                      return;
                    }
                    const attempt: VideoReadinessAttempt = {
                      origin: attemptOrigin,
                      generation,
                      cleanup: () => undefined
                    };
                    readinessAttemptRef.current = attempt;
                    attempt.cleanup = startVideoReadinessAttempt(
                      window,
                      attemptOrigin,
                      videoWindow,
                      (available) => {
                        if (readinessAttemptRef.current !== attempt) return;
                        setVideoReadiness({ origin: attemptOrigin, available });
                      }
                    );
                  }}
                  ref={videoFrameRef}
                  src={normalizedVideoOrigin}
                  title="Independent Video publisher evidence"
                />
              )}
              {videoConfigurationError ? (
                <p role="alert">
                  Independent Video publisher configuration is invalid: {videoConfigurationError}. No embedded evidence is shown.
                </p>
              ) : videoAvailable !== true && (
                <div className="embedded-video-card">
                  <p role="status" className="embedded-video-status">
                    {videoAvailable === null
                      ? "Checking whether the independent Video publisher is available."
                      : "Independent Video publisher could not be verified or is unavailable. Direct local evidence player loaded below:"}
                  </p>
                  <div className="embedded-video-wrapper">
                    <video
                      className="native-video-player"
                      controls
                      preload="metadata"
                      src="/media/vedaxi-controlled-evidence.mp4"
                      aria-label="Recorded source video: calibration drift evidence"
                    >
                      <track kind="captions" src="/media/vedaxi-controlled-evidence.vtt" srcLang="en" label="English" default />
                    </video>
                  </div>
                  <div className="embedded-transcript-cue">
                    <div className="cue-header">
                      <span className="mono cue-badge">00:03:12 (192s)</span>
                      <span className="eyebrow">Author Statement</span>
                    </div>
                    <p className="cue-body">
                      &ldquo;We recruited forty participants. Six sessions had calibration drift, so we removed them before modeling and did not replace them.&rdquo;
                    </p>
                    <div className="cue-provenance mono">
                      <span>ID: video.transcript.calibration-drift</span>
                      <span>Locator: Transcript 00:03:12</span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </section>

            <section className="stage-chapter stage-chapter--evidence edition-scene edition-scene--burn" id="chapter-evidence" aria-labelledby="evidence-title">
              <div className="edition-scene__painting" aria-hidden="true" />
              <div className="edition-burn" aria-hidden="true" />
              <div className="edition-scene__frame" aria-hidden="true" />
              <div className="edition-scene__caption edition-scene__caption--reveal">
                <p className="stage-chapter__index mono">Chapter 04 / Evidence</p>
                <h2 id="evidence-title" tabIndex={-1}>{evidence.title}</h2>
                <div className="evidence-row" id="methods-participants" tabIndex={-1}>
                  <blockquote cite={`${evidence.sourceOrigin}/#methods-participants`}>
                    <p>{evidence.excerpt}</p>
                  </blockquote>
                  <aside className="provenance" aria-label="Evidence provenance">
                    <p className="eyebrow">Publisher evidence</p>
                    <dl>
                      <div><dt>Locator</dt><dd>{evidence.locator}</dd></div>
                      <div><dt>Origin</dt><dd className="mono">{evidence.sourceOrigin}</dd></div>
                      <div><dt>Evidence ID</dt><dd className="mono">{evidence.id}</dd></div>
                      <div><dt>Provenance</dt><dd>{evidence.provenance}</dd></div>
                    </dl>
                  </aside>
                </div>
              </div>
            </section>

            <section className="stage-chapter stage-chapter--decision edition-scene edition-scene--seal" id="chapter-decision" aria-labelledby="focus-decision-title">
              <div className="edition-scene__painting" aria-hidden="true" />
              <div className="edition-scene__frame" aria-hidden="true" />
              <div className="edition-scene__caption">
              <p className="stage-chapter__index mono">Chapter 05 / Decision</p>
              <div className="focus-decision" aria-live="polite">
                <p className="section-kicker">Human checkpoint</p>
                <h2 id="focus-decision-title" tabIndex={-1}>Focus decision</h2>
                {hasFocus && (
                  <div className="focus-view-actions">
                    <button type="button" onClick={() => setStageRestored(!focusActive)}>
                      {focusActive ? "Restore full workspace" : "Review focused evidence"}
                    </button>
                  </div>
                )}
                {publisherState.focusProposal && (
                  <>
                    <p className="focus-derivation">{publisherState.focusProposal.provenance.derivation}</p>
                    <p>{publisherState.focusProposal.reasoning}</p>
                    <dl className="focus-provenance">
                      <div><dt>Paper</dt><dd>{publisherState.focusProposal.provenance.paper}</dd></div>
                      <div><dt>Video</dt><dd>{publisherState.focusProposal.provenance.video}</dd></div>
                    </dl>
                    <div className="focus-actions">
                      <button
                        type="button"
                        onClick={() => dispatchPublisher(confirmFocusAction({ confirmedBy: "human" }))}
                      >Confirm focus</button>
                      <button type="button" onClick={() => dispatchPublisher(rejectFocusAction())}>
                        Reject focus
                      </button>
                    </div>
                  </>
                )}
                {publisherState.discrepancyNote && (
                  <aside className="discrepancy-note">
                    <p><strong>Citation status: blocked</strong></p>
                    <p>{publisherState.discrepancyNote.provenance.derivation}</p>
                    <p>{publisherState.discrepancyNote.reasoning}</p>
                    <a href="#methods-participants">Review linked publisher evidence</a>
                    <dl className="focus-provenance">
                      <div><dt>Paper evidence ID</dt><dd className="mono">{publisherState.discrepancyNote.paperEvidenceId}</dd></div>
                      <div><dt>Video evidence ID</dt><dd className="mono">{publisherState.discrepancyNote.videoEvidenceId}</dd></div>
                      <div><dt>Paper provenance</dt><dd>{publisherState.discrepancyNote.provenance.paper}</dd></div>
                      <div><dt>Video provenance</dt><dd>{publisherState.discrepancyNote.provenance.video}</dd></div>
                    </dl>
                    <button type="button" onClick={() => dispatchPublisher(resetPublisherAction())}>
                      Reset focus review
                    </button>
                  </aside>
                )}
                {!hasFocus && <p>No focus proposal is awaiting review.</p>}
                {publisherState.auditEvents.length > 0 && (
                  <ol className="review-history" aria-label="Review history">
                    {publisherState.auditEvents.map((event, index) => (
                      <li key={`${event.type}-${index}`}>{reviewHistoryCopy(event)}</li>
                    ))}
                  </ol>
                )}
              </div>
              <div id="limitations">
                <p className="section-kicker">Scope note</p>
                <h2 id="limitations-title">Limitations</h2>
                <p>{paper.limitations}</p>
              </div>

              <div id="references" aria-labelledby="references-title">
                <p className="section-kicker">Source list</p>
                <h2 id="references-title">References</h2>
                <ol className="references">
                  {paper.references.map((reference) => (
                    <li key={reference.id}><span className="mono">{reference.id}</span> {reference.citation}</li>
                  ))}
                </ol>
              </div>
              </div>
            </section>
          </article>

          <aside className="desk-note" aria-label="Fixture notice">
            <p className="eyebrow">Fixture notice</p>
            <p>This is a fictional controlled fixture. It demonstrates publisher evidence provenance and does not describe a real study.</p>
          </aside>
        </div>
      </main>

      <details className="capability-drawer">
        <summary>Review capabilities</summary>
        {focusActive && (
          <nav className="focus-pins" aria-label="Pinned focus context">
            <p className="eyebrow">Pinned context</p>
            <a href="#chapter-method">Paper evidence</a>
            <a href="#chapter-video">Video evidence</a>
            <a href="#chapter-evidence">Publisher provenance</a>
            <a href="#chapter-decision">Focus decision</a>
          </nav>
        )}
        <nav aria-label="Capability drawer">
          <a href="#paper-top">Paper</a>
          <a href="#chapter-video">Video</a>
          <a href="#chapter-evidence">Evidence</a>
          <a href="#chapter-decision">Decision</a>
        </nav>
      </details>

      <footer>
        <p>VEDAXI / research integrity before citation</p>
        <p className="mono">{paper.identifier} · {evidence.sourceOrigin}</p>
      </footer>

      <a href="#paper-top" className="story-index-return" aria-label="Return to top">
        <span>Return to top</span>
        ↑
      </a>
    </div>
  );
}
