import { runBottomUp } from "./bottom-up-engine";
import type { ExecutionResult } from "./execution-result";
import type { FunctionalProblemSpec } from "./problem-spec";
import { Runtime } from "./runtime";
import { runTopDown } from "./top-down-engine";

export type FunctionalExecutionMode = "top-down" | "bottom-up";

/**
 * Runtime façade for dependency-based dynamic programming specifications.
 *
 * It delegates to the existing top-down and bottom-up engines so execution
 * behavior and trace production remain unchanged.
 */
export class FunctionalRuntime<Input = unknown> extends Runtime<
  Input,
  FunctionalProblemSpec<Input>
> {
  constructor(private readonly mode: FunctionalExecutionMode) {
    super();
  }

  execute(specification: FunctionalProblemSpec<Input>, input: Input): ExecutionResult<Input> {
    return this.mode === "bottom-up"
      ? runBottomUp(specification, input)
      : runTopDown(specification, input);
  }
}
