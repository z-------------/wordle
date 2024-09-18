import { describe, expect, it, vi } from "vitest";
import WordleServer from "./wordle-server.mjs";
import Player from "./player.mts";
import Lobby from "./lobby.mts";
import { Outcome } from "../common/types.mts";

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
  notifyLeave = vi.fn();
}

describe("WordleServer class", () => {
  it("tells players if they have no current lobby", () => {
    const player = new TestPlayer();
    const wordleServer = new WordleServer(2, ["HELLO"], 1);
    wordleServer.addPlayer(player);
    expect(player.notifyLeave).toHaveBeenCalledTimes(1);
  });

  it("assigns lobbies", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const wordleServer = new WordleServer(2, ["HELLO"], 1);

    wordleServer.joinLobby(player1);
    expect(player1.notifyRound).not.toHaveBeenCalled();
    expect(player2.notifyRound).not.toHaveBeenCalled();

    wordleServer.joinLobby(player2);
    expect(player1.notifyRound).toHaveBeenCalledTimes(1);
    expect(player2.notifyRound).toHaveBeenCalledTimes(1);
  });

  it("ends lobbies when their players leave", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const wordleServer = new WordleServer(2, ["HELLO"], 1);

    wordleServer.joinLobby(player1);
    wordleServer.joinLobby(player2);
    expect(wordleServer["lobbies"]).toHaveLength(1);
    expect(player1.notifyLeave).not.toHaveBeenCalled();
    expect(player2.notifyLeave).not.toHaveBeenCalled();

    wordleServer.leaveLobby(player1);
    expect(wordleServer["lobbies"]).toHaveLength(0);
    expect(player1.notifyLeave).toHaveBeenCalledOnce();
    expect(player2.notifyLeave).toHaveBeenCalledOnce();
  });

  it("accepts guesses", () => {
    const player1 = new TestPlayer();
    const player2 = new TestPlayer();
    const wordleServer = new WordleServer(2, ["HELLO"], 1);
    wordleServer.joinLobby(player1);
    wordleServer.joinLobby(player2);

    // finish the match
    wordleServer.guess(player1, "HELLO");
    wordleServer.guess(player2, "HELLO");
    wordleServer.guess(player1, "HELLO");
    wordleServer.guess(player2, "HELLO");

    expect(wordleServer["lobbies"]).toHaveLength(0);
    expect(player1.notifyRoundOutcome).toHaveBeenLastCalledWith(expect.any(Object), expect.any(Object), Outcome.TIE);
    expect(player2.notifyRoundOutcome).toHaveBeenLastCalledWith(expect.any(Object), expect.any(Object), Outcome.TIE);
    expect(player1.notifyLeave).toHaveBeenCalledOnce();
    expect(player2.notifyLeave).toHaveBeenCalledOnce();
  });
});
