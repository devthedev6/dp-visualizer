import { useBuilderDispatch, useBuilderState } from "./builder-store";
import { ExpressionLanguageReference } from "./expression-language-reference";

export function AnswerEditor() {
  const builderState = useBuilderState();
  const dispatch = useBuilderDispatch();

  return (
    <div className="builder-editor">
      <ExpressionLanguageReference />

      <label className="builder-field builder-field--stacked">
        <span>Answer Expression</span>
        <input
          type="text"
          value={builderState.answerExpression}
          placeholder="max(DP(i))"
          onChange={(event) =>
            dispatch({ type: "SET_ANSWER_EXPRESSION", expression: event.target.value })
          }
        />
      </label>

      <p className="builder-hint">
        This expression represents the final value returned by the DP formulation.
      </p>
    </div>
  );
}
