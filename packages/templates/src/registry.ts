import type { ProblemSpec } from "@dp-explorer/core";
import { fibonacciSpec } from "./fibonacci";

export interface RegisteredTemplate {
  readonly id: string;
  readonly name: string;
  readonly spec: ProblemSpec<unknown>;
  readonly defaultInput: Readonly<Record<string, unknown>>;
}

/**
 * Minimal mutable registry for DP templates.
 *
 * New templates are added only here by calling registerTemplate; the rest of
 * the architecture consumes the registry generically.
 */
class TemplateRegistry {
  readonly #templates = new Map<string, RegisteredTemplate>();

  register(template: RegisteredTemplate): void {
    if (this.#templates.has(template.id)) {
      throw new Error(`Template "${template.id}" is already registered.`);
    }

    this.#templates.set(template.id, template);
  }

  get(id: string): RegisteredTemplate | undefined {
    return this.#templates.get(id);
  }

  list(): readonly RegisteredTemplate[] {
    return Array.from(this.#templates.values());
  }
}

export const templateRegistry = new TemplateRegistry();

templateRegistry.register({
  id: fibonacciSpec.id,
  name: fibonacciSpec.name,
  spec: fibonacciSpec as ProblemSpec<unknown>,
  defaultInput: { n: 5 }
});
