export type BoardItem = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  action?: string;
  href?: string;
};

export type AgentItem = {
  id: string;
  name: string;
  focus: string;
  state: "working" | "waiting";
};

export type BoardStatus = {
  version: 1;
  updatedAt: string;
  release: {
    label: string;
    progress: number;
    summary: string;
  };
  attention: BoardItem[];
  agents: AgentItem[];
  watch: BoardItem[];
  drawer: {
    done: BoardItem[];
    milestones: BoardItem[];
    evidence: BoardItem[];
  };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isBoardItem = (value: unknown): value is BoardItem =>
  isObject(value) &&
  isString(value.id) &&
  isString(value.eyebrow) &&
  isString(value.title) &&
  isString(value.detail) &&
  (value.action === undefined || isString(value.action)) &&
  (value.href === undefined ||
    (isString(value.href) && (value.href.startsWith("https://") || value.href.startsWith("/"))));

const isAgentItem = (value: unknown): value is AgentItem =>
  isObject(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.focus) &&
  (value.state === "working" || value.state === "waiting");

export function parseBoardStatus(value: unknown): BoardStatus {
  if (!isObject(value) || value.version !== 1 || !isString(value.updatedAt)) {
    throw new Error("Board status has an unsupported shape.");
  }

  const release = value.release;
  const drawer = value.drawer;
  if (
    !isObject(release) ||
    !isString(release.label) ||
    typeof release.progress !== "number" ||
    release.progress < 0 ||
    release.progress > 100 ||
    !isString(release.summary) ||
    !Array.isArray(value.attention) ||
    !value.attention.every(isBoardItem) ||
    !Array.isArray(value.agents) ||
    !value.agents.every(isAgentItem) ||
    !Array.isArray(value.watch) ||
    !value.watch.every(isBoardItem) ||
    !isObject(drawer) ||
    !Array.isArray(drawer.done) ||
    !drawer.done.every(isBoardItem) ||
    !Array.isArray(drawer.milestones) ||
    !drawer.milestones.every(isBoardItem) ||
    !Array.isArray(drawer.evidence) ||
    !drawer.evidence.every(isBoardItem)
  ) {
    throw new Error("Board status failed validation.");
  }

  const ids = [
    ...value.attention.map((item) => item.id),
    ...value.agents.map((item) => item.id),
    ...value.watch.map((item) => item.id),
    ...drawer.done.map((item) => item.id),
    ...drawer.milestones.map((item) => item.id),
    ...drawer.evidence.map((item) => item.id),
  ];
  if (new Set(ids).size !== ids.length) {
    throw new Error("Every board entry must have a unique id.");
  }

  return value as BoardStatus;
}
