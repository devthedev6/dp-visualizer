import { useBuilderDispatch, useBuilderState } from "./builder-store";
import { ExpressionLanguageReference } from "./expression-language-reference";

export function RootStateEditor() {
  const builderState = useBuilderState();
  const dispatch = useBuilderDispatch();

  return (
    <div className="builder-editor">
      <ExpressionLanguageReference />

      <label className="builder-field builder-field--stacked">
        <span>Root State Expression</span>
        <input
          type="text"
          value={builderState.rootStateExpression}
          placeholder="DP(n)"
          onChange={(event) =>
            dispatch({ type: "SET_ROOT_STATE_EXPRESSION", expression: event.target.value })
          }
        />
      </label>

      <p className="builder-hint">
        This expression describes which state the runtime should evaluate to begin the computation.
      </p>
    </div>
  );
}
