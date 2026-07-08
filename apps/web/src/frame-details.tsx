import type { ExecutionFrame } from "@dp-explorer/playback";

import "./frame-details.css";

export interface FrameDetailsProps {
  readonly frame: ExecutionFrame;
}

export function FrameDetails({ frame }: FrameDetailsProps) {
  return (
    <section className="frame-details" aria-label="Current execution frame">
      <dl>
        <div>
          <dt>Current frame</dt>
          <dd data-testid="frame-position">
            {frame.frameIndex + 1} / {frame.totalFrames}
          </dd>
        </div>
        <div>
          <dt>Current event</dt>
          <dd data-testid="event-type">{frame.currentEvent.type}</dd>
        </div>
        <div>
          <dt>Current state</dt>
          <dd data-testid="current-state">{readCurrentState(frame) ?? "N/A"}</dd>
        </div>
      </dl>

      <section>
        <h2>Call stack</h2>
        <ul data-testid="call-stack">
          {frame.callStack.length === 0 ? (
            <li>Empty</li>
          ) : (
            frame.callStack.map((state, index) => <li key={`${state}-${index}`}>{state}</li>)
          )}
        </ul>
      </section>
    </section>
  );
}

function readCurrentState(frame: ExecutionFrame): string | null {
  return "state" in frame.currentEvent ? frame.currentEvent.state : null;
}
