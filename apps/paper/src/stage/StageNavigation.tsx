export const STAGE_CHAPTERS = [
  { id: "paper-top", label: "Paper", focusTargetId: "paper-title" },
  { id: "chapter-method", label: "Method", focusTargetId: "methods-title" },
  { id: "chapter-video", label: "Video", focusTargetId: "video-title" },
  { id: "chapter-evidence", label: "Evidence", focusTargetId: "evidence-title" },
  { id: "chapter-decision", label: "Decision", focusTargetId: "focus-decision-title" }
] as const;

export type StageChapterId = (typeof STAGE_CHAPTERS)[number]["id"];

interface ChapterPosition {
  id: StageChapterId;
  top: number;
}

interface ChapterFocusDocument {
  getElementById(id: string): {
    focus(options?: FocusOptions): void;
    scrollIntoView(options?: ScrollIntoViewOptions): void;
  } | null;
}

export function handleStageChapterActivation(
  id: StageChapterId,
  clickDetail: number,
  documentRef: ChapterFocusDocument = document
): void {
  if (clickDetail !== 0) return;

  const chapter = STAGE_CHAPTERS.find((candidate) => candidate.id === id);
  const target = chapter ? documentRef.getElementById(chapter.focusTargetId) : null;
  if (!target) return;

  documentRef.getElementById(id)?.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}

export function handleStageChapterKeyDown(
  id: StageChapterId,
  event: { key: string; preventDefault(): void },
  onNavigate: (id: StageChapterId) => void,
  documentRef: ChapterFocusDocument = document,
  locationRef: Pick<Location, "hash"> = window.location
): void {
  if (event.key !== "Enter") return;

  onNavigate(id);
  event.preventDefault();
  locationRef.hash = `#${id}`;
  handleStageChapterActivation(id, 0, documentRef);
}

export function selectActiveChapter(
  positions: readonly ChapterPosition[],
  fallback: StageChapterId
): StageChapterId {
  if (positions.length === 0) return fallback;

  const readingLine = 160;
  const reached = positions.filter(({ top }) => top <= readingLine);
  return (reached.at(-1) ?? positions[0]).id;
}

function ChapterLinks({
  activeChapter,
  onNavigate
}: {
  activeChapter: StageChapterId;
  onNavigate: (id: StageChapterId) => void;
}) {
  return (
    <ol>
      {STAGE_CHAPTERS.map((chapter, index) => (
        <li key={chapter.id}>
          <a
            href={`#${chapter.id}`}
            aria-current={activeChapter === chapter.id ? "location" : undefined}
            onKeyDown={(event) => {
              handleStageChapterKeyDown(chapter.id, event, onNavigate);
            }}
            onClick={() => {
              onNavigate(chapter.id);
            }}
          >
            <span className="stage-navigation__number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{chapter.label}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function StageNavigation({
  variant,
  activeChapter,
  onActiveChapterChange,
  announce
}: {
  variant: "desktop" | "mobile";
  activeChapter: StageChapterId;
  onActiveChapterChange: (id: StageChapterId) => void;
  announce: boolean;
}) {
  const activeIndex = STAGE_CHAPTERS.findIndex(({ id }) => id === activeChapter);
  const activeLabel = STAGE_CHAPTERS[activeIndex]?.label ?? STAGE_CHAPTERS[0].label;
  const announcement = (
    <span className="visually-hidden" aria-live="polite" aria-atomic="true">
      Chapter {activeIndex + 1} of {STAGE_CHAPTERS.length}: {activeLabel}
    </span>
  );

  return (
    <>
      {variant === "desktop" && (
        <div className="stage-navigation-desktop-shell">
          <nav className="stage-navigation" aria-label="Semantic Stage chapters">
            <p className="eyebrow">Five-chapter review</p>
            <ChapterLinks activeChapter={activeChapter} onNavigate={onActiveChapterChange} />
          </nav>
        </div>
      )}

      {variant === "mobile" && (
        <div className="stage-navigation-mobile-shell">
          <nav className="stage-navigation-mobile" aria-label="Semantic Stage chapters on small screens">
            <ChapterLinks activeChapter={activeChapter} onNavigate={onActiveChapterChange} />
          </nav>
        </div>
      )}
      {announce && announcement}
    </>
  );
}
