import { describe, expect, it } from "vitest";
import { templateRegistry } from "@dp-explorer/templates";

import { createDemoSession } from "../src/demo-session";

const fibonacciTemplate = templateRegistry.get("fibonacci");

if (fibonacciTemplate === undefined) {
  throw new Error("Fibonacci template is not registered.");
}

describe("createDemoSession", () => {
  it("starts at the first frame", () => {
    const session = createDemoSession({
      ...fibonacciTemplate,
      defaultInput: { n: 3 }
    });
    const frame = session.currentFrame();

    expect(frame.frameIndex).toBe(0);
    expect(frame.currentEvent.type).toBe("CALL");
    expect(frame.isFirst).toBe(true);
  });

  it("moves next, previous, and reset through ExecutionFrames", () => {
    const session = createDemoSession({
      ...fibonacciTemplate,
      defaultInput: { n: 3 }
    });

    expect(session.next().frameIndex).toBe(1);
    expect(session.next().frameIndex).toBe(2);
    expect(session.previous().frameIndex).toBe(1);
    expect(session.reset().frameIndex).toBe(0);
  });

  it("respects frame boundaries", () => {
    const session = createDemoSession({
      ...fibonacciTemplate,
      defaultInput: { n: 3 }
    });

    expect(session.previous().frameIndex).toBe(0);
    const last = session.currentFrame().totalFrames - 1;
    for (let i = 0; i < 100; i += 1) {
      session.next();
    }

    expect(session.currentFrame().frameIndex).toBe(last);
    expect(session.next().frameIndex).toBe(last);
  });

  it("produces the same sequence of displayed frame facts for the same trace", () => {
    const first = readFrameFacts({
      ...fibonacciTemplate,
      defaultInput: { n: 3 }
    });
    const second = readFrameFacts({
      ...fibonacciTemplate,
      defaultInput: { n: 3 }
    });

    expect(second).toEqual(first);
  });

  it("creates a session using registered default Fibonacci input", () => {
    const session = createDemoSession(fibonacciTemplate);

    expect(session.currentFrame().frameIndex).toBe(0);
    expect(session.currentFrame().currentEvent.type).toBe("CALL");
  });
});

function readFrameFacts(template: Parameters<typeof createDemoSession>[0]) {
  const session = createDemoSession(template);
  const facts = [];
  let frame = session.currentFrame();

  while (true) {
    facts.push({
      frameIndex: frame.frameIndex,
      totalFrames: frame.totalFrames,
      eventType: frame.currentEvent.type,
      state: "state" in frame.currentEvent ? frame.currentEvent.state : null,
      callStack: [...frame.callStack],
      dpSnapshot: Object.fromEntries(frame.dpSnapshot.entries())
    });

    if (frame.isLast) {
      return facts;
    }

    frame = session.next();
  }
}
