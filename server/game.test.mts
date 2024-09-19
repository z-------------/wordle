import { describe, expect, it } from "vitest";
import { Verdict } from "../common/types.mjs";
import Game, { State } from "./game.mjs";

describe("Game class", () => {
  it("correctly calculates verdicts", () => {
    {
      const game = new Game(5, "HELLO", ["HELLO"]);
      expect(game.guess("HELLO")).toEqual({
        verdicts: Array(5).fill(Verdict.HIT),
      });
    }
    {
      const game = new Game(5, "WORLD", ["HELLO", "WORLD"]);
      expect(game.guess("HELLO")).toEqual({
        verdicts: [
          Verdict.MISS,
          Verdict.MISS,
          Verdict.MISS,
          Verdict.HIT,
          Verdict.PRESENT,
        ],
      });
    }
    {
      const game = new Game(5, "HELLO", ["LLXXL", "HELLO"]);
      expect(game.guess("LLXXL")).toEqual({
        verdicts: [
          Verdict.PRESENT,
          Verdict.PRESENT,
          Verdict.MISS,
          Verdict.MISS,
          Verdict.MISS,
        ],
      });
    }
  });

  it("rejects guesses when game is not in progress", () => {
    const game = new Game(2, "HELLO", ["HELLO", "WORLD", "GREET"]);
    expect(game.guess("WORLD")).toEqual({
      verdicts: expect.any(Array),
    });
    expect(game.guess("GREET")).toEqual({
      verdicts: expect.any(Array),
    });
    expect(game.guess("HELLO")).toEqual({
      error: expect.any(String),
    });
  });

  it("rejects guesses that are not in the word list", () => {
    const game = new Game(2, "WORLD", ["WORLD"]);
    expect(game.guess("HELLO")).toEqual({
      error: expect.any(String),
    });
  });

  it("rejects guesses that are not valid words", () => {
    const game = new Game(2, "WORLD", ["WORLD"]);
    expect(game.guess("GREETINGS")).toEqual({
      error: expect.any(String),
    });
    expect(game.guess("HI!!!")).toEqual({
      error: expect.any(String),
    });
  });

  it("calculates score", () => {
    {
      const game = new Game(6, "HELLO", ["HELLO", "WORLD"]);
      game.guess("HELLO");
      expect(game.state).toEqual(State.WIN);
      expect(game.score).toEqual(6);
    }
    {
      const game = new Game(6, "HELLO", ["HELLO", "WORLD"]);
      game.guess("WORLD");
      game.guess("WORLD");
      game.guess("HELLO");
      expect(game.state).toEqual(State.WIN);
      expect(game.score).toEqual(4);
    }
    {
      const game = new Game(6, "HELLO", ["HELLO", "WORLD"]);
      for (let i = 0; i < 5; ++i) {
        game.guess("WORLD");
      }
      game.guess("HELLO");
      expect(game.state).toEqual(State.WIN);
      expect(game.score).toEqual(1);
    }
    {
      const game = new Game(6, "HELLO", ["HELLO", "WORLD"]);
      for (let i = 0; i < 5; ++i) {
        game.guess("WORLD");
      }
      expect(game.state).toEqual(State.IN_PROGRESS);
      ++game.maxGuesses; // e.g. by steal
      game.guess("WORLD");
      expect(game.state).toEqual(State.IN_PROGRESS);
      game.guess("HELLO");
      expect(game.state).toEqual(State.WIN);
      expect(game.score).toEqual(1);
    }
    {
      const game = new Game(6, "HELLO", ["HELLO", "WORLD"]);
      for (let i = 0; i < 6; ++i) {
        game.guess("WORLD");
      }
      expect(game.state).toEqual(State.LOSE);
      expect(game.score).toEqual(0);
    }
  });
});

