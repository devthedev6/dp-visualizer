import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SpecificationBuilderPage } from "../src/builder";

describe("SpecificationBuilderPage", () => {
  it("renders the wizard with the first stage active", () => {
    render(<SpecificationBuilderPage onExit={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Specification Builder" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Symbols" })).toBeDefined();
  });

  it("navigates to the next and previous stages", () => {
    render(<SpecificationBuilderPage onExit={vi.fn()} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    const previousButton = screen.getByRole("button", { name: /previous/i });

    expect(previousButton.matches("[disabled]")).toBe(true);

    fireEvent.click(nextButton);
    expect(screen.getByRole("heading", { name: "State Definition" })).toBeDefined();
    expect(previousButton.matches("[disabled]")).toBe(false);

    fireEvent.click(previousButton);
    expect(screen.getByRole("heading", { name: "Symbols" })).toBeDefined();
  });

  it("calls onExit when the exit button is clicked", () => {
    const onExit = vi.fn();
    render(<SpecificationBuilderPage onExit={onExit} />);

    fireEvent.click(screen.getByRole("button", { name: /exit builder/i }));

    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
