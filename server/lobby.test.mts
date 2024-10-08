import { describe, expect, it, vi } from "vitest";
import Lobby from "./lobby.mjs";
import Player from "./player.mts";
import { Ability, Outcome } from "../common/types.mts";

class TestPlayer implements Player {
  playerIdx: number;
  lobby: Lobby | undefined;
  notifyPlayerIdx(playerIdx: number) {
    this.playerIdx = playerIdx;
  }
  notifyInvalidGuess = vi.fn();
  notifyVerdicts = vi.fn();
  notifyGuessesLeft = vi.fn();
  notifyRound = vi.fn();
  notifyScores = vi.fn();
  notifyLeave = vi.fn();
  notifyUsedAbility = vi.fn();
}

describe("Lobby class", () => {
  it("starts a round once there are enough players", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["HELLO"], 2);

    lobby.addPlayer(player1);
    expect(lobby.isFull).toEqual(false);
    expect(lobby.isFinished).toEqual(false);
    expect(player1.notifyRound).not.toHaveBeenCalled();
    expect(player2.notifyRound).not.toHaveBeenCalled();

    lobby.addPlayer(player2);
    expect(lobby.isFull).toEqual(true);
    expect(lobby.isFinished).toEqual(false);
    expect(player1.notifyRound).toHaveBeenCalledWith(1, 2);
    expect(player2.notifyRound).toHaveBeenCalledWith(1, 2);
  });

  it("tells player the lobby is ended when opponent leaves", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["HELLO"], 2);

    lobby.addPlayer(player1);
    lobby.addPlayer(player2);
    expect(player1.notifyLeave).not.toHaveBeenCalled();
    expect(player2.notifyLeave).not.toHaveBeenCalled();

    lobby.end(player1);
    expect(player1.notifyLeave).toHaveBeenCalledWith("You left");
    expect(player1.lobby).toBeUndefined();
    expect(player2.notifyLeave).toHaveBeenCalledWith("Opponent left");
    expect(player2.lobby).toBeUndefined();
  });

  it("tells players the lobby is ended", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["HELLO"], 2);

    lobby.addPlayer(player1);
    lobby.addPlayer(player2);
    expect(player1.notifyLeave).not.toHaveBeenCalled();
    expect(player2.notifyLeave).not.toHaveBeenCalled();

    lobby.end();
    expect(player1.notifyLeave).toHaveBeenCalledWith("Lobby ended");
    expect(player1.lobby).toBeUndefined();
    expect(player2.notifyLeave).toHaveBeenCalledWith("Lobby ended");
    expect(player2.lobby).toBeUndefined();
  });

  it("accepts guesses and reports lobby state", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["HELLO", "WORLD"], 2, "HELLO");
    lobby.addPlayer(player1);
    lobby.addPlayer(player2);
    expect(player1.notifyRound).toHaveBeenNthCalledWith(1, 1, 2);
    expect(player2.notifyRound).toHaveBeenNthCalledWith(1, 1, 2);

    lobby.guess(player1, "GREET");
    expect(player1.notifyInvalidGuess).toHaveBeenNthCalledWith(1, expect.any(String));
    expect(player2.notifyInvalidGuess).not.toHaveBeenCalled();

    lobby.guess(player1, "WORLD");
    lobby.guess(player1, "HELLO");
    lobby.guess(player2, "HELLO");
    expect(player1.notifyVerdicts).toHaveBeenCalled();
    expect(player2.notifyVerdicts).toHaveBeenCalled();
    expect(player1.notifyRound).toHaveBeenNthCalledWith(2, 2, 2);
    expect(player2.notifyRound).toHaveBeenNthCalledWith(2, 2, 2);
    expect(player1.notifyScores).toHaveBeenLastCalledWith([
      { player: 1, opponent: 2 },
    ], { player: 1, opponent: 2 }, Outcome.UNDECIDED, "HELLO");
    expect(player2.notifyScores).toHaveBeenLastCalledWith([
      { player: 2, opponent: 1 },
    ], { player: 2, opponent: 1 }, Outcome.UNDECIDED, "HELLO");
    expect(lobby.isFinished).toEqual(false);

    lobby.guess(player1, "HELLO");
    lobby.guess(player2, "HELLO");
    expect(player1.notifyScores).toHaveBeenLastCalledWith([
      { player: 1, opponent: 2 },
      { player: 2, opponent: 2 },
    ], { player: 3, opponent: 4 }, Outcome.LOSE, "HELLO");
    expect(player2.notifyScores).toHaveBeenLastCalledWith([
      { player: 2, opponent: 1 },
      { player: 2, opponent: 2 },
    ], { player: 4, opponent: 3 }, Outcome.WIN, "HELLO");
    expect(player1.notifyScores).toHaveBeenCalledTimes(2);
    expect(player2.notifyScores).toHaveBeenCalledTimes(2);
    expect(lobby.isFinished).toEqual(true);
  });

  it("rejects guesses from invalid player", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["HELLO"], 2);
    lobby.addPlayer(player1);
    lobby.addPlayer(player2);

    player1.playerIdx = -1;
    lobby.guess(player1, "HELLO");
    expect(player1.notifyVerdicts).not.toHaveBeenCalled();
    expect(player2.notifyVerdicts).not.toHaveBeenCalled();
  });

  it("rejects guesses from after lobby is finished", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(1, ["HELLO"], 1);
    lobby.addPlayer(player1);
    lobby.addPlayer(player2);

    lobby.guess(player1, "HELLO");
    lobby.guess(player2, "HELLO");
    expect(lobby.isFinished).toEqual(true);

    lobby.guess(player1, "HELLO");
    expect(player1.notifyVerdicts).toHaveBeenCalledTimes(2);
    expect(player2.notifyVerdicts).toHaveBeenCalledTimes(2);
  });

  it("lets players use abilities when valid", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["RIGHT", "WRONG"], 3, "RIGHT");
    lobby.addPlayer(player1);
    lobby.addPlayer(player2);

    // expect cannot use abilities due to no score
    lobby.useAbility(player1, Ability.STEAL);
    expect(player1.notifyUsedAbility).not.toHaveBeenCalled();
    lobby.useAbility(player2, Ability.STEAL);
    expect(player2.notifyUsedAbility).not.toHaveBeenCalled();

    // finish one round so that both players have some score
    lobby.guess(player1, "RIGHT");
    lobby.guess(player2, "WRONG");
    lobby.guess(player2, "RIGHT");
    expect(player1.notifyScores).toHaveBeenLastCalledWith(expect.any(Array), { player: 2, opponent: 1 }, Outcome.UNDECIDED, "RIGHT");
    expect(player1.notifyRound).toHaveBeenLastCalledWith(2, 3);
    expect(player2.notifyRound).toHaveBeenLastCalledWith(2, 3);

    // expect player 2 can use ability
    lobby.useAbility(player2, Ability.STEAL);
    expect(player1.notifyUsedAbility).toHaveBeenCalledTimes(1);
    expect(player1.notifyUsedAbility).toHaveBeenLastCalledWith(1, Ability.STEAL, 1);
    expect(player2.notifyUsedAbility).toHaveBeenCalledTimes(1);

    // expect player 1 cannot use ability if player 2 has no guesses left
    lobby.guess(player2, "WRONG");
    lobby.guess(player2, "WRONG");
    lobby.guess(player2, "WRONG");
    lobby.useAbility(player1, Ability.STEAL);
    expect(player1.notifyUsedAbility).toHaveBeenCalledTimes(1);
    expect(player2.notifyUsedAbility).toHaveBeenCalledTimes(1);

    // go to next round
    lobby.guess(player1, "RIGHT");
    expect(player1.notifyRound).toHaveBeenLastCalledWith(3, 3);
    expect(player1.notifyScores).toHaveBeenLastCalledWith(expect.any(Array), { player: 4, opponent: 0 }, Outcome.UNDECIDED, "RIGHT");

    // expect player 1 can use ability
    lobby.useAbility(player1, Ability.STEAL);
    expect(player1.notifyUsedAbility).toHaveBeenCalledTimes(2);
    expect(player2.notifyUsedAbility).toHaveBeenCalledTimes(2);
    expect(player1.notifyScores).toHaveBeenLastCalledWith(expect.any(Array), { player: 3, opponent: 0 }, Outcome.UNDECIDED, undefined);

    // expect player 1 cannot use same ability again
    lobby.useAbility(player1, Ability.STEAL);
    expect(player1.notifyUsedAbility).toHaveBeenCalledTimes(2);
    expect(player2.notifyUsedAbility).toHaveBeenCalledTimes(2);
  });

  it("ends the lobby when a player is out of guesses after a steal", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const lobby = new Lobby(2, ["RIGHT", "WRONG"], 2, "RIGHT");
    lobby.addPlayer(player1);
    lobby.addPlayer(player2);

    // finish one round so that both players have some score
    lobby.guess(player1, "RIGHT");
    lobby.guess(player2, "RIGHT");
    expect(player1.notifyScores).toHaveBeenLastCalledWith(expect.any(Array), { player: 2, opponent: 2 }, Outcome.UNDECIDED, "RIGHT");
    expect(player1.notifyRound).toHaveBeenLastCalledWith(2, 2);
    expect(player2.notifyRound).toHaveBeenLastCalledWith(2, 2);

    // player 1 uses steal
    lobby.guess(player1, "RIGHT");
    lobby.guess(player2, "WRONG");
    lobby.useAbility(player1, Ability.STEAL);
    expect(player1.notifyUsedAbility).toHaveBeenCalledTimes(1);
    expect(player2.notifyUsedAbility).toHaveBeenCalledTimes(1);
    expect(player1.notifyLeave).toHaveBeenCalledWith("Lobby ended");
    expect(player2.notifyLeave).toHaveBeenCalledWith("Lobby ended");
    expect(player1.notifyScores).toHaveBeenCalledWith(expect.any(Array), expect.any(Object), Outcome.WIN, "RIGHT");
    expect(player2.notifyScores).toHaveBeenCalledWith(expect.any(Array), expect.any(Object), Outcome.LOSE, "RIGHT");
  });
});
