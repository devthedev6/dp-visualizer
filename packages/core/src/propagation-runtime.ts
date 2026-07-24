import { createExtractionContextFromTable } from "./extraction-context";
import type { ExecutionResult } from "./execution-result";
import { freezeDpTable } from "./execution-result";
import type { PropagationProblemSpec } from "./problem-spec";
import { Runtime } from "./runtime";
import { toStateKey } from "./state-key";
import type { ExecutionTrace, TraceEvent, TraceEventId } from "./trace";
import { EventType } from "./trace";

/**
 * Runtime for transition-driven dynamic programming specifications.
 *
 * The specification supplies all DP semantics: seed values, the processing
 * schedule, successor contributions, aggregation, and answer extraction. This
 * runtime owns only the execution mechanics and immutable result production.
 */
export class PropagationRuntime<Input = unknown> extends Runtime<
  Input,
  PropagationProblemSpec<Input>
> {
  execute(specification: PropagationProblemSpec<Input>, input: Input): ExecutionResult<Input> {
    const events: TraceEvent[] = [];
    const table = new Map<ReturnType<typeof toStateKey>, number>();
    const inputSnapshot = deepFreeze(cloneInput(input));

    const nextId = (): TraceEventId => events.length;
    const emit = <TEvent extends TraceEvent>(event: TEvent): TEvent => {
      const frozenEvent = Object.freeze(event) as TEvent;
      events.push(frozenEvent);
      return frozenEvent;
    };

    for (const initialState of specification.initialStates(input)) {
      const stateKey = toStateKey(initialState.state);
      table.set(stateKey, initialState.value);
      emit({
        id: nextId(),
        type: EventType.Write,
        state: stateKey,
        value: initialState.value
      });
    }

    for (const state of specification.schedule(input)) {
      const stateKey = toStateKey(state);
      const currentValue = table.get(stateKey);

      // A schedule defines ordering, not an implicit numeric identity. States
      // not seeded or reached by a prior transition have no value to propagate.
      if (currentValue === undefined) {
        continue;
      }

      emit({
        id: nextId(),
        type: EventType.Transition,
        state: stateKey,
        usedReads: Object.freeze([]),
        value: currentValue
      });

      for (const transition of specification.transitions(state, {
        input,
        value: currentValue
      })) {
        const targetKey = toStateKey(transition.target);
        const previousValue = table.get(targetKey);
        const nextValue =
          previousValue === undefined
            ? transition.contribution
            : specification.aggregate(
                previousValue,
                transition.contribution,
                transition.target,
                input
              );

        table.set(targetKey, nextValue);
        emit({
          id: nextId(),
          type: EventType.Write,
          state: targetKey,
          value: nextValue
        });
      }
    }

    const dimensions = Object.freeze([...specification.dimensions(input)]);
    const dpTable = freezeDpTable(table);
    const extractionContext = createExtractionContextFromTable({
      dpTable,
      input: inputSnapshot,
      dimensions
    });
    const answer = specification.extractAnswer(extractionContext);

    emit({ id: nextId(), type: EventType.Complete, answer });

    const trace = Object.freeze({
      problemId: specification.id,
      mode: "propagation" as const,
      input: inputSnapshot,
      stateVariables: Object.freeze([...specification.stateVariables]),
      dimensions,
      events: Object.freeze([...events])
    } satisfies ExecutionTrace<Input>);

    return Object.freeze({ trace, dpTable });
  }
}

function cloneInput<Input>(input: Input): Input {
  if (!isObject(input)) {
    return input;
  }

  return structuredClone(input);
}

function deepFreeze<Value>(value: Value): Value {
  if (!isObject(value) || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}

function isObject(value: unknown): value is object {
  return (typeof value === "object" || typeof value === "function") && value !== null;
}
