import { compileSpecification, type CompilerDiagnostic } from "@dp-explorer/spec-compiler";
import { useBuilderCompilation, useBuilderDispatch, useBuilderState } from "./builder-store";

function formatDiagnosticPath(path: readonly (string | number)[] | undefined): string | null {
  if (!path || path.length === 0) {
    return null;
  }
  return path.map((segment) => String(segment)).join(".");
}

function DiagnosticItem({ diagnostic }: { readonly diagnostic: CompilerDiagnostic }) {
  const path = formatDiagnosticPath(diagnostic.path);
  return (
    <li className="builder-diagnostic-item">
      <p className="builder-diagnostic-message">{diagnostic.message}</p>
      <dl className="builder-diagnostic-meta">
        {path && (
          <>
            <dt>Path</dt>
            <dd>{path}</dd>
          </>
        )}
        {diagnostic.expression && (
          <>
            <dt>Expression</dt>
            <dd>
              <code>{diagnostic.expression}</code>
            </dd>
          </>
        )}
      </dl>
    </li>
  );
}

export function ReviewCompileStage() {
  const builderState = useBuilderState();
  const compilation = useBuilderCompilation();
  const dispatch = useBuilderDispatch();

  function compileCurrentSpecification() {
    const result = compileSpecification(builderState);
    if (result.success) {
      dispatch({ type: "COMPILE_SUCCESS", problemSpec: result.problemSpec });
    } else {
      dispatch({ type: "COMPILE_FAILURE", diagnostics: result.diagnostics });
    }
  }

  return (
    <div className="builder-editor">
      <h3>Review</h3>
      <p className="builder-hint">Review the current BuilderState before compiling.</p>

      <pre className="builder-json-preview">{JSON.stringify(builderState, null, 2)}</pre>

      <div className="builder-compile-area">
        <button
          type="button"
          className="builder-compile-button"
          onClick={compileCurrentSpecification}
        >
          Compile Specification
        </button>
      </div>

      <section
        className={`builder-compile-status builder-compile-status--${compilation.status}`}
        aria-live="polite"
      >
        <h4>Compilation Status</h4>
        {compilation.status === "idle" && <p>Not compiled yet.</p>}
        {compilation.status === "success" && (
          <p>Specification compiled successfully. The generated ProblemSpec is ready.</p>
        )}
        {compilation.status === "failure" && (
          <>
            <p>Compilation failed. Fix the compiler errors below and try again.</p>
            <ol className="builder-diagnostics-list">
              {compilation.diagnostics.map((diagnostic, index) => (
                <DiagnosticItem key={`${diagnostic.message}-${index}`} diagnostic={diagnostic} />
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
