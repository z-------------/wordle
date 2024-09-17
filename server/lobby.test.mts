import { describe, expect, it, vi } from "vitest";
import Lobby from "./lobby.mjs";
import Player from "./player.mts";

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
  notifyRoundOutcome = vi.fn();
  notifyOverallOutcome = vi.fn();
  notifyLeave = vi.fn();
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
    const lobby = new Lobby(2, ["HELLO"], 2);
    lobby.addPlayer(player1);
    lobby.addPlayer(player2);
    expect(player1.notifyRound).toHaveBeenNthCalledWith(1, 1, 2);
    expect(player2.notifyRound).toHaveBeenNthCalledWith(1, 1, 2);

    lobby.guess(player1, "GREET");
    expect(player1.notifyInvalidGuess).toHaveBeenNthCalledWith(1, expect.any(String));
    expect(player2.notifyInvalidGuess).not.toHaveBeenCalled();

    lobby.guess(player1, "HELLO");
    lobby.guess(player2, "HELLO");
    expect(player1.notifyVerdicts).toHaveBeenCalled();
    expect(player2.notifyVerdicts).toHaveBeenCalled();
    expect(player1.notifyRound).toHaveBeenNthCalledWith(2, 2, 2);
    expect(player2.notifyRound).toHaveBeenNthCalledWith(2, 2, 2);
    expect(player1.notifyRoundOutcome).toHaveBeenCalledTimes(1);
    expect(player2.notifyRoundOutcome).toHaveBeenCalledTimes(1);

    lobby.guess(player1, "HELLO");
    lobby.guess(player2, "HELLO");
    expect(player1.notifyRoundOutcome).toHaveBeenCalledTimes(2);
    expect(player2.notifyRoundOutcome).toHaveBeenCalledTimes(2);
    expect(player1.notifyOverallOutcome).toHaveBeenCalledOnce();
    expect(player2.notifyOverallOutcome).toHaveBeenCalledOnce();
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
});
