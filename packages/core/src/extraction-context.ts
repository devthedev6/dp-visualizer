import type { ExecutionResult, FrozenDpTable } from "./execution-result";
import type { StateCoordinates, StateKey } from "./state-key";
import { toStateKey } from "./state-key";

export interface ExtractionContext<Input = unknown> {
  readonly input: Input;
  readonly dimensions: readonly number[];
  read(state: StateCoordinates): number;
  has(state: StateCoordinates): boolean;
  states(): IterableIterator<StateKey>;
}

interface ExtractionContextOptions<Input> {
  readonly dpTable: FrozenDpTable;
  readonly input: Input;
  readonly dimensions: readonly number[];
}

export function createExtractionContext<Input>(
  result: ExecutionResult<Input>
): ExtractionContext<Input> {
  return createExtractionContextFromTable({
    dpTable: result.dpTable,
    input: result.trace.input,
    dimensions: result.trace.dimensions
  });
}

export function createExtractionContextFromTable<Input>({
  dpTable,
  input,
  dimensions
}: ExtractionContextOptions<Input>): ExtractionContext<Input> {
  const context: ExtractionContext<Input> = {
    input,
    dimensions,
    read: (state) => {
      const stateKey = toStateKey(state);
      const value = dpTable.get(stateKey);

      if (value === undefined) {
        throw new Error(`Cannot read missing DP state ${stateKey} from ExtractionContext.`);
      }

      return value;
    },
    has: (state) => dpTable.has(toStateKey(state)),
    states: () => dpTable.keys()
  };

  return Object.freeze(context);
}
