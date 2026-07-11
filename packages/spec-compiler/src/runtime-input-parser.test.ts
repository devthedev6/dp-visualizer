import { createExtractionContext, runBottomUp, runTopDown } from "@dp-explorer/core";
import { describe, expect, it } from "vitest";
import type { BuilderState, BuilderSymbol, PrimitiveType } from "./builder-state";
import { compileSpecification } from "./compiler";
import {
  createDefaultRuntimeInputText,
  formatRuntimeInputType,
  getRuntimeInputExample,
  parseRuntimeInput,
  parseRuntimeInputs
} from "./runtime-input-parser";

describe("runtime input parser", () => {
  it("parses every primitive type according to the declared Builder type", () => {
    expect(parseRuntimeInput(primitive("integer"), "42")).toBe(42);
    expect(parseRuntimeInput(primitive("double"), "3.14159")).toBe(3.14159);
    expect(parseRuntimeInput(primitive("boolean"), "true")).toBe(true);
    expect(parseRuntimeInput(primitive("boolean"), "false")).toBe(false);
    expect(parseRuntimeInput(primitive("character"), '"A"')).toBe("A");
    expect(parseRuntimeInput(primitive("string"), '"Hello\\nWorld"')).toBe("Hello\nWorld");
    expect(parseRuntimeInput(primitive("string"), '""')).toBe("");
  });

  it("rejects primitive values that do not match the declared type", () => {
    expect(() => parseRuntimeInput(primitive("integer"), "3.14")).toThrow("Expected integer.");
    expect(() => parseRuntimeInput(primitive("boolean"), "TRUE")).toThrow("Expected boolean.");
    expect(() => parseRuntimeInput(primitive("character"), '"AB"')).toThrow(
      "Expected character of length one."
    );
    expect(() => parseRuntimeInput(primitive("string"), "123")).toThrow(
      "Expected string enclosed in double quotes."
    );
  });

  it("parses every supported array type using JSON array syntax", () => {
    expect(parseRuntimeInput(array("integer"), "[1,2,3]")).toEqual([1, 2, 3]);
    expect(parseRuntimeInput(array("double"), "[1.5,2.75,3.14]")).toEqual([1.5, 2.75, 3.14]);
    expect(parseRuntimeInput(array("boolean"), "[true,false,true]")).toEqual([true, false, true]);
    expect(parseRuntimeInput(array("character"), '["A","B","C"]')).toEqual(["A", "B", "C"]);
    expect(parseRuntimeInput(array("string"), '["apple","banana"]')).toEqual(["apple", "banana"]);
    expect(parseRuntimeInput(array("integer"), "[]")).toEqual([]);
  });

  it("parses nested arrays and validates rectangular shape", () => {
    expect(parseRuntimeInput(array("integer", 2), "[[1,2],[3,4]]")).toEqual([
      [1, 2],
      [3, 4]
    ]);
    expect(parseRuntimeInput(array("integer", 3), "[[[1],[2]],[[3],[4]]]")).toEqual([
      [[1], [2]],
      [[3], [4]]
    ]);
    expect(() => parseRuntimeInput(array("integer", 2), "[[1],[2,3]]")).toThrow(
      "Expected rectangular array."
    );
  });

  it("rejects custom comma-separated arrays, invalid element types, and invalid characters", () => {
    expect(() => parseRuntimeInput(array("integer"), "1,2,3")).toThrow("Expected JSON array.");
    expect(() => parseRuntimeInput(array("integer"), '[1,"2",3]')).toThrow(
      "Element at index [1] has incorrect type."
    );
    expect(() => parseRuntimeInput(array("character"), '["AB"]')).toThrow(
      "Element at index [0] has incorrect type."
    );
    expect(() => parseRuntimeInput(array("integer", 2), "[1,2,3]")).toThrow(
      "Element at index [0] has incorrect type."
    );
  });

  it("parses all runtime symbols into a single runtime input object", () => {
    const symbols = [
      primitive("integer", "n"),
      primitive("string", "word"),
      array("character", 1, "letters"),
      { id: "mod", name: "MOD", category: "constant", value: "1000000007" }
    ] satisfies readonly BuilderSymbol[];

    expect(
      parseRuntimeInputs(symbols, {
        n: "4",
        word: '"code"',
        letters: '["c","o","d","e"]'
      })
    ).toEqual({
      n: 4,
      word: "code",
      letters: ["c", "o", "d", "e"]
    });
  });

  it("provides default raw text, formatted types, and examples for the Builder UI", () => {
    const symbol = array("integer", 3, "grid");
    expect(createDefaultRuntimeInputText([primitive("integer", "n"), symbol])).toEqual({
      n: "6",
      grid: "[]"
    });
    expect(formatRuntimeInputType(symbol)).toBe("int[][][]");
    expect(getRuntimeInputExample(symbol)).toBe("[[[1],[2]],[[3],[4]]]");
  });
});

