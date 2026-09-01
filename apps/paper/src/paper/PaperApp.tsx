import { type FormEvent, useEffect, useRef, useState } from "react";

import type { EvidenceSearchResult } from "@vedaxi/contracts";
import type {
  FocusRequest,
  PublisherAction,
  PublisherResult,
  PublisherState
} from "@vedaxi/state";

import { EditionWorld } from "../stage/EditionWorld";
import { FireBurnReveal } from "../stage/FireBurnReveal";
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

function ProtocolStatus({ protocol }: { protocol: PaperProtocolControls }) {
  const isActive = protocol.status === "active";
  const isChecking = protocol.status === "checking";

  return (
    <section className="protocol" aria-labelledby="protocol-title">
      <div>
        <p className="eyebrow" id="protocol-title">Native protocol</p>
        <p className="protocol__status" data-status={protocol.status} aria-live="polite">
          <span aria-hidden="true" className="protocol__marker" />
          {protocolStatusCopy(protocol.status)}
        </p>
      </div>
      <button
        className="text-button"
        type="button"
        disabled={isChecking}
        onClick={isActive ? protocol.disable : protocol.enable}
      >
        {isChecking ? "Checking…" : isActive ? "Turn agent tools off" : "Check native tools"}
      </button>
    </section>
  );
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
          href="#methods-participants"
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

  useEffect(() => {
    setStageRestored(false);
  }, [focus]);

  return (
    <div className="edition-desk">
      <a className="skip-link" href="#paper-content">Skip to paper</a>
      <header className="masthead">
        <a className="identity" href="#paper-top" aria-label="VEDAXI Paper Integrity Desk home">
          <span className="identity__mark" aria-hidden="true">V</span>
          <span>VEDAXI</span>
        </a>
        <p>Paper Integrity Desk</p>
        <p className="mono">Five-chapter gallery</p>
      </header>

      <main id="paper-content" tabIndex={-1}>
        <PaperSearch service={service} />

        <section className="focus-preview" aria-labelledby="focus-preview-title">
          <div>
            <p className="eyebrow">Controlled preview — not live agent success</p>
            <h2 id="focus-preview-title">Semantic Focus Shift</h2>
            <p>Stages an externally supplied comparison for explicit human review.</p>
          </div>
          <button
            type="button"
            disabled={hasFocus}
            onClick={() => dispatchPublisher(requestFocusAction(CONTROLLED_FOCUS_REQUEST))}
          >
            {hasFocus ? "Focus review active" : "Run deterministic focus preview"}
          </button>
        </section>
        {publisherError && (
          <div className="publisher-error" role="alert">
            <p>{publisherError}</p>
            <button type="button" onClick={() => dispatchPublisher(resetPublisherAction())}>
              Reset failed review
            </button>
          </div>
        )}

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
          <ProtocolStatus protocol={protocol} />
        </section>

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
                <p role="status">
                  {videoAvailable === null
                    ? "Checking whether the independent Video publisher is available."
                    : "Independent Video publisher could not be verified or is unavailable. No embedded evidence is shown."}
                </p>
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
                <FireBurnReveal evidence={evidence} />
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
    </div>
  );
}
