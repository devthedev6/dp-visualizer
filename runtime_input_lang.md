# Runtime Input Language (RUNTIME_INPUT_LANGUAGE.md)

## Purpose

This document specifies the runtime input language used by the DP Explorer Builder.

The Builder allows users to declare arbitrary input symbols (integers, arrays, strings, etc.).
Before a compiled DP specification executes, the runtime converts the user's textual input into strongly typed JavaScript values.

This document defines the canonical syntax accepted by the runtime parser.

This specification is authoritative.

---

# Design Goals

The runtime input language should satisfy the following properties:

- Human-readable
- Easy to type manually
- Unambiguous
- Recursive
- Dimension-independent
- Consistent with JavaScript/JSON where possible
- Easy to validate
- Easy to extend

The parser should not infer types from user input.

Instead:

Builder Symbol Type +
Runtime Input Text
↓
Typed Runtime Value

The declared Builder type always determines how the input is interpreted.

---

# Primitive Types

## Integer

Builder Type

int

Input

42

Produces

42

---

## Double

Builder Type

double

Input

3.14159

Produces

3.14159

---

## Boolean

Builder Type

bool

Accepted values

true
false

Produces

true
false

(case-sensitive)

---

## Character

Builder Type

char

Input

"A"

Produces

"A"

Characters are represented as strings of length exactly one.

If the supplied string is not length one, parsing fails.

---

## String

Builder Type

string

Input

"Hello World"

Produces

"Hello World"

Strings must be enclosed in double quotes.

Escape sequences follow standard JSON rules.

Example

"Hello\nWorld"

---

# Arrays

All arrays use JSON array syntax.

No custom comma-separated grammar is supported.

Examples

[1,2,3]

["A","B","C"]

[true,false,true]

[]

Arrays may contain whitespace.

---

## Integer Array

Builder Type

int[]

Input

[1,2,3,4]

Produces

number[]

---

## Double Array

Builder Type

double[]

Input

[1.5,2.75,3.14]

Produces

number[]

---

## Boolean Array

Builder Type

bool[]

Input

[true,false,true]

Produces

boolean[]

---

## Character Array

Builder Type

char[]

Input

["A","B","C"]

Produces

string[]

Every element must be exactly one character.

Otherwise parsing fails.

---

## String Array

Builder Type

string[]

Input

["abc","def","ghi"]

Produces

string[]

---

# Multi-Dimensional Arrays

Multi-dimensional arrays are represented using nested JSON arrays.

The parser supports arbitrary dimensions.

Examples

int[][]

[
[1,2],
[3,4]
]

Produces

number[][]

---

int[][][]

[
[
[1,2],
[3,4]
],
[
[5,6],
[7,8]
]
]

Produces

number[][][]

---

This extends naturally to any dimension.

No parser changes are required when supporting higher-dimensional arrays.

---

# Shape Validation

The parser validates that every nested array is rectangular.

Example

Valid

[
[1,2],
[3,4]
]

Invalid

[
[1],
[2,3]
]

Jagged arrays are not supported in Version 1.5.

---

# Type Validation

Every element must match the declared Builder type.

Example

Builder

int[]

Input

[1,2,3]

✓ Valid

Builder

int[]

Input

[1,"abc",3]

✗ Invalid

---

# Error Handling

Parsing errors should produce user-friendly diagnostics.

Examples

Expected integer.

Expected boolean.

Expected string enclosed in quotes.

Expected character of length one.

Expected JSON array.

Expected rectangular 2D array.

Element at index [2][1] has incorrect type.

---

# Empty Values

The following are valid.

[]

Empty array

""

Empty string

No other implicit conversions are performed.

---

# Unsupported Behaviour

The parser never infers types.

Examples

Input

123

Builder

string

Produces

"123"

NOT

123

Likewise

Builder

char[]

Input

[1,2,3]

Produces an error.

NOT

["1","2","3"]

The Builder type is authoritative.

---

# Future Extensions

This specification intentionally leaves room for future additions.

Possible future features include

- tuples
- maps
- sets
- graphs
- binary trees
- user-defined structures

These should be introduced without changing existing syntax.

---

# Summary

Runtime parsing consists of exactly two phases.

1.

Parse textual input using this language.

↓

2.

Validate the parsed value against the declared Builder type.

↓

3.

Return strongly typed runtime values.

The compiler, runtime, and visualization layers never parse user text directly.
All runtime input must pass through this parser.
