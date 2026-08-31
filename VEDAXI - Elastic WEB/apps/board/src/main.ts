import "./styles.css";
import { parseBoardStatus, type BoardItem, type BoardStatus } from "./status";

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("Board root is missing.");
const app: HTMLDivElement = appRoot;

let currentStatus: BoardStatus | null = null;
let refreshTimer: number | undefined;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );

const renderItem = (item: BoardItem, className = "card") => `
  <article class="${className}" data-search="${escapeHtml(
    `${item.eyebrow} ${item.title} ${item.detail}`.toLowerCase(),
  )}">
    <p class="eyebrow">${escapeHtml(item.eyebrow)}</p>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.detail)}</p>
    ${
      item.href
        ? `<a class="card-link" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">${escapeHtml(item.action ?? "Check output")}</a>`
        : item.action
          ? `<p class="action">${escapeHtml(item.action)}</p>`
          : ""
    }
  </article>`;

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

function render(status: BoardStatus) {
  app.innerHTML = `
    <main>
      <header class="topbar">
        <div>
          <p class="brand">VEDAXI · EVIDENCE CONTROL</p>
          <p class="release-line">${escapeHtml(status.release.label)}</p>
        </div>
        <div class="top-actions">
          <span class="freshness" id="freshness">Updated ${escapeHtml(formatUpdatedAt(status.updatedAt))}</span>
          <button class="icon-button" id="drawer-open" type="button" aria-haspopup="dialog">☰ <span>App drawer</span></button>
        </div>
      </header>

      <section class="status-hero" id="attention" tabindex="-1" aria-labelledby="attention-title">
        <div class="progress-block">
          <p class="section-kicker">EVIDENCE-BASED RELEASE PROGRESS</p>
          <p class="progress-number">${status.release.progress}<span>%</span></p>
          <p class="progress-basis">1 of 5 release milestones has met its stop condition.</p>
        </div>
        <div class="status-story">
          <p class="risk-line">AT RISK · DEVPOST CLOSES 03 SEP · 20:00 UTC</p>
          <h1 id="attention-title">Protocol proven.<br />Release not ready.</h1>
          <p class="status-summary">${escapeHtml(status.release.summary)}</p>
          <div class="metric-grid" aria-label="Current project metrics">
            <div><strong>1 / 7</strong><span>formal module exits</span></div>
            <div><strong>110 / 110</strong><span>tests passing</span></div>
            <div><strong>${status.agents.filter((agent) => agent.state === "working").length}</strong><span>active agent</span></div>
            <div><strong>15</strong><span>changed paths</span></div>
          </div>
        </div>
      </section>

      <section class="gate-rail" aria-label="Module gate status">
        ${status.drawer.milestones.map((item) => `<article class="gate ${item.eyebrow.includes("PASS") ? "pass" : item.eyebrow.includes("BLOCKED") ? "blocked" : "pending"}"><span>${escapeHtml(item.id.replace("module.", "").toUpperCase())}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.eyebrow.split(" · ").at(-1) ?? "")}</small></article>`).join("")}
      </section>

      <section class="current-gate" aria-label="Current critical path">
        <div><p class="section-kicker">CURRENT GATE</p><h2>M1 · Paper browser evidence</h2></div>
        <p>Paper source works. Fresh keyboard traversal and a 390 × 844 observation are still required. M2 code exists ahead of the formal gate, but real media is missing.</p>
      </section>

      <section class="workbench" aria-label="Delivery status">
        <div class="panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">LIVE ROSTER</p>
              <h2>Agents working now</h2>
            </div>
            <span class="count">${status.agents.filter((agent) => agent.state === "working").length} active</span>
          </div>
          <div class="agent-list">
            ${
              status.agents.length
                ? status.agents
                    .map(
                      (agent) => `<article class="agent-row">
                        <span class="agent-state ${agent.state}" aria-hidden="true"></span>
                        <div><h3>${escapeHtml(agent.name)}</h3><p>${escapeHtml(agent.focus)}</p></div>
                        <span class="state-label">${escapeHtml(agent.state)}</span>
                      </article>`,
                    )
                    .join("")
                : '<p class="empty">No agents are running. The next module is queued behind the visible decision.</p>'
            }
          </div>
        </div>

        <div class="panel watch-panel">
          <div class="panel-heading">
            <div><p class="section-kicker">RELEASE VETOES</p><h2>What blocks us</h2></div>
            <span class="count">${status.watch.length}</span>
          </div>
          <div class="watch-list">${status.watch.map((item) => renderItem(item, "watch-card")).join("")}</div>
        </div>
      </section>

      <footer>
        <span>${escapeHtml(status.release.summary)}</span>
        <span>Auto-checks every 30 seconds</span>
      </footer>
    </main>

    <dialog class="drawer" id="drawer" aria-labelledby="drawer-title">
      <div class="drawer-header">
        <div><p class="section-kicker">HISTORY & DETAIL</p><h2 id="drawer-title">App drawer</h2></div>
        <button class="close-button" id="drawer-close" type="button" aria-label="Close app drawer">×</button>
      </div>
      <label class="drawer-search">Search drawer <span>/</span><input id="drawer-filter" type="search" autocomplete="off" /></label>
      <section class="drawer-section"><h3>Done</h3><div class="drawer-grid">${status.drawer.done.map((item) => renderItem(item, "drawer-card")).join("")}</div></section>
      <section class="drawer-section"><h3>Milestones</h3><div class="drawer-grid">${status.drawer.milestones.map((item) => renderItem(item, "drawer-card")).join("")}</div></section>
      <section class="drawer-section"><h3>Evidence</h3><div class="drawer-grid">${status.drawer.evidence.map((item) => renderItem(item, "drawer-card")).join("")}</div></section>
    </dialog>`;

  const drawer = document.querySelector<HTMLDialogElement>("#drawer");
  const openButton = document.querySelector<HTMLButtonElement>("#drawer-open");
  const closeButton = document.querySelector<HTMLButtonElement>("#drawer-close");
  const filter = document.querySelector<HTMLInputElement>("#drawer-filter");
  if (!drawer || !openButton || !closeButton || !filter) return;

  openButton.addEventListener("click", () => drawer.showModal());
  closeButton.addEventListener("click", () => drawer.close());
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) drawer.close();
  });
  drawer.addEventListener("close", () => openButton.focus());
  filter.addEventListener("input", () => {
    const query = filter.value.trim().toLowerCase();
    drawer.querySelectorAll<HTMLElement>("[data-search]").forEach((card) => {
      card.hidden = query.length > 0 && !card.dataset.search?.includes(query);
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !drawer.open) {
      event.preventDefault();
      drawer.showModal();
      filter.focus();
    }
  });
}

function renderError() {
  if (currentStatus) {
    const freshness = document.querySelector("#freshness");
    if (freshness) freshness.textContent = "Update delayed · showing last known status";
    return;
  }
  app.innerHTML = `<main class="error-state"><p class="brand">VEDAXI · DELIVERY CONTROL</p><h1>Board update unavailable.</h1><p>The last published status could not be loaded. Try refreshing shortly.</p><button type="button" id="retry">Retry</button></main>`;
  document.querySelector("#retry")?.addEventListener("click", () => void loadStatus());
}

async function loadStatus() {
  try {
    const response = await fetch(`/status.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
    const nextStatus = parseBoardStatus(await response.json());
    if (!currentStatus || nextStatus.updatedAt !== currentStatus.updatedAt) {
      currentStatus = nextStatus;
      render(nextStatus);
    }
  } catch {
    renderError();
  }
}

void loadStatus();
refreshTimer = window.setInterval(() => void loadStatus(), 30_000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) void loadStatus();
});
window.addEventListener("pagehide", () => window.clearInterval(refreshTimer));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline enhancement is best-effort; the live board remains usable without it.
    });
  });
}
