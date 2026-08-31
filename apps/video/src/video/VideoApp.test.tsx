import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createVideoFixture } from "./fixture";
import { createVideoEvidenceService } from "./service";

interface ElementProps {
  children?: ReactNode;
  [key: string]: unknown;
}

class FakeVideo extends EventTarget {
  readyState = 1;
  duration = 300;
  currentTime = 0;
  seekable = { length: 1, start: () => 0, end: () => 300 };
}

const video = new FakeVideo();

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useRef: () => ({ current: video as unknown as HTMLVideoElement }),
    useState: <T,>(initial: T) => [initial, vi.fn()] as const,
  };
});

import { VideoApp } from "./VideoApp";

function findElement(node: ReactNode, predicate: (element: ReactElement<ElementProps>) => boolean): ReactElement<ElementProps> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, predicate);
      if (match) return match;
    }
    return undefined;
  }
  if (!node || typeof node !== "object" || !("props" in node)) return undefined;
  const element = node as ReactElement<ElementProps>;
  return predicate(element) ? element : findElement(element.props.children, predicate);
}

describe("VideoApp evidence seek control", () => {
  function renderApp() {
    const fixture = createVideoFixture("https://video.example");
    return VideoApp({
      fixture,
      service: createVideoEvidenceService(fixture),
      protocol: { status: "active", enable: vi.fn(), disable: vi.fn() },
    });
  }

  it("displays 00:03:12 and seeks the labeled evidence control to exactly 192 seconds", () => {
    vi.stubGlobal("HTMLMediaElement", { HAVE_METADATA: 1 });
    video.currentTime = 0;
    const fixture = createVideoFixture("https://video.example");
    const tree = VideoApp({
      fixture,
      service: createVideoEvidenceService(fixture),
      protocol: { status: "active", enable: vi.fn(), disable: vi.fn() },
    });
    const button = findElement(tree, (element) => element.props["aria-label"] === "Seek video to transcript evidence at 00:03:12");

    expect(button).toBeDefined();
    const time = findElement(button?.props.children, (element) => element.type === "time");
    expect(time?.props.children).toBe("00:03:12");

    (button?.props.onClick as () => void)();
    expect(video.currentTime).toBe(192);
  });

  it("labels the media and enables captions by default", () => {
    const tree = renderApp();
    const media = findElement(tree, (element) => element.type === "video");
    const captions = findElement(media?.props.children, (element) => element.type === "track");

    expect(media?.props["aria-label"]).toBe("Recorded source video: calibration drift evidence");
    expect(captions?.props.default).toBe(true);
  });

  it("does not expose an unusable primary seek action before metadata loads", () => {
    const tree = renderApp();
    const button = findElement(
      tree,
      (element) => element.props["aria-label"] === "Seek to calibration drift evidence at 3 minutes 12 seconds",
    );

    expect(button?.props.disabled).toBe(true);
    expect(button?.props["aria-describedby"]).toBe("media-status");
  });

  it("announces protocol state changes and describes the protocol action", () => {
    const tree = renderApp();
    const protocolRegion = findElement(tree, (element) => element.props.className === "protocol");
    const protocolStatus = findElement(protocolRegion?.props.children, (element) => element.props.id === "protocol-status");
    const protocolButton = findElement(protocolRegion?.props.children, (element) => element.type === "button");

    expect(protocolStatus?.props.role).toBe("status");
    expect(protocolStatus?.props["aria-atomic"]).toBe("true");
    expect(protocolButton?.props["aria-describedby"]).toBe("protocol-status");
  });
});
