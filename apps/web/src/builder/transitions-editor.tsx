import { useBuilderDispatch, useBuilderState } from "./builder-store";
import type { BuilderTransition } from "./builder-state";
import { ExpressionLanguageReference } from "./expression-language-reference";

export function TransitionsEditor() {
  const builderState = useBuilderState();
  const dispatch = useBuilderDispatch();
  const transitions = builderState.transitions;

  function addTransition() {
    dispatch({ type: "ADD_TRANSITION" });
  }

  function removeTransition(id: string) {
    dispatch({ type: "REMOVE_TRANSITION", id });
  }

  function updateTransition(id: string, updates: Partial<BuilderTransition>) {
    dispatch({ type: "UPDATE_TRANSITION", id, updates });
  }

  return (
    <div className="builder-editor">
      <div className="builder-editor-header">
        <h3>Transitions</h3>
        <button type="button" onClick={addTransition} className="builder-add-button">
          Add Transition
        </button>
      </div>

      <ExpressionLanguageReference />

      {transitions.length === 0 && <p className="builder-placeholder">No transitions defined.</p>}

      {transitions.map((transition, index) => (
        <TransitionRow
          key={transition.id}
          index={index}
          transition={transition}
          onUpdate={updateTransition}
          onRemove={removeTransition}
        />
      ))}
    </div>
  );
}

interface TransitionRowProps {
  readonly index: number;
  readonly transition: BuilderTransition;
  readonly onUpdate: (id: string, updates: Partial<BuilderTransition>) => void;
  readonly onRemove: (id: string) => void;
}

function TransitionRow({ index, transition, onUpdate, onRemove }: TransitionRowProps) {
  const conditionValue = transition.conditionExpression ?? "";

  return (
    <div className="builder-symbol-row">
      <span className="builder-row-number">#{index + 1}</span>
      <label className="builder-field">
        <span>Condition (optional)</span>
        <input
          type="text"
          value={conditionValue}
          placeholder="i >= 1"
          onChange={(event) => {
            const next = event.target.value;
            onUpdate(transition.id, { conditionExpression: next === "" ? null : next });
          }}
        />
      </label>
      <label className="builder-field">
        <span>Transition Expression</span>
        <input
          type="text"
          value={transition.valueExpression}
          placeholder="1 + min(DP(i-1), DP(i-2))"
          onChange={(event) => onUpdate(transition.id, { valueExpression: event.target.value })}
        />
      </label>
      <button
        type="button"
        className="builder-remove-button"
        onClick={() => onRemove(transition.id)}
      >
        Remove
      </button>
    </div>
  );
}
