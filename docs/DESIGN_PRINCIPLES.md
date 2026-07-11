# Design Principles

This document describes the architectural principles that guide the design of DP Explorer.

These principles are intentionally technology-independent. They explain _why_ the project is structured the way it is rather than describing specific implementation details.

---

# 1. Separation of Concerns

Every major subsystem has exactly one responsibility.

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

No layer performs work belonging to another.

Examples:

- The Builder never executes algorithms.
- The Compiler never performs visualization.
- The Runtime never renders UI.
- The Playback engine never evaluates recurrences.
- The Visualization layer never recomputes DP logic.

This separation keeps every subsystem independently testable and replaceable.

---

# 2. Compilation Before Execution

Dynamic programming specifications are always compiled before they are executed.

```
BuilderState

↓

ParsedSpecification

↓

ValidatedSpecification

↓

ProblemSpec
```

Execution engines operate exclusively on compiled `ProblemSpec` objects.

This ensures runtime behavior is independent of how the specification was created.

Whether a specification originates from:

- the visual Builder
- a built-in template
- future import/export functionality

the runtime behaves identically.

---

# 3. Immutable Intermediate Representations

Every compiler stage produces immutable output.

No stage mutates the output of another stage.

This guarantees:

- deterministic compilation
- reproducible diagnostics
- easier debugging
- simpler testing

Immutability also prevents accidental coupling between compiler phases.

---

# 4. Generic Execution

Execution engines are generic.

They execute arbitrary `ProblemSpec` objects.

Adding a new dynamic programming problem never requires changing the runtime.

Instead, new problems are introduced by providing new specifications.

This principle allows the same execution engines to run:

- Fibonacci
- Knapsack
- LCS
- Grid DP
- user-defined specifications

without modification.

---

# 5. One Specification, Multiple Execution Modes

A single `ProblemSpec` supports multiple execution strategies.

Currently:

- Top-Down
- Bottom-Up

consume the exact same specification.

Execution mode is a runtime concern rather than a specification concern.

---

# 6. Trace as the Single Source of Truth

Every visualization is derived from the execution trace.

The UI never recomputes recurrence logic.

If additional information is required by the visualization, the trace schema should be extended rather than recalculating values inside components.

This guarantees consistency between execution and visualization.

---

# 7. Deterministic Playback

Playback is a pure transformation.

```
Execution Trace
        +
Frame Index

↓

Execution Frame
```

The same trace and frame index always produce the same frame.

Playback has:

- no hidden state
- no timing assumptions
- no UI knowledge

---

# 8. UI Independence

The execution runtime has no knowledge of React or browser APIs.

Similarly, the visualization layer has no knowledge of recurrence evaluation.

This separation allows:

- unit testing
- future alternative frontends
- potential CLI integrations
- easier maintenance

---

# 9. Explicit System Boundaries

Features outside the current project scope are documented explicitly rather than partially implemented.

Examples include:

- propagation-based dynamic programming
- graph and tree DP
- arbitrary code compilation
- higher-dimensional visualization

Clear boundaries are preferred over incomplete implementations.

---

# 10. Extensibility

DP Explorer is designed around stable interfaces rather than concrete implementations.

Key abstractions include:

- BuilderState
- ProblemSpec
- TraceEvent
- ExecutionFrame

Future functionality should extend these interfaces rather than bypassing them.

This keeps the architecture open for future evolution while minimizing changes to existing components.

---

# 11. AI as an Optional Layer

Artificial intelligence is intentionally treated as an optional enhancement rather than a dependency.

The complete compilation and visualization pipeline functions without requiring any LLM integration.

Future AI-assisted specification generation should produce the same `BuilderState` or `ProblemSpec` objects used throughout the rest of the system.

---

# Summary

Every architectural decision in DP Explorer is guided by four core goals:

- Separate compilation from execution.
- Keep execution deterministic.
- Derive visualization from immutable traces.
- Build reusable components connected through stable interfaces.
