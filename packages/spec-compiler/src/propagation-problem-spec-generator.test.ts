import type { PropagationBuilderState } from "./builder-state";
import { compilePropagationSpecification } from "./compiler";
import { PropagationRuntime } from "@dp-explorer/core";
import { describe, expect, it } from "vitest";

describe("compilePropagationSpecification", () => {
  it("fully expresses a propagation specification without executing it", () => {
    const result = compilePropagationSpecification(createPropagationBuilderState());

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const spec = result.problemSpec;
    expect(spec.dimensions({ n: 3 })).toEqual([4]);
    expect([...spec.initialStates({ n: 3 })]).toEqual([{ state: [0], value: 1 }]);
    expect([...spec.schedule({ n: 3 })]).toEqual([[0], [1], [2], [3]]);
    expect([...spec.transitions([1], { input: { n: 3 }, value: 4 })]).toEqual([
      { target: [2], contribution: 4 }
    ]);
    expect(spec.aggregate(5, 4, [2], { n: 3 })).toBe(9);
    expect(
      spec.extractAnswer({
        input: { n: 3 },
        dimensions: [4],
        read: (state) => (state[0] === 3 ? 8 : 0),
        has: () => true,
        states: function* () {
          yield "3" as never;
        }
      })
    ).toBe(8);
  });

  it("executes the compiled propagation specification end-to-end", () => {
    const result = compilePropagationSpecification(createPropagationBuilderState());

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    const execution = new PropagationRuntime<Record<string, unknown>>().execute(
      result.problemSpec,
      {
        n: 3
      }
    );

    expect([...execution.dpTable.entries()]).toEqual([
      ["0", 1],
      ["1", 1],
      ["2", 1],
      ["3", 1]
    ]);
    expect(execution.trace.mode).toBe("propagation");
    expect(execution.trace.events.at(-1)).toMatchObject({ type: "COMPLETE", answer: 1 });
  });
});

function createPropagationBuilderState(): PropagationBuilderState {
  return {
    metadata: {
      name: "Grid Paths",
      description: "A propagation-style counting problem."
    },
    symbols: [
      {
        id: "n",
        name: "n",
        category: "primitive",
        primitiveType: "integer"
      }
    ],
    state: {
      dimensionCount: 1,
      variables: [
        {
          name: "i",
          lowerBoundExpression: "0",
          upperBoundExpression: "n"
        }
      ],
      meaning: "dp[i] is the number of ways to reach i."
    },
    initialStates: [
      {
        id: "start",
        stateExpression: "0",
        valueExpression: "1"
      }
    ],
    transitions: [
      {
        id: "advance",
        conditionExpression: "i < n",
        targetStateExpression: "i + 1",
        contributionExpression: "currentValue"
      }
    ],
    aggregation: "sum",
    schedule: "state-space-order",
    answerExpression: "DP(n)"
  };
}
