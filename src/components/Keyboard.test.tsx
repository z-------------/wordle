import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Verdict } from "../../common/types.mts";
import Keyboard from "./Keyboard";

describe("Keyboard class", () => {
  const letterVerdicts = {
    "A": Verdict.HIT,
    "B": Verdict.PRESENT,
    "C": Verdict.MISS,
  };

  it("displays letter verdicts", () => {
    const onInput = vi.fn();
    const onEnter = vi.fn();
    const onBackspace = vi.fn();

    render(<Keyboard onInput={onInput} onEnter={onEnter} onBackspace={onBackspace} allowEnter={true} letterVerdicts={letterVerdicts} />);
    expect(screen.getByText("A")).toHaveClass("keyboard-key-0");
    expect(screen.getByText("B")).toHaveClass("keyboard-key-1");
    expect(screen.getByText("C")).toHaveClass("keyboard-key-2");
    expect(screen.getByText("D")).toHaveClass("keyboard-key-3");
  });

  it("sends button presses", () => {
    const onInput = vi.fn();
    const onEnter = vi.fn();
    const onBackspace = vi.fn();

    render(<Keyboard onInput={onInput} onEnter={onEnter} onBackspace={onBackspace} allowEnter={true} letterVerdicts={letterVerdicts} />);
    screen.getByText("H").click();
    expect(onInput).toHaveBeenLastCalledWith("H");
    screen.getByText("Enter").click();
    expect(onEnter).toHaveBeenCalledTimes(1);
    screen.getByText("E").click();
    expect(onInput).toHaveBeenLastCalledWith("E");
    screen.getByTestId("keyboard-backspace").click();
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });
});
