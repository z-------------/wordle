import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Verdict } from "../../common/types.mts";
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
    const { container } = render(<Word word="WORLD" verdicts={verdicts} />);
    const letterElems = container.querySelectorAll(".letter");
    expect(letterElems).toHaveLength(5);
    expect(letterElems[0]).toHaveClass("letter-0");
    expect(letterElems[0]).toHaveAttribute("data-letter", "W");
    expect(letterElems[1]).toHaveClass("letter-2");
    expect(letterElems[1]).toHaveAttribute("data-letter", "O");
    expect(letterElems[2]).toHaveClass("letter-1");
    expect(letterElems[2]).toHaveAttribute("data-letter", "R");
    expect(letterElems[3]).toHaveClass("letter-1");
    expect(letterElems[3]).toHaveAttribute("data-letter", "L");
    expect(letterElems[4]).toHaveClass("letter-2");
    expect(letterElems[4]).toHaveAttribute("data-letter", "D");
  });
});
