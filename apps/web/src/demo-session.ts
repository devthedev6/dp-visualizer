import { runTopDown } from "@dp-explorer/core";
import type { ExecutionFrame, PlaybackController } from "@dp-explorer/playback";
import { createPlaybackController } from "@dp-explorer/playback";
import type { RegisteredTemplate } from "@dp-explorer/templates";

export interface DemoSession {
  readonly controller: PlaybackController;
  currentFrame(): ExecutionFrame;
  next(): ExecutionFrame;
  previous(): ExecutionFrame;
  reset(): ExecutionFrame;
}

/**
 * Compose the architecture pipeline for a registered DP template.
 *
 * Accepts any template from the registry and produces a playable demo session
 * using the template's default input.
 */
export function createDemoSession(template: RegisteredTemplate): DemoSession {
  const trace = runTopDown(template.spec, template.defaultInput);
  const controller = createPlaybackController(trace);

  return Object.freeze({
    controller,
    currentFrame: () => controller.currentFrame(),
    next: () => controller.next(),
    previous: () => controller.previous(),
    reset: () => controller.seek(0)
  });
}
