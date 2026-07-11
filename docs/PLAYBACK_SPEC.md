# Playback Engine Specification

## Overview

The Playback Engine is responsible for transforming an immutable
`ExecutionTrace` into a sequence of immutable `ExecutionFrame`s suitable for
visualization.

It acts as the bridge between execution and rendering.

```
Execution Engine
        │
        ▼
 Execution Trace
        │
        ▼
 Playback Engine
        │
        ▼
 Execution Frames
        │
        ▼
 Visualization Layer
```

The Playback Engine never evaluates dynamic programming recurrences.

Its responsibility is limited to replaying an execution history.

---

# Responsibilities

The Playback Engine is responsible for:

- replaying execution traces
- navigating between execution frames
- constructing immutable `ExecutionFrame`s
- deriving visualization state
- exposing deterministic playback controls

The Playback Engine is **not** responsible for:

- executing DP algorithms
- scheduling timers
- rendering UI
- managing React state
- evaluating recurrence relations

---

# Architecture

The Playback subsystem consists of two components.

```
Execution Trace
        │
        ▼
PlaybackController
        │
        ▼
ExecutionFrame
```

The controller owns navigation.

Frames own visualization state.

---

# PlaybackController

The `PlaybackController` provides deterministic navigation through an execution
trace.

```ts
interface PlaybackController {
  next(): ExecutionFrame;

  previous(): ExecutionFrame;

  seek(index: number): ExecutionFrame;

  currentFrame(): ExecutionFrame;
}
```

Every navigation operation returns the frame representing the requested point
in execution.

---

# Factory

```ts
function createPlaybackController(
  trace: ExecutionTrace,
  options?: {
    initialIndex?: number;
  }
): PlaybackController;
```

Controllers are always created for a single immutable execution trace.

A controller never changes the underlying trace.

---

# Navigation Semantics

Playback is index-based.

```
Trace

0
1
2
3
4
5
...
```

The controller maintains one integer

```
currentIndex
```

Every navigation operation changes only this index.

Frames themselves remain immutable.

---

## next()

Moves to

```
currentIndex + 1
```

No-op at the last frame.

---

## previous()

Moves to

```
currentIndex - 1
```

No-op at frame zero.

---

## seek(index)

Moves directly to the requested frame.

Indices outside the valid range are clamped.

```
[-∞ , totalFrames)

↓

[0 , totalFrames-1]
```

---

## currentFrame()

Returns the current frame without changing playback state.

---

# Deterministic Playback

Playback is purely deterministic.

Given

```
ExecutionTrace
```

and

```
Frame Index
```

the produced `ExecutionFrame` is always identical.

Formally,

```
ExecutionFrame
=
Playback(trace, index)
```

No previous navigation history influences the result.

This property makes playback:

- reproducible
- deterministic
- easy to test

---

# ExecutionFrame

Every playback step produces one immutable `ExecutionFrame`.

Frames contain the complete visualization state required by the UI.

The Visualization Layer never accesses the `ExecutionTrace` directly.

The complete frame specification is defined in
`FRAME_SPEC.md`.

---

# Relationship with the Runtime

The Runtime and Playback Engine are intentionally independent.

```
ProblemSpec
        │
        ▼
Runtime
        │
        ▼
Execution Trace
        │
        ▼
Playback
```

The Runtime owns:

- execution
- dependency evaluation
- memoization
- trace generation

The Playback Engine owns:

- navigation
- replay
- visualization state derivation

Neither subsystem depends on the implementation details of the other.

---

# Relationship with the Visualization Layer

The Visualization Layer renders exclusively from `ExecutionFrame`.

```
ExecutionFrame

↓

React Components

↓

Rendered UI
```

React components never:

- scan execution traces
- replay events
- reconstruct call stacks
- derive dependency highlights

All such computation belongs to the Playback Engine.

This separation keeps UI components simple and deterministic.

---

# Integration

The playback package is framework-independent.

Applications may drive playback using any mechanism, including:

- manual stepping
- timers
- animation frames
- keyboard shortcuts
- automated tests

The web application currently manages playback using a lightweight React hook,
but this is an application concern rather than part of the playback package.

---

# Testing

Playback is straightforward to unit test because it contains no asynchronous
behavior.

Typical tests invoke

```
next()

previous()

seek()
```

directly and compare the resulting immutable frames.

No timer mocking is required.

---

# Design Principles

The Playback Engine follows four architectural principles.

## Immutable Inputs

Execution traces are immutable.

Playback never mutates them.

---

## Immutable Outputs

Every produced frame is immutable.

Frames may be cached, compared, or revisited without side effects.

---

## Pure Navigation

Navigation modifies only the current playback index.

It never modifies execution history.

---

## Framework Independence

Playback has no dependency on React or browser APIs.

It can be reused by alternative frontends without modification.

---

# Scope

The Playback Engine intentionally does not define:

- execution algorithms
- recurrence evaluation
- visualization implementation
- animation timing
- UI controls

Those responsibilities belong respectively to

- `PROBLEM_SPEC.md`
- `ARCHITECTURE.md`
- `FRAME_SPEC.md`
- the web application.

---

# Related Documentation

| Document          | Description                   |
| ----------------- | ----------------------------- |
| `ARCHITECTURE.md` | Overall system architecture   |
| `PROBLEM_SPEC.md` | Runtime execution interface   |
| `FRAME_SPEC.md`   | Execution frame specification |
| `COMPILER.md`     | Compilation pipeline          |
| `UI_SPEC.md`      | Visualization layer           |
