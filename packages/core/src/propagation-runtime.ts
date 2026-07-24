import type { PropagationProblemSpec } from "./problem-spec";
import { Runtime } from "./runtime";

/**
 * Placeholder for the future propagation execution model.
 *
 * Propagation execution semantics are intentionally not implemented yet.
 */
export abstract class PropagationRuntime<Input = unknown> extends Runtime<
  Input,
  PropagationProblemSpec<Input>
> {}
