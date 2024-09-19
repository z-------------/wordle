import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { createServer } from "node:http";
import { setTimeout } from "node:timers/promises";
import { Server, Socket as ServerSocket } from "socket.io";
import { io, Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ServerMessage } from "../../common/message.mts";
import { Ability, Outcome } from "../../common/types.mts";
import Wordle from "./Wordle";

function waitForMessage(serverSocket: ServerSocket) {
  return new Promise((resolve) => {
    serverSocket.once("message", resolve);
  });
}

function waitForMessageFromServer(socket: Socket) {
  return new Promise((resolve) => {
    socket.once("message", resolve);
  });
}

function sendMessage(serverSocket: ServerSocket, message: ServerMessage) {
  serverSocket.send(message);
}

describe("Wordle component", () => {
  let server: Server;
  let socket: Socket;
  let serverSocket: ServerSocket;

  const STEAL_BUTTON_TEXT = "Steal (cost 1)";

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      const PORT = 8080;
      const httpServer = createServer();
      server = new Server(httpServer);
      httpServer.listen(PORT, () => {
        socket = io(`http://localhost:${PORT}`);
        server.on("connection", (socket) => {
          serverSocket = socket;
        });
        socket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    server.close();
    socket.disconnect();
  });

  it("plays the game", async () => {
    render(<Wordle socket={socket} />);
    await waitFor(async () => {
      // join lobby
      screen.getByText("Join lobby").click();
      expect(await waitForMessage(serverSocket)).toEqual({
        kind: "HELLO",
        data: "",
      });
      expect(screen.getByText("Enter")).toBeDisabled();

      // round started
      sendMessage(serverSocket, {
        kind: "ROUND",
        currentRound: 1,
        totalRounds: 2,
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText("Round 1 of 2 started")).toBeInTheDocument();
      sendMessage(serverSocket, {
        kind: "GUESSES_LEFT",
        isOwn: true,
        guessesLeft: 6,
        canGuess: true,
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText("Enter")).toBeEnabled();
      expect(screen.getByText(STEAL_BUTTON_TEXT)).toBeDisabled();

      // send a guess
      screen.getByText("H").click();
      screen.getByText("E").click();
      screen.getByText("Y").click();
      screen.getByTestId("keyboard-backspace").click();
      screen.getByText("L").click();
      screen.getByText("L").click();
      screen.getByText("O").click();
      await setTimeout(10); // guessedWord is empty without this
      screen.getByText("Enter").click();
      expect(await waitForMessage(serverSocket)).toEqual({
        kind: "GUESS",
        data: "HELLO",
      });

      // end round
      sendMessage(serverSocket, {
        kind: "SCORES",
        roundScores: [
          { player: 6, opponent: 3 },
        ],
        runningScores: { player: 6, opponent: 3 },
        outcome: Outcome.WIN,
        word: "HELLO",
      });
      await waitForMessageFromServer(socket);
      sendMessage(serverSocket, {
        kind: "GUESSES_LEFT",
        isOwn: false,
        guessesLeft: 3,
        canGuess: true,
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText(STEAL_BUTTON_TEXT)).toBeEnabled();

      // opponent makes some guesses
      sendMessage(serverSocket, {
        kind: "GUESSES_LEFT",
        isOwn: false,
        guessesLeft: 0,
        canGuess: false,
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText(STEAL_BUTTON_TEXT)).toBeDisabled();

      // use ability
      sendMessage(serverSocket, {
        kind: "GUESSES_LEFT",
        isOwn: false,
        guessesLeft: 3,
        canGuess: true,
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText(STEAL_BUTTON_TEXT)).toBeEnabled();
      screen.getByText(STEAL_BUTTON_TEXT).click();
      expect(await waitForMessage(serverSocket)).toEqual({
        kind: "ABILITY",
        data: "0",
      });
      sendMessage(serverSocket, {
        kind: "USED_ABILITY",
        isOwn: true,
        ability: Ability.STEAL,
        cost: 1,
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText("You used ability for cost 1")).toBeInTheDocument();
      expect(screen.getByText(STEAL_BUTTON_TEXT)).toBeDisabled();

      // quit
      screen.getByText("Quit lobby").click();
      expect(await waitForMessage(serverSocket)).toEqual({
        kind: "BYE",
        data: "",
      });
      sendMessage(serverSocket, {
        kind: "LEAVE",
        reason: "You left",
      });
      await waitForMessageFromServer(socket);
      expect(screen.getByText("You left")).toBeInTheDocument();
      expect(screen.getByText(STEAL_BUTTON_TEXT)).toBeDisabled();
      expect(screen.getByText("Enter")).toBeDisabled();
    });
  });
});
