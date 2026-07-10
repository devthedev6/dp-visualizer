# DP Explorer Specification Builder (Version 1.5)

## Purpose

Version 1.5 introduces the first user-facing compiler for DP Explorer.

Instead of relying solely on built-in templates, users will be able to construct their own dynamic programming formulations through a guided specification builder.

The objective of Version 1.5 is **not** to introduce a new programming language or DSL. Instead, users provide structured mathematical information through a form-based interface, which is compiled into an executable `ProblemSpec`.

The existing execution runtime remains completely unchanged.

---

# Architectural Philosophy

The runtime has reached a stable state.

```
ProblemSpec
      ↓
Execution Runtime
      ↓
ExecutionResult
      ↓
ExtractionContext
      ↓
Answer
```

Version 1.5 does **not** modify any component of this pipeline.

Instead, it introduces a new frontend capable of generating a valid `ProblemSpec`.

```
Specification Builder
        ↓
BuilderState
        ↓
MathJS Parser
        ↓
Expression AST
        ↓
Semantic Compiler
        ↓
ProblemSpec
        ↓
Existing Runtime
```

The runtime should not distinguish between:

- Built-in templates
- User-defined specifications

Both must produce identical `ProblemSpec` objects.

---

# Overall Pipeline

```
User

↓

Specification Builder

↓

BuilderState

↓

MathJS Expression Parser

↓

Expression AST

↓

Semantic Validator

↓

ProblemSpec Compiler

↓

ProblemSpec

↓

Execution Runtime

↓

ExecutionResult

↓

Playback / Visualization / Answer Extraction
```

---

# BuilderState

The Specification Builder does **not** generate a `ProblemSpec` directly.

Instead it constructs an intermediate representation called `BuilderState`.

Conceptually,

```ts
BuilderState

├── Symbols
├── State Definition
├── Bounds
├── Base Cases
├── Transitions
├── Root State
└── Answer Expression
```

The semantic compiler is responsible for converting this representation into a valid `ProblemSpec`.

---

# Symbol Table

Every identifier that may appear inside a mathematical expression must first be declared.

The builder therefore constructs a complete symbol table.

Supported symbol categories are:

## Primitive Inputs

- Integer
- Double
- Boolean
- Character
- String

Examples

```
n
capacity
target
tight
word
```

---

## Arrays

Arrays are defined using:

- Base Type
- Number of Dimensions

Examples

```
coins

Base Type:
Integer

Dimensions:
1
```

```
grid

Base Type:
Integer

Dimensions:
2
```

This naturally supports:

```
coins[i]

grid[i][j]
```

Higher-dimensional arrays are permitted.

---

## Constants

Users may define immutable constants.

Examples

```
MOD = 1000000007

INF = 1e18
```

---

# Reserved Symbols

The following identifiers are reserved by the compiler.

They cannot be redefined by users.

```
DP

min
max
abs
floor
ceil

len
rows
cols

true
false
```

Additional reserved functions may be introduced in future versions.

---

# Supported Mathematical Expressions

Version 1.5 delegates expression parsing entirely to MathJS.

The builder is responsible only for collecting expressions.

The compiler is responsible for semantic validation.

Expressions are used in:

- Transition conditions
- Transition expressions
- Base case conditions
- Base case values
- Root state
- Answer expression

MathJS is used **only** as a parser.

The semantic meaning of every identifier is provided by the compiler.

Operators:

- - - / % ^

Bitwise:
& | << >> ~ ^|

Comparison:
== != < <= > >=

Logical:
&& || !

Functions:
min max abs floor ceil len rows cols

State references:
DP(...)

Arrays:
a[i]
grid[i][j]

---

# Specification Builder

The builder is organized as a multi-stage wizard.

## Stage 1

Symbol Definition

Users define:

- Primitive Inputs
- Arrays
- Constants

---

## Stage 2

State Definition

Users define:

- Number of DP dimensions
- State variable names
- State meaning

Examples

```
dp[i]

dp[i][j]
```

Version 1.5 officially supports visualization of:

- 1D DP
- 2D DP
- Progressive 3D DP

The execution runtime remains dimension-independent.

---

## Stage 3

Bounds

Every state variable requires:

- Lower Bound
- Upper Bound

Example

```
i

0

n
```

---

## Stage 4

Base Cases

Base cases consist of:

Condition

↓

Value

Multiple base cases are supported.

---

## Stage 5

Transitions

Each transition contains:

Optional Condition

↓

Transition Expression

The transition expression is parsed using MathJS.

The compiler automatically discovers:

- DP dependencies
- Aggregate functions
- Arithmetic operations

No manual dependency entry is required.

---

## Stage 6

Root State

Defines where top-down execution begins.

Conceptually equivalent to:

```
ProblemSpec.rootState()
```

---

## Stage 7

Answer Expression

Defines the final answer computed after execution.

Examples

```
DP(n)

max(DP(i))

DP(n,m)
```

This is compiled into:

```
ProblemSpec.extractAnswer()
```

---

# Semantic Compiler

The compiler receives:

BuilderState

↓

MathJS AST

The compiler is responsible for:

- Symbol resolution
- Identifier validation
- Type validation
- DP dependency extraction
- Bounds validation
- Root state validation
- Answer validation

Finally,

```
BuilderState

↓

ProblemSpec
```

---

# Validation

The compiler should detect:

- Undefined identifiers
- Invalid array indexing
- Incorrect DP dimensionality
- Undefined state variables
- Missing base cases
- Missing transitions
- Invalid root state
- Invalid answer expression

Validation should occur before execution.

---

# Scope of Version 1.5

Version 1.5 intentionally focuses on producing executable `ProblemSpec` objects.

The runtime architecture remains unchanged.

Version 1.5 is **not** a DSL.

Version 1.5 is **not** an AI-assisted specification system.

Those belong to later versions.

---

# Future Versions

## Version 2

Replace the form-based builder with a textual DSL.

The compiler remains unchanged.

Only the frontend changes.

---

## Version 3

Introduce Solution Reconstruction.

Execution computes the DP table.

Reconstruction explains the optimal decision path.

Both operate on the frozen execution result.

---

## Version 4+

Natural-language specification through LLMs.

Natural language

↓

Specification Builder

↓

ProblemSpec

↓

Existing Runtime
