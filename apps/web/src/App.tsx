import { useState } from "react";
import type { ExecutionFrame } from "@dp-explorer/playback";
import type { RegisteredTemplate } from "@dp-explorer/templates";
import { templateRegistry } from "@dp-explorer/templates";

import { createDemoSession } from "./demo-session";
import { FrameView } from "./frame-view";
import { PlaybackTimeline } from "./playback-timeline";

const templates = templateRegistry.list();
const firstTemplate = templates[0];

if (firstTemplate === undefined) {
  throw new Error("No templates are registered.");
}

const defaultTemplate: RegisteredTemplate = firstTemplate;

export function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplate.id);
  const [session, setSession] = useState(() => createDemoSession(defaultTemplate));
  const [frame, setFrame] = useState<ExecutionFrame>(() => session.currentFrame());

  function selectTemplate(id: string) {
    const template = templateRegistry.get(id);
    if (!template) {
      return;
    }

    const nextSession = createDemoSession(template);
    setSelectedTemplateId(id);
    setSession(nextSession);
    setFrame(nextSession.currentFrame());
  }

  return (
    <main>
      <h1>DP Explorer</h1>
      <p>Template verification shell</p>

      <label>
        Template
        <select
          value={selectedTemplateId}
          onChange={(event) => selectTemplate(event.target.value)}
          aria-label="Template"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </label>

      <nav aria-label="Playback controls">
        <button type="button" onClick={() => setFrame(session.previous())} disabled={frame.isFirst}>
          Previous
        </button>
        <button type="button" onClick={() => setFrame(session.next())} disabled={frame.isLast}>
          Next
        </button>
        <button type="button" onClick={() => setFrame(session.reset())} disabled={frame.isFirst}>
          Reset
        </button>
      </nav>

      <FrameView frame={frame} />

      <PlaybackTimeline
        frame={frame}
        onSeek={(index) => setFrame(session.controller.seek(index))}
      />
    </main>
  );
}
