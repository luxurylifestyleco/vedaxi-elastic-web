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
    ${item.action ? `<p class="action">${escapeHtml(item.action)}</p>` : ""}
  </article>`;

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

function render(status: BoardStatus) {
  const attentionCount = status.attention.length;
  app.innerHTML = `
    <main>
      <header class="topbar">
        <div>
          <p class="brand">VEDAXI · DELIVERY CONTROL</p>
          <p class="release-line">${escapeHtml(status.release.label)} · ${status.release.progress}%</p>
        </div>
        <div class="top-actions">
          <span class="freshness" id="freshness">Updated ${escapeHtml(formatUpdatedAt(status.updatedAt))}</span>
          <button class="icon-button" id="drawer-open" type="button" aria-haspopup="dialog">☰ <span>App drawer</span></button>
        </div>
      </header>

      <section class="focus" id="attention" tabindex="-1" aria-labelledby="attention-title">
        <p class="section-kicker">HUMAN ATTENTION · ${attentionCount} OPEN</p>
        <h1 id="attention-title">${attentionCount === 1 ? "One decision needs you." : `${attentionCount} decisions need you.`}</h1>
        <div class="attention-grid">
          ${status.attention.map((item) => renderItem(item, "attention-card")).join("")}
        </div>
      </section>

      <section class="workbench" aria-label="Delivery status">
        <div class="panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">FOR LOOKING</p>
              <h2>Agents working</h2>
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
            <div><p class="section-kicker">NO ACTION YET</p><h2>Check up on</h2></div>
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
