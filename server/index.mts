import express from "express";
import * as http from "node:http";
import { Server } from "socket.io";
import { ClientMessageKind, parseClientMessage } from "../common/message.mjs";
import { readWordList } from "./common.mjs";
import Lobby from "./lobby.mjs";
import { parseOpts } from "./opts.mjs";
import Player from "./player.mjs";
import SocketPlayer from "./socket-player.mjs";

const opts = parseOpts();
const wordList = await readWordList(opts.wordsList);
let lobbies = [] as Lobby[];

const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

function findOrCreateLobby(player: Player): Lobby {
    let lobby: Lobby | undefined;
    console.log(lobbies.length, "existing lobbies");
    for (const existingLobby of lobbies) {
        if (!existingLobby.isFull) {
            console.log("using existing lobby");
            lobby = existingLobby;
            break;
        }
    }
    if (!lobby) {
        lobby = new Lobby(opts.maxGuesses, wordList);
        lobbies.push(lobby);
        console.log("created new lobby");
    }
    lobby.addPlayer(player);
    return lobby;
}

function deleteLobby(lobby: Lobby) {
    lobbies = lobbies.filter((l) => l !== lobby);
    console.log("deleted a lobby,", lobbies.length, "remaining lobbies");
}

io.on("connection", (socket) => {
    console.log("client connected");

    let lobby: Lobby | undefined;
    const player = new SocketPlayer(socket);

    socket.on("disconnect", () => {
        console.log("client disconnected");
        if (lobby) {
            lobby.removePlayer(player);
            deleteLobby(lobby);
        }
    });
    socket.on("message", (data) => {
        const message = parseClientMessage(data);
        if (message) {
            if (message.kind === ClientMessageKind.HELLO) {
                if (!lobby) {
                    lobby = findOrCreateLobby(player);
                }
            } else if (message.kind === ClientMessageKind.GUESS && lobby) {
                const guessedWord = message.data;
                console.log("received guess", guessedWord);
                lobby.guess(player, guessedWord);
                if (lobby.isFinished) {
                    lobby.end();
                    deleteLobby(lobby);
                }
            } else {
                console.warn("unexpected message kind", message.kind);
            }
        } else {
            console.warn("received invalid message", data);
        }
    });
});
server.listen(PORT, () => {
    console.log("listening on", PORT);
});
