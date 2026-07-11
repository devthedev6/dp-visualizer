# Compiler

## Overview

The Specification Compiler transforms a declarative Builder specification into an executable `ProblemSpec`.

Rather than interpreting Builder data structures directly at runtime, DP Explorer compiles every specification before execution.

```
BuilderState
        │
        ▼
parseSpecification()
        │
        ▼
ParsedSpecification
        │
        ▼
validateSpecification()
        │
        ▼
ValidatedSpecification
        │
        ▼
generateProblemSpec()
        │
        ▼
ProblemSpec
```

This compilation pipeline separates specification authoring from runtime execution.

The execution engines never interact with `BuilderState` directly.

---

# Compiler Pipeline

The compiler consists of four sequential stages.

Each stage performs exactly one responsibility and produces an immutable intermediate representation.

---

## Stage 1 — BuilderState

The Builder stores user input in a declarative form.

This includes:

- metadata
- symbols
- state variables
- bounds
- base cases
- transitions
- root state
- answer expression
- execution mode
- initial DP value

Expressions are stored as plain text.

No parsing occurs at this stage.

---

## Stage 2 — Parsing

```
BuilderState

↓

ParsedSpecification
```

Every mathematical expression is parsed using MathJS.

Examples include:

```
DP(i-1,j)

len(a)

max(x,y)

(i==0)||(j==0)
```

Parsing produces immutable abstract syntax trees (ASTs).

The parser performs only syntactic analysis.

Responsibilities:

- expression parsing
- AST construction
- syntax diagnostics

The parser does **not** validate identifiers or execution semantics.

---

## Stage 3 — Semantic Validation

```
ParsedSpecification

↓

ValidatedSpecification
```

The validator verifies that parsed expressions are meaningful.

Examples include:

- undefined identifiers
- duplicate symbols
- invalid state variables
- incorrect function usage
- invalid array indexing
- incorrect DP calls
- dimension mismatches
- malformed root states

Successful validation guarantees that the specification is executable.

No runtime evaluation occurs during validation.

---

## Stage 4 — ProblemSpec Generation

```
ValidatedSpecification

↓

ProblemSpec
```

The final compiler stage constructs an executable runtime specification.

Generated functions include:

- dimensions(...)
- initialValue(...)
- rootState(...)
- baseCase(...)
- transition(...)
- iterationOrder(...)
- extractAnswer(...)

After generation, the Builder is no longer required.

The runtime operates exclusively on the generated `ProblemSpec`.

---

# Intermediate Representations

The compiler intentionally separates each phase using immutable representations.

```
BuilderState

↓

ParsedSpecification

↓

ValidatedSpecification

↓

ProblemSpec
```

Each representation has a single purpose.

| Representation         | Purpose                            |
| ---------------------- | ---------------------------------- |
| BuilderState           | User-authored specification        |
| ParsedSpecification    | Parsed mathematical expressions    |
| ValidatedSpecification | Semantically correct specification |
| ProblemSpec            | Executable runtime contract        |

No stage mutates the output of another.

---

# Diagnostics

Compilation may fail at either the parsing or validation stage.

Diagnostics are collected rather than immediately terminating compilation.

Each diagnostic contains:

- severity
- message
- source location (where available)

The compiler facade returns

```
CompileResult
```

containing either

```
ProblemSpec
```

or

```
CompilerDiagnostic[]
```

This allows the Builder to present multiple errors simultaneously.

---

# Runtime Independence

The compiler has no knowledge of:

- recursion
- memoization
- playback
- visualization
- React

Its only responsibility is producing a valid `ProblemSpec`.

Similarly, the runtime has no knowledge of:

- BuilderState
- parsing
- semantic validation

This strict separation keeps compilation and execution independently testable.

---

# Design Principles

## Declarative Input

Users describe _what_ the recurrence is.

The compiler determines how it becomes executable.

---

## Immutable Compilation

Every compilation stage produces immutable output.

Intermediate representations are never modified after creation.

---

## Single Responsibility

Each compiler stage performs exactly one task.

Parsing never validates.

Validation never generates runtime code.

Generation never reparses expressions.

---

## Generic Output

Every successfully compiled specification produces the same runtime interface.

Whether the source is:

- a handwritten template,
- the Specification Builder,
- or future import/export functionality,

the runtime receives an identical `ProblemSpec`.

---

# Current Scope

Version 1.5 supports compilation of:

- arbitrary-dimensional state spaces
- primitive and array inputs
- mathematical expressions
- DP state references
- custom base cases
- transitions
- runtime input schemas
- answer extraction
- initial DP values

Compilation currently targets the functional execution model used by the existing runtime.

---

# Future Evolution

Future versions may extend the compiler with:

- quantified expressions
- aggregation operators
- propagation-based specifications
- richer static analysis
- optimization passes
- import/export formats

These additions are intended to preserve the existing compilation pipeline rather than replace it.

---

# Related Documentation

| Document          | Description                 |
| ----------------- | --------------------------- |
| `ARCHITECTURE.md` | Overall system architecture |
| `PROBLEM_SPEC.md` | Runtime execution interface |
| `LANGUAGE.md`     | Builder language reference  |
| `ROADMAP.md`      | Future work                 |
