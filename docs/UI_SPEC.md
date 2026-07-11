# User Interface Specification

## Overview

The DP Explorer web application consists of two primary interfaces.

```
Specification Builder
            │
            ▼
      ProblemSpec
            │
            ▼
Execution & Visualization
```

The Builder is responsible for authoring dynamic programming specifications.

The Visualization interface is responsible for executing and exploring those specifications.

Both interfaces communicate exclusively through the compiled `ProblemSpec`.

---

# Design Principles

The user interface follows four guiding principles.

## Educational Before Decorative

Every visual element should improve understanding of dynamic programming.

Animations exist to communicate execution rather than to provide visual effects.

---

## One Source of Truth

The interface renders exclusively from immutable `ExecutionFrame`s.

The UI never recomputes dynamic programming logic.

---

## Synchronized Views

Every visualization panel represents the same execution frame.

Changing the playback position updates every panel simultaneously.

---

## Progressive Disclosure

Simple examples should appear approachable.

More advanced functionality becomes visible only when required.

---

# Specification Builder

The Builder guides the user through constructing a dynamic programming specification.

The workflow is divided into sequential stages.

```
Metadata

↓

Symbols

↓

State

↓

Base Cases

↓

Transitions

↓

Root State

↓

Answer

↓

Review & Compile
```

Each stage validates its own inputs before compilation.

The Builder never executes dynamic programming algorithms directly.

---

## Runtime Input Panel

After successful compilation, runtime inputs are displayed according to the generated input schema.

Supported input types include:

- integers
- strings
- boolean values
- one-dimensional arrays
- nested arrays

The parser accepts a canonical JSON-based syntax.

Examples are displayed alongside each input field.

---

# Visualization Interface

After execution begins, the interface is organized into coordinated panels.

```
Problem Information

────────────────────────────────────────────

Recursion Tree      DP Table

────────────────────────────────────────────

Answer Panel

────────────────────────────────────────────

Timeline

Playback Controls
```

Each panel visualizes a different aspect of the same execution.

---

## DP Table

The DP Table visualizes computed states.

Current version supports

- one-dimensional tables
- two-dimensional tables

Specifications with three or more dimensions execute normally, but display an informational message instead of a table.

---

## Recursion Tree

Available only during Top-Down execution.

Displays:

- active recursive path
- completed calls
- memoization hits
- base cases

Bottom-Up execution hides the recursion tree because no recursive call hierarchy exists.

---

## Answer Panel

Displays the value extracted by `ProblemSpec.extractAnswer(...)`.

The Answer Panel reflects the result recorded in the final execution trace rather than re-evaluating the specification.

---

## Timeline

Represents execution progress.

Each step corresponds to one event in the execution trace.

Users may:

- jump to any frame
- scrub through execution
- inspect intermediate states

---

## Playback Controls

Supported actions include:

- Play
- Pause
- Next
- Previous
- Jump to Frame

Playback navigation is deterministic and operates entirely on immutable execution frames.

---

# Visual Language

DP Explorer uses consistent semantic highlighting across every visualization.

| Meaning    | Purpose                          |
| ---------- | -------------------------------- |
| Active     | State currently being processed  |
| Dependency | State currently being read       |
| Base Case  | Base-case evaluation             |
| Memo Hit   | Previously computed value reused |
| Computed   | Newly written DP value           |
| Unknown    | Cell not yet computed            |

These semantic roles remain consistent across tables, recursion trees, and future visualization components.

---

# Responsiveness

The interface adapts to different problem specifications.

Examples include:

- varying state dimensions
- different runtime input schemas
- top-down versus bottom-up execution
- arbitrary DP table sizes

No UI component assumes a particular dynamic programming problem.

---

# Accessibility

The interface is designed to remain usable without relying solely on color.

Whenever practical, state changes should also be communicated through:

- labels,
- borders,
- icons,
- animation,
- tooltips.

---

# Future Extensions

Planned additions include:

- higher-dimensional visualization
- propagation-engine visualization
- dependency graph view
- explanation overlays
- specification import/export
- side-by-side algorithm comparison

These features are intentionally outside the scope of Version 1.5.

---

# Related Documentation

| Document           | Description                 |
| ------------------ | --------------------------- |
| `ARCHITECTURE.md`  | Overall system architecture |
| `PROBLEM_SPEC.md`  | Runtime abstraction         |
| `PLAYBACK_SPEC.md` | Playback system             |
| `FRAME_SPEC.md`    | Execution frame model       |
| `LANGUAGE.md`      | Builder language            |
