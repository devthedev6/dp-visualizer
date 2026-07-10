import { useBuilderState } from "./builder-store";

export function ReviewCompileStage() {
  const builderState = useBuilderState();

  return (
    <div className="builder-editor">
      <h3>Review</h3>
      <p className="builder-placeholder">
        Below is the current BuilderState. Compilation will be enabled in a later session.
      </p>

      <ul className="builder-review-notes">
        <li>The compiler currently supports only the documented expression language.</li>
        <li>Mathematical expressions are stored exactly as entered.</li>
        <li>Parsing and semantic validation will be introduced in the next milestone.</li>
      </ul>

      <pre className="builder-json-preview">{JSON.stringify(builderState, null, 2)}</pre>

      <div className="builder-compile-area">
        <button type="button" className="builder-compile-button" disabled>
          Compile Specification
        </button>
      </div>
    </div>
  );
}
