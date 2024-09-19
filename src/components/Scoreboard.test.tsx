import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Scores } from "../../common/message.mts";
import { Outcome } from "../../common/types.mts";
import Scoreboard from "./Scoreboard";

describe("Scoreboard component", () => {
  it("displays scores", () => {
    const roundScores: Scores[] = [
      { player: 3, opponent: 1 },
      { player: 4, opponent: 9 },
    ];
    const runningScores: Scores = {
      player: 7, opponent: 10,
    };
    const { container, rerender } = render(<Scoreboard roundScores={roundScores} runningScores={runningScores} outcome={Outcome.WIN} />);
    const rows = container.querySelectorAll("tr");
    expect(rows[0].querySelector("th")).toHaveTextContent("Round 1");
    expect(rows[0].querySelectorAll("td")[0]).toHaveTextContent("3");
    expect(rows[0].querySelectorAll("td")[1]).toHaveTextContent("1");
    expect(rows[1].querySelector("th")).toHaveTextContent("Round 2");
    expect(rows[1].querySelectorAll("td")[0]).toHaveTextContent("4");
    expect(rows[1].querySelectorAll("td")[1]).toHaveTextContent("9");
    expect(rows[2].querySelector("th")).toHaveTextContent("Overall");
    expect(rows[2].querySelectorAll("td")[0]).toHaveTextContent("7");
    expect(rows[2].querySelectorAll("td")[1]).toHaveTextContent("10");
    expect(screen.getByText("You win")).toBeInTheDocument();

    rerender(<Scoreboard roundScores={roundScores} runningScores={runningScores} outcome={Outcome.LOSE} />)
    expect(screen.getByText("You lose")).toBeInTheDocument();

    rerender(<Scoreboard roundScores={roundScores} runningScores={runningScores} outcome={Outcome.TIE} />);
    expect(screen.getByText("Tie")).toBeInTheDocument();
  });
});
