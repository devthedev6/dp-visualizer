import { useState } from "react";

const ARITHMETIC_OPERATORS = ["+", "-", "*", "/", "%", "^"];
const BITWISE_OPERATORS = ["&", "|", "~", "<<", ">>"];
const COMPARISON_OPERATORS = ["==", "!=", "<", "<=", ">", ">="];
const BOOLEAN_OPERATORS = ["&&", "||", "!"];
const BUILT_IN_FUNCTIONS = [
  "min(...)",
  "max(...)",
  "abs(...)",
  "floor(...)",
  "ceil(...)",
  "len(...)",
  "rows(...)",
  "cols(...)"
];
const DP_EXAMPLES = ["DP(i)", "DP(i, j)", "DP(layer, i, j)"];
const ARRAY_EXAMPLES = ["coins[i]", "grid[i][j]", "word[i]"];
const CONSTANT_EXAMPLES = ["MOD", "INF"];
const DP_EXPRESSION_EXAMPLES = [
  "1 + min(DP(i-1), DP(i-2))",
  "DP(i, j-1) + grid[i][j]",
  "(mask & (1 << i)) != 0",
  "bitXor(mask, 1 << i)",
  "(DP(i) + value) % MOD"
];

export function ExpressionLanguageReference({
  title = "Expression Language Reference"
}: {
  readonly title?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="builder-reference">
      <button
        type="button"
        className="builder-reference-toggle"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide" : "Show"} {title}
      </button>

      {open && (
        <div className="builder-reference-panel">
          <p className="builder-reference-intro">
            Expressions are stored exactly as typed. Parsing and validation will be introduced in
            the next milestone.
          </p>

          <ReferenceSection title="Arithmetic Operators">
            <code>{ARITHMETIC_OPERATORS.join("  ")}</code>
            <p>Example: (a + b) * c</p>
          </ReferenceSection>

          <ReferenceSection title="Bitwise Operators">
            <code>{BITWISE_OPERATORS.join("  ")} bitXor(a, b)</code>
            <ul>
              <li>{"(mask & (1 << i))"}</li>
              <li>{"mask | (1 << j)"}</li>
              <li>{"mask & ~(1 << j)"}</li>
              <li>bitXor(mask, otherMask)</li>
            </ul>
            <p className="builder-reference-note">
              Unlike C/C++, ^ represents exponentiation. Use bitXor(a, b) for bitwise XOR.
            </p>
          </ReferenceSection>

          <ReferenceSection title="Comparison Operators">
            <code>{COMPARISON_OPERATORS.join("  ")}</code>
          </ReferenceSection>

          <ReferenceSection title="Boolean Operators">
            <code>{BOOLEAN_OPERATORS.join("  ")}</code>
          </ReferenceSection>

          <ReferenceSection title="Parentheses">
            <code>( )</code>
          </ReferenceSection>

          <ReferenceSection title="Built-in Functions">
            <code>{BUILT_IN_FUNCTIONS.join("  ")}</code>
          </ReferenceSection>

          <ReferenceSection title="DP References">
            <code>{DP_EXAMPLES.join("  ")}</code>
          </ReferenceSection>

          <ReferenceSection title="Arrays">
            <code>{ARRAY_EXAMPLES.join("  ")}</code>
          </ReferenceSection>

          <ReferenceSection title="Constants">
            <code>{CONSTANT_EXAMPLES.join("  ")}</code>
          </ReferenceSection>

          <ReferenceSection title="Common DP Examples">
            <ul>
              {DP_EXPRESSION_EXAMPLES.map((example) => (
                <li key={example}>
                  <code>{example}</code>
                </li>
              ))}
            </ul>
          </ReferenceSection>
        </div>
      )}
    </div>
  );
}

interface ReferenceSectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

function ReferenceSection({ title, children }: ReferenceSectionProps) {
  return (
    <section className="builder-reference-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}