describe("runtime parser integration with compiled DP execution", () => {
  it("executes Fibonacci using parsed primitive input", () => {
    const { spec, input } = compileAndParse(createFibonacciBuilderState(), { n: "6" });
    const result = runBottomUp(spec, input);

    expect(spec.extractAnswer(createExtractionContext(result))).toBe(8);
  });

  it("executes Coin Change using parsed integer array input", () => {
    const { spec, input } = compileAndParse(createCoinChangeBuilderState(), {
      amount: "4",
      coins: "[1,2]"
    });
    const result = runBottomUp(spec, input);

    expect(spec.extractAnswer(createExtractionContext(result))).toBe(5);
  });

  it("executes LCS using parsed character array input", () => {
    const { spec, input } = compileAndParse(createLcsBuilderState(), {
      first: '["A","B","C","D"]',
      second: '["A","C","D"]'
    });
    const result = runBottomUp(spec, input);

    expect(spec.extractAnswer(createExtractionContext(result))).toBe(3);
  });

  it("executes Minimum Path Sum using parsed 2D array input", () => {
    const { spec, input } = compileAndParse(createMinimumPathSumBuilderState(), {
      grid: "[[1,3,1],[1,5,1],[4,2,1]]"
    });
    const result = runBottomUp(spec, input);

    expect(spec.dimensions(input)).toEqual([3, 3]);
    expect(spec.extractAnswer(createExtractionContext(result))).toBe(7);
  });

  it("executes parsed input in the top-down runtime too", () => {
    const { spec, input } = compileAndParse(createFibonacciBuilderState("top-down"), { n: "5" });
    const result = runTopDown(spec, input);

    expect(spec.extractAnswer(createExtractionContext(result))).toBe(5);
  });
});

function compileAndParse(builderState: BuilderState, textInput: Readonly<Record<string, string>>) {
  const result = compileSpecification(builderState);
  if (!result.success) {
    throw new Error(`Expected BuilderState to compile: ${result.diagnostics[0]?.message ?? ""}`);
  }

  return {
    spec: result.problemSpec,
    input: parseRuntimeInputs(builderState.symbols, textInput)
  };
}

function primitive(primitiveType: PrimitiveType, name: string = primitiveType): BuilderSymbol {
  return {
    id: `symbol-${name}`,
    name,
    category: "primitive",
    primitiveType
  };
}

function array(primitiveType: PrimitiveType, dimensions = 1, name = "values"): BuilderSymbol {
  return {
    id: `symbol-${name}`,
    name,
    category: "array",
    primitiveType,
    dimensions
  };
}

function createFibonacciBuilderState(executionMode: BuilderState["executionMode"] = "bottom-up") {
  return {
    metadata: {
      name: "Fibonacci",
      description: "Generated Fibonacci specification"
    },
    symbols: [primitive("integer", "n")],
    state: {
      dimensionCount: 1,
      variables: [{ name: "i", lowerBoundExpression: "0", upperBoundExpression: "n" }],
      meaning: "dp[i]"
    },
    baseCases: [
      { id: "base-0", conditionExpression: "i == 0", valueExpression: "0" },
      { id: "base-1", conditionExpression: "i == 1", valueExpression: "1" }
    ],
    transitions: [
      { id: "transition-1", conditionExpression: null, valueExpression: "DP(i - 1) + DP(i - 2)" }
    ],
    rootStateExpression: "DP(n)",
    answerExpression: "DP(n)",
    executionMode
  } satisfies BuilderState;
}

