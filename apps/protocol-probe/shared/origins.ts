export const PAPER_SERVER_PORT = 4173;
export const VIDEO_SERVER_PORT = 4174;

export const PAPER_ORIGIN = `http://localhost:${PAPER_SERVER_PORT}`;
export const VIDEO_ORIGIN = `http://localhost:${VIDEO_SERVER_PORT}`;

export const PAPER_VIDEO_FRAME = {
  src: VIDEO_ORIGIN,
  title: "Independent video evidence publisher",
  allow: "tools"
} as const;
