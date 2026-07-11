# Architecture

## Overview

DP Explorer is a compiler-backed dynamic programming visualization platform.

Unlike traditional DP visualizers that implement a fixed collection of hardcoded algorithms, DP Explorer introduces a small domain-specific language (DSL) for describing dynamic programming recurrences.

Users construct a specification through an interactive Builder. This specification is compiled into a runtime-compatible `ProblemSpec`, which is then executed by a common execution engine. The resulting execution trace is replayed through a playback engine and rendered by the visualization layer.

The project is intentionally divided into independent layers:

```
Builder
    ↓
Compiler
    ↓
Runtime
    ↓
Playback
    ↓
Visualization
```

Each layer communicates only through well-defined interfaces and has exactly one responsibility.

---

# Repository Layout

```
dp-explorer/

apps/
└── web/
    ├── Specification Builder
    ├── Runtime Input UI
    ├── Visualization
    └── Demo Sessions

packages/
├── core/
│   ├── ProblemSpec interfaces
│   ├── Execution Engines
│   ├── Trace model
│   └── Statistics utilities
│
├── playback/
│   ├── Playback Controller
│   └── Execution Frame generation
│
├── spec-compiler/
│   ├── Parser
│   ├── Semantic Validator
│   ├── ProblemSpec Generator
│   ├── Runtime Input Parser
│   └── Compiler Facade
│
└── templates/
    └── Built-in DP specifications
```

Each package has a single responsibility and may depend only on lower architectural layers.

---

# High-Level Architecture

```
                 Specification Builder
                          │
                          ▼
                    BuilderState
                          │
                          ▼
              ┌────────────────────────┐
              │ Specification Compiler │
              └────────────────────────┘
                          │
             parseSpecification()
                          │
                          ▼
              ParsedSpecification
                          │
          validateSpecification()
                          │
                          ▼
            ValidatedSpecification
                          │
         generateProblemSpec()
                          │
                          ▼
                     ProblemSpec
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      Top-Down Runtime          Bottom-Up Runtime
             │                         │
             └────────────┬────────────┘
                          ▼
                  Execution Trace
                          │
                          ▼
                 Playback Controller
                          │
                          ▼
                  Execution Frame
                          │
                          ▼
                  Visualization UI
```

The Builder never executes algorithms.

The Runtime never performs visualization.

The UI never recomputes dynamic programming logic.

---

# Compiler Pipeline

The compiler transforms a declarative Builder specification into an executable
`ProblemSpec`.

The compilation pipeline consists of four stages.

## 1. BuilderState

The Builder stores the user's specification in a purely declarative format.

It contains:

- metadata
- input symbols
- state variables
- bounds
- base cases
- transitions
- root state
- answer expression
- execution mode
- initial DP value

BuilderState contains no executable logic.

---

## 2. Parser

The parser converts Builder expressions into immutable MathJS abstract syntax
trees (ASTs).

Responsibilities:

- Parse expressions
- Produce diagnostics
- Preserve source information
- Build ParsedSpecification

No semantic validation occurs here.

---

## 3. Semantic Validator

The validator verifies that the parsed specification is meaningful.

Responsibilities include:

- identifier resolution
- symbol lookup
- state-variable validation
- function validation
- array indexing validation
- dependency validation

The validator never executes expressions.

Successful validation produces an immutable
`ValidatedSpecification`.

---

## 4. ProblemSpec Generator

The final compiler stage transforms the validated specification into an
executable `ProblemSpec`.

This object is runtime-compatible and can be executed by either execution
engine without modification.

The generator performs no semantic validation.

---

# Runtime Pipeline

The runtime consumes a compiled `ProblemSpec`.

Two execution engines are currently implemented.

- Top-Down
- Bottom-Up

Both engines share the same specification interface.

Execution produces an immutable `ExecutionTrace`.

The runtime owns:

- state evaluation
- memoization
- dependency resolution
- trace generation

The runtime has zero UI knowledge.

---

# Playback Pipeline

The playback engine converts an immutable execution trace into immutable
execution frames.

```
Execution Trace
        ↓
Playback Controller
        ↓
Execution Frame
```

Each frame represents one instant during execution.

Frames are deterministic.

The same trace and frame index always produce the same frame.

Playback never executes DP logic.

---

# Visualization Layer

The web application renders execution frames produced by the playback engine.

Depending on the specification, the UI displays:

- DP table (1D and 2D)
- recursion tree (top-down only)
- execution timeline
- playback controls
- current execution state
- extracted answer
- runtime statistics

For specifications with three or more dimensions, execution proceeds normally,
while the DP table is replaced by an informational message indicating that
higher-dimensional visualization is not yet supported.

---

# Design Principles

DP Explorer follows several architectural principles.

## Separation of Concerns

Compilation, execution, playback, and visualization are completely independent.

Each layer communicates only through stable interfaces.

---

## Immutable Intermediate Representations

Every compiler stage produces immutable output.

```
BuilderState

↓

ParsedSpecification

↓

ValidatedSpecification

↓

ProblemSpec
```

No stage mutates the output of another.

---

## Trace as the Single Source of Truth

The visualization never recomputes dynamic programming logic.

Everything displayed in the UI is derived from the execution trace.

If additional information is needed, the trace schema should be extended rather
than recalculating values inside the UI.

---

## Runtime Independence

Execution engines know nothing about React.

The compiler knows nothing about playback.

The UI knows nothing about recurrence evaluation.

This separation allows every layer to evolve independently.

---

# Current Scope (Version 1.5)

DP Explorer currently supports:

- custom DP specification builder
- compiler-backed specification generation
- top-down execution
- bottom-up execution
- playback controls
- execution traces
- recursion trees
- runtime statistics
- initial DP values
- primitive and array runtime inputs
- up to five state dimensions
- visualization for one- and two-dimensional DP tables

Execution of higher-dimensional specifications is fully supported.

Visualization of higher-dimensional tables is intentionally postponed.

---

# Future Evolution

Version 2 introduces a second execution model for propagation-based dynamic
programming.

The current runtime models functional recurrences of the form

```
DP(state) = expression
```

Future versions will additionally support propagation-style recurrences where
states distribute values to successor states.

This execution model requires a dedicated propagation engine rather than an
extension of the current recursive runtime.

See `ROADMAP.md` for planned future work.

---

# Related Documentation

| Document               | Description                     |
| ---------------------- | ------------------------------- |
| `PROBLEM_SPEC.md`      | Runtime specification interface |
| `COMPILER.md`          | Compilation pipeline            |
| `LANGUAGE.md`          | Builder language reference      |
| `PLAYBACK_SPEC.md`     | Playback controller             |
| `FRAME_SPEC.md`        | Execution frame model           |
| `UI_SPEC.md`           | Visualization layer             |
| `ROADMAP.md`           | Planned future work             |
| `DESIGN_PRINCIPLES.md` | Architectural decisions         |
