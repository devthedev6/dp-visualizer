# Builder Language Specification

## Overview

The Specification Builder exposes a small domain-specific language (DSL) for describing dynamic programming problems.

Rather than writing executable code, users describe the mathematical structure of a recurrence.

The compiler transforms these expressions into an executable `ProblemSpec`, which is then executed by the generic runtime.

The language is intentionally declarative.

It describes **what** should be computed rather than **how** it should be executed.

---

# Language Model

A specification consists of:

- metadata
- symbols
- state variables
- base cases
- transitions
- root state
- initial DP value
- answer expression

Each section contributes to the final `ProblemSpec`.

---

# Data Types

The Builder currently supports the following primitive types.

## Primitive Types

| Type      | Example                      |
| --------- | ---------------------------- |
| Integer   | `42`                         |
| String    | `"hello"`                    |
| Character | `'A'` _(array element only)_ |
| Boolean   | `true`                       |

---

## Arrays

Arrays may contain

- integers
- strings

Examples

```text
[1,2,3]

["A","B","C"]

[[1,2],[3,4]]

[[[...]]]
```

Nested arrays follow standard JSON syntax.

---

# State Variables

State variables define the dimensions of the dynamic programming table.

Example

```text
i : 0 → n

j : 0 → m
```

Each variable defines

- name
- lower bound
- upper bound

The number of declared variables determines the dimensionality of the state space.

Version 1.5 supports between one and five state variables.

---

# Expressions

The following locations accept mathematical expressions.

- state bounds
- base-case conditions
- base-case values
- transition conditions
- transition values
- root state coordinates
- initial DP value
- answer expression

Expressions are parsed using MathJS.

---

# Operators

The following operators are currently supported.

## Arithmetic

```
+
-
*
/
%
^
```

---

## Comparison

```
==
!=
<
<=
>
>=
```

---

## Boolean

```
&&
||
!
```

---

## Bitwise

```
&
|
<<
>>
bitXor(a,b)
```

---

# Built-in Functions

The language provides several built-in functions.

## Mathematics

```
min(a,b,...)

max(a,b,...)

abs(x)

floor(x)

ceil(x)
```

---

## Arrays

```
len(array)

rows(matrix)

cols(matrix)
```

---

## Dynamic Programming

```
DP(...)
```

Reads another dynamic programming state.

Examples

```
DP(i-1)

DP(i-1,j)

DP(mask,last)
```

`DP(...)` is the **only** mechanism for reading previously computed states.

Direct table indexing such as

```
dp[i]

dp[i][j]
```

is intentionally not supported.

---

# String Indexing

Primitive strings support array-style indexing.

Examples

```
s[i]

a[i-1]
```

The returned value is a single-character string.

This enables common dynamic programming formulations such as Longest Common Subsequence.

---

# Runtime Inputs

Runtime inputs follow standard JSON syntax.

Examples

Integer

```text
5
```

String

```text
"ABCDE"
```

Integer Array

```text
[1,2,3,4]
```

String Array

```text
["A","B","C"]
```

Two-Dimensional Array

```text
[[1,2],[3,4]]
```

Three-Dimensional Array

```text
[[[1],[2]],[[3],[4]]]
```

The parser validates array dimensionality and rejects malformed inputs.

---

# Root State

The Builder stores one coordinate expression for each declared state variable.

Example

```
i = n

j = m
```

During compilation these coordinate expressions become

```
rootState(input)
```

inside the generated `ProblemSpec`.

---

# Initial DP Values

Every DP cell is initialized using

```
initialValueExpression
```

before execution begins.

Base cases overwrite these values automatically.

This allows specifications that require sentinel values such as

```
-1

INF

-∞
```

before recurrence evaluation.

---

# Execution Modes

The Builder currently supports two execution strategies.

## Top-Down

Recursive memoized evaluation beginning at the declared root state.

---

## Bottom-Up

Iterative evaluation following the specified iteration order.

Both execution modes consume the exact same compiled specification.

---

# Worked Example

Longest Common Subsequence

State

```
dp[i][j]
```

Base Cases

```
i == 0

j == 0
```

Transitions

```
a[i-1] == b[j-1]

↓

1 + DP(i-1,j-1)
```

Otherwise

```
max(
    DP(i-1,j),
    DP(i,j-1)
)
```

Answer

```
DP(len(a), len(b))
```

---

# Current Limitations

Version 1.5 intentionally supports only functional recurrences.

The following are **not** currently supported.

- propagation updates (`+=`)
- aggregation transitions
- quantified expressions
- imperative loops
- arbitrary user-defined functions

These require a different execution model and are planned for future versions.

---

# Related Documentation

| Document          | Description                |
| ----------------- | -------------------------- |
| `COMPILER.md`     | Compilation pipeline       |
| `PROBLEM_SPEC.md` | Runtime abstraction        |
| `UI_SPEC.md`      | Builder interface          |
| `ROADMAP.md`      | Planned language evolution |
