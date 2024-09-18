import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { createServer } from "node:http";
import { Server, Socket as ServerSocket } from "socket.io";
import { io, Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Wordle from "./Wordle";

function waitForMessage(socket: ServerSocket) {
  return new Promise((resolve) => {
    socket.once("message", resolve);
  });
}

describe("Wordle component", () => {
  let server: Server;
  let socket: Socket;
  let serverSocket: ServerSocket;

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

  it("requests to start game when Start is clicked", async () => {
    render(<Wordle socket={socket} />);
    await waitFor(async () => {
      screen.getByText("Start").click();
      const message = await waitForMessage(serverSocket);
      expect(message).toEqual({
        kind: "HELLO",
        data: "",
      });
    });
  });
});
