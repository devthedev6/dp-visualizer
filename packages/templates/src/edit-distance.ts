import type { ProblemSpec, StateCoordinates } from "@dp-explorer/core";

export interface EditDistanceInput {
  readonly first: string;
  readonly second: string;
}

/**
 * Edit Distance (Levenshtein Distance) ProblemSpec.
 *
 * State (i, j) represents the minimum number of single-character edits needed
 * to transform the suffix first[i:] into the suffix second[j:]. Base cases
 * occur when either suffix is empty and the remaining characters of the other
 * must all be inserted or deleted. When the leading characters match, no edit
 * is required; otherwise the best of insert, delete, or replace is taken.
 */
export const editDistanceSpec: ProblemSpec<EditDistanceInput> = {
  id: "edit-distance",
  name: "Edit Distance",
  title: "Edit Distance",
  description:
    "Given two strings, compute the minimum number of insertions, deletions, and replacements required to transform the first string into the second.",
  stateVariables: ["i", "j"],
  inputSchema: [
    { name: "first", label: "First string", type: "string", maxLength: 8 },
    { name: "second", label: "Second string", type: "string", maxLength: 8 }
  ],
  dimensions: (input) => [input.first.length + 1, input.second.length + 1],
  baseCase: (state, input) => {
    const [i, j] = readIndices(state);

    if (i === input.first.length) {
      return { isBase: true, value: input.second.length - j };
    }

    if (j === input.second.length) {
      return { isBase: true, value: input.first.length - i };
    }

    return { isBase: false };
  },
  transition: (state, ctx) => {
    const input = ctx.input;
    const [i, j] = readIndices(state);

    if (input.first[i] === input.second[j]) {
      return ctx.read([i + 1, j + 1]);
    }

    const insert = ctx.read([i, j + 1]);
    const deleteCost = ctx.read([i + 1, j]);
    const replace = ctx.read([i + 1, j + 1]);

    return 1 + Math.min(insert, deleteCost, replace);
  },
  iterationOrder: function* (input) {
    for (let i = input.first.length; i >= 0; i -= 1) {
      for (let j = input.second.length; j >= 0; j -= 1) {
        yield [i, j];
      }
    }
  },
  extractAnswer: (input, read) => read([0, 0])
};

function readIndices(state: StateCoordinates): [number, number] {
  const i = state[0];
  const j = state[1];

  if (i === undefined || j === undefined) {
    throw new Error("Edit Distance expects two-dimensional state.");
  }

  return [i, j];
}