function createCoinChangeBuilderState() {
  return {
    metadata: {
      name: "Coin Change",
      description: "Generated coin change specification"
    },
    symbols: [primitive("integer", "amount"), array("integer", 1, "coins")],
    state: {
      dimensionCount: 1,
      variables: [{ name: "x", lowerBoundExpression: "0", upperBoundExpression: "amount" }],
      meaning: "dp[x]"
    },
    baseCases: [{ id: "base-0", conditionExpression: "x == 0", valueExpression: "1" }],
    transitions: [
      {
        id: "transition-small",
        conditionExpression: "x < coins[1]",
        valueExpression: "DP(x - coins[0])"
      },
      {
        id: "transition-large",
        conditionExpression: null,
        valueExpression: "DP(x - coins[0]) + DP(x - coins[1])"
      }
    ],
    rootStateExpression: "DP(amount)",
    answerExpression: "DP(amount)",
    executionMode: "bottom-up"
  } satisfies BuilderState;
}

function createLcsBuilderState() {
  return {
    metadata: {
      name: "LCS",
      description: "Generated LCS specification"
    },
    symbols: [array("character", 1, "first"), array("character", 1, "second")],
    state: {
      dimensionCount: 2,
      variables: [
        { name: "i", lowerBoundExpression: "0", upperBoundExpression: "len(first)" },
        { name: "j", lowerBoundExpression: "0", upperBoundExpression: "len(second)" }
      ],
      meaning: "dp[i][j]"
    },
    baseCases: [
      { id: "base-row", conditionExpression: "i == 0", valueExpression: "0" },
      { id: "base-col", conditionExpression: "j == 0", valueExpression: "0" }
    ],
    transitions: [
      {
        id: "transition-match",
        conditionExpression: "first[i - 1] == second[j - 1]",
        valueExpression: "1 + DP(i - 1, j - 1)"
      },
      {
        id: "transition-skip",
        conditionExpression: null,
        valueExpression: "max(DP(i - 1, j), DP(i, j - 1))"
      }
    ],
    rootStateExpression: "DP(len(first), len(second))",
    answerExpression: "DP(len(first), len(second))",
    executionMode: "bottom-up"
  } satisfies BuilderState;
}

function createMinimumPathSumBuilderState() {
  return {
    metadata: {
      name: "Minimum Path Sum",
      description: "Generated minimum path sum specification"
    },
    symbols: [array("integer", 2, "grid")],
    state: {
      dimensionCount: 2,
      variables: [
        { name: "i", lowerBoundExpression: "0", upperBoundExpression: "rows(grid) - 1" },
        { name: "j", lowerBoundExpression: "0", upperBoundExpression: "cols(grid) - 1" }
      ],
      meaning: "dp[i][j]"
    },
    baseCases: [
      { id: "base-origin", conditionExpression: "i == 0 and j == 0", valueExpression: "grid[0][0]" }
    ],
    transitions: [
      {
        id: "transition-first-row",
        conditionExpression: "i == 0",
        valueExpression: "grid[i][j] + DP(i, j - 1)"
      },
      {
        id: "transition-first-column",
        conditionExpression: "j == 0",
        valueExpression: "grid[i][j] + DP(i - 1, j)"
      },
      {
        id: "transition-inner",
        conditionExpression: null,
        valueExpression: "grid[i][j] + min(DP(i - 1, j), DP(i, j - 1))"
      }
    ],
    rootStateExpression: "DP(rows(grid) - 1, cols(grid) - 1)",
    answerExpression: "DP(rows(grid) - 1, cols(grid) - 1)",
    executionMode: "bottom-up"
  } satisfies BuilderState;
}
