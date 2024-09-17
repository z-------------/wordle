import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Verdict } from "../common/types.mts";
import Word from "./Word";

describe("Word component", () => {
  it("displays words", () => {
    const verdicts = [
      Verdict.HIT,
      Verdict.MISS,
      Verdict.PRESENT,
      Verdict.PRESENT,
      Verdict.MISS,
    ];
    render(<Word word="WORLD" verdicts={verdicts} />);
    expect(screen.getByText("W")).toHaveClass("letter-0");
    expect(screen.getByText("O")).toHaveClass("letter-2");
    expect(screen.getByText("R")).toHaveClass("letter-1");
    expect(screen.getByText("L")).toHaveClass("letter-1");
    expect(screen.getByText("D")).toHaveClass("letter-2");
  });
});
