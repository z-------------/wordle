import express from "express";
import * as http from "node:http";
import { Server } from "socket.io";
import { ClientMessageKind, parseClientMessage } from "../common/message.mjs";
import { readWordList } from "./common.mjs";
import { parseOpts } from "./opts.mjs";
import SocketPlayer from "./socket-player.mjs";
import WordleServer from "./wordle-server.mjs";

const opts = parseOpts();
const wordList = await readWordList(opts.wordsList);

const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const players: { [id: string]: SocketPlayer } = {};
const wordleServer = new WordleServer(opts.maxGuesses, wordList);

io.on("connection", (socket) => {
    console.log("client connected", socket.id, "recovered?", socket.recovered);

    const player = new SocketPlayer(socket);
    players[socket.id] = player;
    wordleServer.addPlayer(player);

    socket.on("disconnect", () => {
        console.log("client disconnected");
        wordleServer.removePlayer(player);
        delete players[socket.id];
    });
    socket.on("message", (data) => {
        const message = parseClientMessage(data);
        if (message) {
            if (message.kind === ClientMessageKind.HELLO) {
                wordleServer.joinLobby(player);
            } else if (message.kind === ClientMessageKind.GUESS) {
                wordleServer.guess(player, message.data);
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
