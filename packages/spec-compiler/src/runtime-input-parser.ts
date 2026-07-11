import type { BuilderSymbol, PrimitiveType } from "./builder-state";

export type RuntimeInput = Record<string, unknown>;

export class RuntimeInputParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeInputParseError";
  }
}

export function parseRuntimeInput(symbol: BuilderSymbol, text: string): unknown {
  if (symbol.category === "constant") {
    throw new RuntimeInputParseError("Constants are not runtime inputs.");
  }

  const type = symbol.primitiveType ?? "integer";
  if (symbol.category === "array") {
    const value = parseJsonValue(text, "Expected JSON array.");
    if (!Array.isArray(value)) {
      throw new RuntimeInputParseError("Expected JSON array.");
    }

    const dimensions = Math.max(1, symbol.dimensions ?? 1);
    validateArray(value, type, dimensions, []);
    validateRectangular(value);
    return value;
  }

  return parsePrimitiveInput(type, text, []);
}

export function parseRuntimeInputs(
  symbols: readonly BuilderSymbol[],
  input: Readonly<Record<string, string>>
): RuntimeInput {
  const parsed: RuntimeInput = {};

  for (const symbol of symbols) {
    if (symbol.category === "constant") {
      continue;
    }

    parsed[symbol.name] = parseRuntimeInput(symbol, input[symbol.name] ?? "");
  }

  return parsed;
}

export function createDefaultRuntimeInputText(
  symbols: readonly BuilderSymbol[]
): Record<string, string> {
  const input: Record<string, string> = {};

  for (const symbol of symbols) {
    if (symbol.category === "constant") {
      continue;
    }

    input[symbol.name] = defaultTextForSymbol(symbol);
  }

  return input;
}

export function getRuntimeInputExample(symbol: BuilderSymbol): string {
  if (symbol.category === "array") {
    const type = symbol.primitiveType ?? "integer";
    const dimensions = Math.max(1, symbol.dimensions ?? 1);
    if (dimensions === 1) {
      return arrayExampleForType(type);
    }
    if (dimensions === 2) {
      return "[[1,2],[3,4]]";
    }
    return "[[[1],[2]],[[3],[4]]]";
  }

  switch (symbol.primitiveType ?? "integer") {
    case "integer":
      return "42";
    case "double":
      return "3.14";
    case "boolean":
      return "true";
    case "character":
      return '"A"';
    case "string":
      return '"hello"';
  }
}

export function formatRuntimeInputType(symbol: BuilderSymbol): string {
  const primitive = formatPrimitiveType(symbol.primitiveType ?? "integer");
  if (symbol.category !== "array") {
    return primitive;
  }

  return `${primitive}${"[]".repeat(Math.max(1, symbol.dimensions ?? 1))}`;
}

function defaultTextForSymbol(symbol: BuilderSymbol): string {
  if (symbol.category === "array") {
    return "[]";
  }

  switch (symbol.primitiveType ?? "integer") {
    case "integer":
      return "6";
    case "double":
      return "3.14";
    case "boolean":
      return "true";
    case "character":
      return '"A"';
    case "string":
      return '""';
  }
}

function parsePrimitiveInput(type: PrimitiveType, text: string, path: readonly number[]): unknown {
  const trimmed = text.trim();

  switch (type) {
    case "integer":
      return parseInteger(trimmed, path);
    case "double":
      return parseDouble(trimmed, path);
    case "boolean":
      return parseBoolean(trimmed, path);
    case "character":
      return parseCharacter(
        parseJsonValue(text, "Expected string enclosed in double quotes."),
        path
      );
    case "string":
      return parseString(parseJsonValue(text, "Expected string enclosed in double quotes."), path);
  }
}

function parseInteger(text: string, path: readonly number[]): number {
  if (!/^[+-]?\d+$/.test(text)) {
    throwTypeError(path, "Expected integer.");
  }

  const value = Number(text);
  if (!Number.isSafeInteger(value)) {
    throwTypeError(path, "Expected integer.");
  }

  return value;
}

function parseDouble(text: string, path: readonly number[]): number {
  if (text === "") {
    throwTypeError(path, "Expected number.");
  }

  const value = Number(text);
  if (!Number.isFinite(value)) {
    throwTypeError(path, "Expected number.");
  }

  return value;
}

function parseBoolean(text: string, path: readonly number[]): boolean {
  if (text === "true") {
    return true;
  }
  if (text === "false") {
    return false;
  }

  throwTypeError(path, "Expected boolean.");
}

function parseString(value: unknown, path: readonly number[]): string {
  if (typeof value !== "string") {
    throwTypeError(path, "Expected string enclosed in double quotes.");
  }

  return value;
}

function parseCharacter(value: unknown, path: readonly number[]): string {
  const text = parseString(value, path);
  if (text.length !== 1) {
    throwTypeError(path, "Expected character of length one.");
  }

  return text;
}

function parseJsonValue(text: string, errorMessage: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new RuntimeInputParseError(errorMessage);
  }
}

function validateArray(
  value: readonly unknown[],
  type: PrimitiveType,
  dimensions: number,
  path: readonly number[]
): void {
  for (let index = 0; index < value.length; index += 1) {
    const element = value[index];
    const elementPath = [...path, index];

    if (dimensions > 1) {
      if (!Array.isArray(element)) {
        throwTypeError(elementPath, "Expected JSON array.");
      }
      validateArray(element, type, dimensions - 1, elementPath);
    } else {
      validateArrayElement(element, type, elementPath);
    }
  }
}

function validateArrayElement(value: unknown, type: PrimitiveType, path: readonly number[]): void {
  switch (type) {
    case "integer":
      if (!Number.isSafeInteger(value)) {
        throwTypeError(path, "Element has incorrect type.");
      }
      return;
    case "double":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throwTypeError(path, "Element has incorrect type.");
      }
      return;
    case "boolean":
      if (typeof value !== "boolean") {
        throwTypeError(path, "Element has incorrect type.");
      }
      return;
    case "character":
      parseCharacter(value, path);
      return;
    case "string":
      parseString(value, path);
      return;
  }
}

function validateRectangular(value: readonly unknown[]): void {
  const expectedShape = readArrayShape(value);
  for (const child of value) {
    if (Array.isArray(child) && !sameShape(readArrayShape(child), expectedShape.slice(1))) {
      throw new RuntimeInputParseError("Expected rectangular array.");
    }
    if (Array.isArray(child)) {
      validateRectangular(child);
    }
  }
}

function readArrayShape(value: readonly unknown[]): readonly number[] {
  const first = value[0];
  if (!Array.isArray(first)) {
    return [value.length];
  }

  return [value.length, ...readArrayShape(first)];
}

function sameShape(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function throwTypeError(path: readonly number[], fallback: string): never {
  if (path.length > 0) {
    throw new RuntimeInputParseError(
      `Element at index ${path.map((index) => `[${index}]`).join("")} has incorrect type.`
    );
  }

  throw new RuntimeInputParseError(fallback);
}

function arrayExampleForType(type: PrimitiveType): string {
  switch (type) {
    case "integer":
      return "[1,2,3]";
    case "double":
      return "[1.5,2.75,3.14]";
    case "boolean":
      return "[true,false,true]";
    case "character":
      return '["A","B","C"]';
    case "string":
      return '["apple","banana"]';
  }
}

function formatPrimitiveType(type: PrimitiveType): string {
  switch (type) {
    case "integer":
      return "int";
    case "double":
      return "double";
    case "boolean":
      return "bool";
    case "character":
      return "char";
    case "string":
      return "string";
  }
}
