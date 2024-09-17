import { describe, expect, it } from "vitest";
import Round from "./round.mjs";

describe("Round class", () => {
  it("selects a word from the word list", () => {
    const round = new Round(2, 2, ["HELLO", "WORLD"]);
    expect(round.word).toMatch(/HELLO|WORLD/);
  });

  it("calculates scores", () => {
    {
      const round = new Round(2, 2, ["HELLO", "WORLD"], "HELLO");
      round.games[0].guess("HELLO");
      round.games[1].guess("WORLD");
      round.games[1].guess("HELLO");
      expect(round.isFinished).toEqual(true);
      expect(round.scores).toEqual([2, 1]);
    }
    {
      const round = new Round(2, 2, ["HELLO", "WORLD"], "HELLO");
      round.games[0].guess("HELLO");
      round.games[1].guess("WORLD");
      round.games[1].guess("WORLD");
      expect(round.isFinished).toEqual(true);
      expect(round.scores).toEqual([2, 0]);
    }
  });
});
