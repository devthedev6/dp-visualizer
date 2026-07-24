import type { ExecutionResult } from "./execution-result";
import type { CompiledSpecification } from "./problem-spec";

/**
 * Common abstraction for a runtime that executes one compatible compiled
 * specification model.
 */
export abstract class Runtime<
  Input = unknown,
  Specification extends CompiledSpecification<Input> = CompiledSpecification<Input>
> {
  abstract execute(specification: Specification, input: Input): ExecutionResult<Input>;
}
