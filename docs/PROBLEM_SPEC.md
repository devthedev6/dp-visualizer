# Problem Specification

## Overview

`ProblemSpec` is the central runtime abstraction of DP Explorer.

Every dynamic programming algorithm executed by the system—whether implemented as a built-in template or generated automatically by the Specification Compiler—is represented as a `ProblemSpec`.

The execution engines are written once against this interface and never contain problem-specific logic.

```
               Built-in Templates
                      │
                      │
                      ▼
                 ProblemSpec
                      ▲
                      │
                      │
      Specification Compiler
                      ▲
                      │
                 BuilderState
```

This separation allows every supported dynamic programming problem to execute through the same runtime while remaining completely independent of how it was authored.

---

# Purpose

A `ProblemSpec` describes **what** a dynamic programming problem is.

It does **not** describe **how** it should be executed.

The runtime is responsible for recursion, memoization, iteration, trace generation, playback, and visualization.

The specification only describes:

- the state space,
- the recurrence,
- the base cases,
- the execution entry point,
- and how to extract the final answer.

---

# Interface

```ts
interface ProblemSpec<Input = unknown> {
  /** Stable identifier. */
  id: string;

  /** Human-readable problem name. */
  name: string;

  /** Display title used by the UI. */
  title?: string;

  /** Optional description. */
  description?: string;

  /**
   * State variable names.
   *
   * Example:
   * ["i"]
   * ["i", "j"]
   * ["mask", "last"]
   */
  stateVariables: readonly string[];

  /**
   * Runtime input schema.
   */
  inputSchema: readonly InputField[];

  /**
   * Concrete DP dimensions for a given input.
   */
  dimensions(input: Input): readonly number[];

  /**
   * Initial value assigned to every DP cell before execution.
   *
   * Defaults to zero for most specifications.
   */
  initialValue?(input: Input): number;

  /**
   * Entry state for top-down execution.
   */
  rootState(input: Input): readonly number[];

  /**
   * Determines whether a state is a base case.
   */
  baseCase(state: readonly number[], input: Input): BaseCaseResult;

  /**
   * Computes one DP state.
   */
  transition(state: readonly number[], ctx: TransitionCtx<Input>): number;

  /**
   * Dependency-safe iteration order.
   */
  iterationOrder(input: Input): Iterable<readonly number[]>;

  /**
   * Extracts the final answer from the completed DP table.
   */
  extractAnswer(context: ExtractionContext<Input>): number;
}
```

---

# Lifecycle

Every specification in DP Explorer follows the same lifecycle.

```
Builder
        │
        ▼
BuilderState
        │
        ▼
Specification Compiler
        │
        ▼
ProblemSpec
        │
        ▼
Execution Engine
        │
        ▼
Execution Trace
        │
        ▼
Playback
        │
        ▼
Visualization
```

Built-in templates skip the compiler stage and construct a `ProblemSpec` directly.

Once a `ProblemSpec` exists, the runtime makes no distinction between handwritten templates and compiled specifications.

---

# Execution Model

The runtime evaluates a `ProblemSpec` through one of two execution strategies.

## Top-Down

```
rootState

↓

recursive evaluation

↓

memoization

↓

ExecutionTrace
```

The runtime automatically performs recursive dependency resolution.

The specification never contains recursive calls directly; dependencies are expressed only through `ctx.read(...)`.

---

## Bottom-Up

```
iterationOrder

↓

table evaluation

↓

ExecutionTrace
```

The runtime iterates over every state produced by `iterationOrder`.

Base cases and transitions are handled automatically.

---

# Transition Context

The transition function receives a context object.

```ts
interface TransitionCtx<Input> {
  input: Input;

  read(state: readonly number[]): number;
}
```

`ctx.read(...)` is the **only** mechanism for accessing another DP state.

This allows the runtime to:

- instrument dependency reads,
- emit execution trace events,
- support both execution modes,
- collect visualization metadata.

Specifications must never access DP storage directly.

---

# Root State

`rootState(...)` identifies the entry point for top-down execution.

The runtime begins recursive evaluation from this state.

Bottom-up execution ignores `rootState`; all states are visited through `iterationOrder`.

---

# Initial Values

Before execution begins, every DP cell is initialized using

```ts
initialValue(input);
```

if provided.

Otherwise the runtime initializes all cells to zero.

Base cases overwrite these initial values automatically.

---

# Answer Extraction

After execution completes, the runtime invokes

```ts
extractAnswer(...)
```

to obtain the final result.

Answer extraction is intentionally separated from recurrence evaluation.

This allows problems whose final answer is not stored in a single DP state.

---

# Design Principles

## Declarative Specifications

`ProblemSpec` describes the mathematics of a recurrence rather than the mechanics of execution.

No specification contains:

- recursion,
- loops,
- playback,
- rendering,
- memoization.

Those responsibilities belong to the runtime.

---

## Runtime Independence

The same specification executes correctly using both

- Top-Down
- Bottom-Up

execution engines.

Execution strategy is a runtime concern rather than part of the specification.

---

## Compiler Independence

A `ProblemSpec` has no knowledge of its origin.

It may be produced by:

- the Specification Builder,
- the Specification Compiler,
- a handwritten TypeScript template,
- future import/export functionality.

The runtime treats every specification identically.

---

## Generic Execution

Adding a new dynamic programming problem never requires modifying the execution engine.

Instead, a new `ProblemSpec` is supplied.

This keeps the runtime completely generic.

---

# Worked Example

A minimal Fibonacci specification.

```ts
const fibonacci: ProblemSpec<{ n: number }> = {
  id: "fibonacci",

  name: "Fibonacci",

  stateVariables: ["i"],

  inputSchema: [
    {
      name: "n",
      label: "n",
      type: "integer"
    }
  ],

  dimensions: (input) => [input.n + 1],

  rootState: (input) => [input.n],

  baseCase(state) {
    const [i] = state;

    if (i <= 1) return { isBase: true, value: i };

    return { isBase: false };
  },

  transition(state, ctx) {
    const [i] = state;

    return ctx.read([i - 1]) + ctx.read([i - 2]);
  },

  iterationOrder: function* (input) {
    for (let i = 0; i <= input.n; i++) yield [i];
  },

  extractAnswer(context) {
    return context.read([context.input.n]);
  }
};
```

Although real specifications may have multiple dimensions and considerably more complex recurrences, every supported problem follows this exact structure.

---

# Current Scope

Version 1.5 supports:

- arbitrary-dimensional state spaces,
- top-down execution,
- bottom-up execution,
- runtime input schemas,
- initial DP values,
- custom answer extraction,
- compiler-generated specifications,
- handwritten template specifications.

---

# Non-Goals

The current `ProblemSpec` abstraction intentionally does **not** model:

- propagation-style dynamic programming,
- graph or tree DP,
- arbitrary user code execution,
- imperative update semantics (`+=`, `*=`, etc.).

These require a different execution model and are planned for future versions.

---

# Related Documentation

| Document           | Description                        |
| ------------------ | ---------------------------------- |
| `ARCHITECTURE.md`  | Overall system architecture        |
| `COMPILER.md`      | Specification compilation pipeline |
| `PLAYBACK_SPEC.md` | Playback engine                    |
| `FRAME_SPEC.md`    | Execution frame model              |
| `LANGUAGE.md`      | Builder language reference         |
| `ROADMAP.md`       | Future evolution                   |
