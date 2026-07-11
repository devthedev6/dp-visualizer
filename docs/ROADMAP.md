# Roadmap

DP Explorer is being developed incrementally.

Each release expands the capabilities of the platform while preserving the core architectural principle:

> **Dynamic programming specifications should compile into a generic runtime rather than requiring problem-specific execution code.**

---

# Current Release

## Version 1.5 — Compiler-Backed Dynamic Programming

**Status:** Released

Version 1.5 establishes the complete end-to-end architecture of DP Explorer.

```
Builder
      ↓
Compiler
      ↓
ProblemSpec
      ↓
Runtime
      ↓
Playback
      ↓
Visualization
```

Major features include:

### Specification Builder

- Visual DP Builder
- Custom symbols
- Primitive and array inputs
- Arbitrary state variables
- Base cases
- Transitions
- Root state
- Initial DP values
- Runtime input editor

---

### Specification Compiler

- Parsing
- Semantic validation
- Immutable intermediate representations
- Runtime-compatible `ProblemSpec` generation

---

### Runtime

- Generic execution engine
- Top-down execution
- Bottom-up execution
- Runtime input parser
- Initial DP value support
- Arbitrary-dimensional execution

---

### Playback

- Immutable execution traces
- Playback controller
- Frame generation
- Deterministic navigation

---

### Visualization

- 1D DP tables
- 2D DP tables
- Recursion tree
- Timeline
- Playback controls
- Runtime statistics
- Answer panel

Execution currently supports arbitrary-dimensional state spaces.

Visualization currently supports one- and two-dimensional tables.

---

# Version 2 — Propagation-Based Dynamic Programming

**Status:** Planned

Version 2 introduces a second execution model designed for propagation-based dynamic programming.

Instead of evaluating

```
DP(state) = expression
```

the runtime will additionally support algorithms where states distribute values to successor states.

Examples include:

- Coin Change
- Counting DP
- SOS DP
- Prefix/Difference-style DP
- Many combinatorial recurrences

Planned work:

- Propagation execution engine
- Transition graph visualization
- Value-flow animation
- Aggregation expressions
- Quantifiers and iterators
- Richer answer expressions

---

# Long-Term Vision

Future versions may explore:

- AI-assisted specification generation
- Natural language → Builder conversion
- Import/export of specifications
- Graph DP
- Tree DP
- Automatic iteration-order inference
- 3D and higher-dimensional visualization
- Interactive recurrence explanation
- Algorithm comparison (greedy vs DP)

These ideas are exploratory and may evolve over time.

---

# Development Timeline

DP Explorer was developed in several major milestones.

## Phase 1 — Runtime Foundation

- Repository structure
- Generic runtime
- Built-in templates
- Playback engine
- Visualization MVP

This phase established the execution architecture.

---

## Phase 2 — Specification Compiler

- Builder language
- Parser
- Semantic validator
- ProblemSpec generator
- Compiler facade

This phase transformed DP Explorer from a template visualizer into a compiler-backed system.

---

## Phase 3 — Builder Integration

- Runtime integration
- Runtime input language
- Initial DP values
- Answer panel
- Multi-dimensional state support
- Builder polish

This phase completed the end-to-end workflow from specification authoring to visualization.

---

# Guiding Principle

DP Explorer favors architectural stability over rapid feature growth.

New functionality should extend the existing abstractions—

- `BuilderState`
- `ProblemSpec`
- `ExecutionTrace`
- `ExecutionFrame`

—rather than introducing problem-specific logic into the runtime.
