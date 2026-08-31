import { type FormEvent, useState } from "react";

import type { EvidenceSearchResult } from "@vedaxi/contracts";

import type { PaperFixture } from "./fixture";
import { protocolStatusCopy } from "./protocol-status";
import type { PaperEvidenceService } from "./service";
import type { PaperProtocolControls } from "./use-paper-registration";

export interface PaperAppProps {
  fixture: PaperFixture;
  service: PaperEvidenceService;
  protocol: PaperProtocolControls;
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

  const suggestions = [
    "final analyzed sample",
    "forty participants",
    "included in the final analysis"
  ] as const;

  const runSearch = (nextQuery: string) => {
    setQuery(nextQuery);
    setResults(service.search(nextQuery));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(query);
  };

  const message =
    results === null
      ? "Search the publisher’s paper evidence."
      : results.length === 0
        ? "No matching paper evidence."
        : `${results.length} matching paper passage found.`;

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
          <button key={suggestion} type="button" onClick={() => runSearch(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
      <p className="search-message" aria-live="polite">{message}</p>
      {results?.map(({ evidence, score }) => (
        <a className="search-result" href="#methods-participants" key={evidence.id}>
          <span>{evidence.title}</span>
          <span className="mono">{evidence.locator} · {score} exact query terms</span>
        </a>
      ))}
    </section>
  );
}

export function PaperApp({ fixture, service, protocol }: PaperAppProps) {
  const paper = fixture.document;
  const evidence = fixture.evidence;

  return (
    <>
      <a className="skip-link" href="#paper-content">Skip to paper</a>
      <header className="masthead">
        <a className="identity" href="#paper-top" aria-label="VEDAXI Paper Integrity Desk home">
          <span className="identity__mark" aria-hidden="true">V</span>
          <span>VEDAXI</span>
        </a>
        <p>Paper Integrity Desk</p>
        <p className="mono">Controlled research note</p>
      </header>

      <main id="paper-content" tabIndex={-1}>
        <PaperSearch service={service} />

        <section className="paper-hero" id="paper-top" aria-labelledby="paper-title">
          <div className="paper-hero__meta">
            <p>{paper.journal}</p>
            <p>{paper.published}</p>
            <p className="mono">{paper.identifier}</p>
          </div>
          <div className="paper-hero__title">
            <p className="eyebrow">Research note / methods integrity</p>
            <h1 id="paper-title">{paper.title}</h1>
            <p className="dek">{paper.dek}</p>
            <p className="authors">{paper.authors.join(" · ")}</p>
          </div>
          <ProtocolStatus protocol={protocol} />
        </section>

        <div className="paper-layout">
          <nav className="paper-outline" aria-label="Paper outline">
            <p className="eyebrow">In this paper</p>
            <ol>
              <li><a href="#abstract">Abstract</a></li>
              <li><a href="#methods">Methods</a></li>
              <li><a href="#study-flow">Study flow</a></li>
              <li><a href="#limitations">Limitations</a></li>
              <li><a href="#references">References</a></li>
            </ol>
          </nav>

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

          <article className="paper-article">
            <section id="abstract" aria-labelledby="abstract-title">
              <p className="section-kicker">Study overview</p>
              <h2 id="abstract-title">Abstract</h2>
              <p className="lead">{paper.abstract}</p>
            </section>

            <section id="methods" aria-labelledby="methods-title">
              <p className="section-kicker">Participant accounting</p>
              <h2 id="methods-title">Methods</h2>
              <p>{paper.methodsIntroduction}</p>
              <div className="evidence-row" id="methods-participants">
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
            </section>

            <section id="study-flow" aria-labelledby="study-flow-title">
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
            </section>

            <section id="limitations" aria-labelledby="limitations-title">
              <p className="section-kicker">Scope note</p>
              <h2 id="limitations-title">Limitations</h2>
              <p>{paper.limitations}</p>
            </section>

            <section id="references" aria-labelledby="references-title">
              <p className="section-kicker">Source list</p>
              <h2 id="references-title">References</h2>
              <ol className="references">
                {paper.references.map((reference) => (
                  <li key={reference.id}><span className="mono">{reference.id}</span> {reference.citation}</li>
                ))}
              </ol>
            </section>
          </article>

          <aside className="desk-note" aria-label="Fixture notice">
            <p className="eyebrow">Fixture notice</p>
            <p>This is a fictional controlled fixture. It demonstrates publisher evidence provenance and does not describe a real study.</p>
          </aside>
        </div>

      </main>

      <footer>
        <p>VEDAXI / research integrity before citation</p>
        <p className="mono">{paper.identifier} · {evidence.sourceOrigin}</p>
      </footer>
    </>
  );
}
