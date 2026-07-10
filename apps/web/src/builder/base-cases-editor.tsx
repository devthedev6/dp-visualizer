import { useBuilderDispatch, useBuilderState } from "./builder-store";
import type { BuilderBaseCase } from "./builder-state";
import { ExpressionLanguageReference } from "./expression-language-reference";

export function BaseCasesEditor() {
  const builderState = useBuilderState();
  const dispatch = useBuilderDispatch();
  const baseCases = builderState.baseCases;

  function addBaseCase() {
    dispatch({ type: "ADD_BASE_CASE" });
  }

  function removeBaseCase(id: string) {
    dispatch({ type: "REMOVE_BASE_CASE", id });
  }

  function updateBaseCase(id: string, updates: Partial<BuilderBaseCase>) {
    dispatch({ type: "UPDATE_BASE_CASE", id, updates });
  }

  return (
    <div className="builder-editor">
      <div className="builder-editor-header">
        <h3>Base Cases</h3>
        <button type="button" onClick={addBaseCase} className="builder-add-button">
          Add Base Case
        </button>
      </div>

      <ExpressionLanguageReference />

      {baseCases.length === 0 && <p className="builder-placeholder">No base cases defined.</p>}

      {baseCases.map((baseCase, index) => (
        <BaseCaseRow
          key={baseCase.id}
          index={index}
          baseCase={baseCase}
          onUpdate={updateBaseCase}
          onRemove={removeBaseCase}
        />
      ))}
    </div>
  );
}

interface BaseCaseRowProps {
  readonly index: number;
  readonly baseCase: BuilderBaseCase;
  readonly onUpdate: (id: string, updates: Partial<BuilderBaseCase>) => void;
  readonly onRemove: (id: string) => void;
}

function BaseCaseRow({ index, baseCase, onUpdate, onRemove }: BaseCaseRowProps) {
  return (
    <div className="builder-symbol-row">
      <span className="builder-row-number">#{index + 1}</span>
      <label className="builder-field">
        <span>Condition</span>
        <input
          type="text"
          value={baseCase.conditionExpression}
          placeholder="i == 0"
          onChange={(event) => onUpdate(baseCase.id, { conditionExpression: event.target.value })}
        />
      </label>
      <label className="builder-field">
        <span>Value / Expression</span>
        <input
          type="text"
          value={baseCase.valueExpression}
          placeholder="1 + min(DP(i-1), DP(i-2))"
          onChange={(event) => onUpdate(baseCase.id, { valueExpression: event.target.value })}
        />
      </label>
      <button type="button" className="builder-remove-button" onClick={() => onRemove(baseCase.id)}>
        Remove
      </button>
    </div>
  );
}
