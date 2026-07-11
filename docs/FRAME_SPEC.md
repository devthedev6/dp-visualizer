# Frame Specification

## Overview

The Playback Engine transforms an immutable `ExecutionTrace` into a sequence of immutable `ExecutionFrame`s.

An `ExecutionFrame` represents the **complete visualization state for one instant in time**. Every navigation operation (`next`, `previous`, `seek`) produces exactly one frame, which completely describes what should be displayed by the Visualization Layer.

```
Execution Trace
        │
        ▼
Playback Controller
        │
        ▼
Execution Frame
        │
        ▼
Visualization Layer
```

The Visualization Layer renders **exclusively** from an `ExecutionFrame`. It never reads the underlying `ExecutionTrace` directly.

A frame at index `i` always represents the application state **after** applying event `i`.

Consequently,

- `seek(0)` represents the first observable execution event.
- `seek(lastIndex)` always represents the fully completed execution.
- Every event—including `CALL`, `READ`, `WRITE`, and `RETURN`—is visible at the frame where it occurs.

---

# ExecutionFrame Interface

```ts
interface ExecutionFrame {
  /** Index into ExecutionTrace.events (0-based). */
  frameIndex: number;

  /** Event represented by this frame. */
  currentEvent: TraceEvent;

  /**
   * Metadata required for generic DP-table rendering.
   *
   * This allows the Visualization Layer to render tables without
   * accessing the ExecutionTrace directly.
   */
  table: DPTableMetadata;

  /**
   * Snapshot of every computed DP cell after this frame.
   *
   * Keys are serialized StateKeys.
   */
  dpSnapshot: ReadonlyMap<StateKey, number>;

  /**
   * Active recursive call chain.
   *
   * Empty for bottom-up execution.
   */
  callStack: readonly StateKey[];

  /**
   * Current recursion tree.
   *
   * Null for bottom-up execution.
   */
  recursionTree: RecursionTree | null;

  /**
   * Deepest active recursion node.
   *
   * Null when no recursive call is active.
   */
  activeNodeId: number | null;

  /**
   * Cells highlighted by the current frame.
   */
  highlightedCells: readonly HighlightedCell[];

  /**
   * Dependencies used by the current transition.
   *
   * Only populated for TRANSITION events.
   */
  resolvedDependencies: readonly StateKey[];

  /** True iff frameIndex == 0 */
  isFirst: boolean;

  /** True iff currentEvent.type == COMPLETE */
  isLast: boolean;

  /** Total frame count. */
  totalFrames: number;
}
```

---

# Supporting Types

```ts
type StateKey = string;
```

Coordinates serialized by the runtime.

Examples

```
"5"
"3,7"
"2,1,4"
```

---

```ts
interface HighlightedCell {
  state: StateKey;
  role: "active" | "dependency" | "memo-hit" | "base-case";
}
```

---

```ts
interface DPTableMetadata {
  /** Axis names. */
  stateVariables: readonly string[];

  /** Concrete dimensions for this execution. */
  dimensions: readonly number[];
}
```

Although the runtime supports arbitrary-dimensional state spaces, the current web application visualizes DP tables only for one- and two-dimensional specifications.

---

```ts
interface RecursionTree {
  nodes: ReadonlyMap<number, RecursionNode>;

  rootId: number;
}
```

---

```ts
interface RecursionNode {
  callEventId: number;

  parentCallId: number | null;

  state: StateKey;

  outcome: "return" | "memo-hit" | "base-case" | null;

  terminalEventId: number | null;

  value: number | null;
}
```

---

# Frame Derivation

Every field of an `ExecutionFrame` is deterministic.

To construct frame `i`, replay events

```
trace.events[0...i]
```

and derive each field according to the rules below.

---

## dpSnapshot

Replay both

- WRITE
- BASE_CASE

events.

Both write values into the snapshot.

```
WRITE
    snapshot[state] = value

BASE_CASE
    snapshot[state] = value
```

This ensures base-case states appear in the DP table immediately after they are evaluated.

---

## table

Copied directly from the immutable trace.

```
stateVariables
dimensions
```

No computation occurs.

---

## callStack

Replay events sequentially.

```
CALL
    push(state)

RETURN
BASE_CASE
MEMO_HIT
    pop()
```

Bottom-up execution produces no CALL events.

Therefore

```
callStack == []
```

for all bottom-up frames.

---

## recursionTree

Replay all CALL events encountered so far.

Each CALL creates one node.

RETURN

BASE_CASE

MEMO_HIT

resolve the corresponding node.

Bottom-up execution produces

```
recursionTree = null
```

for every frame.

---

## activeNodeId

The deepest unresolved recursion node.

Equivalent to the top of the current call stack.

Null whenever recursion is inactive.

---

## highlightedCells

Highlights are derived solely from the current event.

| Event      | Highlight           |
| ---------- | ------------------- |
| CALL       | active              |
| READ       | dependency          |
| TRANSITION | active + dependency |
| WRITE      | active              |
| BASE_CASE  | base-case           |
| MEMO_HIT   | memo-hit            |
| RETURN     | active              |
| COMPLETE   | none                |

---

## resolvedDependencies

Only TRANSITION events contain dependencies.

For every referenced READ id,

locate the corresponding READ event,

then collect its state.

The Playback Engine performs this lookup so the Visualization Layer never scans the trace.

---

## Navigation Flags

```
isFirst =
    frameIndex == 0

isLast =
    currentEvent.type == COMPLETE

totalFrames =
    trace.events.length
```

---

# Design Notes

The `ExecutionFrame` exists to separate execution from visualization.

The Runtime is responsible for evaluating dynamic programming recurrences.

The Playback Engine is responsible for replaying execution history.

The Visualization Layer is responsible only for rendering immutable frame data.

This separation keeps the user interface deterministic and prevents React components from reconstructing execution state.

---

# Scope

This specification defines the contract between the Playback Engine and the Visualization Layer.

It intentionally does **not** specify

- execution algorithms,
- trace generation,
- recurrence evaluation, or
- rendering implementation.

Those responsibilities are documented separately in

- `PLAYBACK_SPEC.md`
- `PROBLEM_SPEC.md`
- `ARCHITECTURE.md`
