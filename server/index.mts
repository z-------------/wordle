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
const MAX_DISCONNECTION_DURATION = 2 * 60 * 1000; // same as socket.io's default
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: MAX_DISCONNECTION_DURATION,
    },
});

const players: {
    [id: string]: {
        socketPlayer: SocketPlayer,
        timeoutId?: NodeJS.Timeout,
    }
} = {};
const wordleServer = new WordleServer(opts.maxGuesses, wordList, opts.roundsCount);

io.on("connection", (socket) => {
    console.log("client connected", socket.id, "recovered?", socket.recovered);

    if (players[socket.id]) {
        console.log("existing player reconnected");
        players[socket.id].socketPlayer.setSocket(socket);
        if (players[socket.id].timeoutId) {
            clearTimeout(players[socket.id].timeoutId);
        }
    } else {
        console.log("new player");
        players[socket.id] = {
            socketPlayer: new SocketPlayer(socket),
        };
    }
    const player = players[socket.id];
    wordleServer.addPlayer(player.socketPlayer);

    socket.on("disconnect", () => {
        console.log("client disconnected", socket.id);
        player.timeoutId = setTimeout(() => {
            console.log("giving up on", socket.id);
            wordleServer.leaveLobby(player.socketPlayer);
            delete players[socket.id];
        }, MAX_DISCONNECTION_DURATION / 2);
    });
    socket.on("message", (data) => {
        const message = parseClientMessage(data);
        if (message) {
            if (message.kind === ClientMessageKind.HELLO) {
                wordleServer.joinLobby(player.socketPlayer);
            } else if (message.kind === ClientMessageKind.BYE) {
                wordleServer.leaveLobby(player.socketPlayer);
            } else if (message.kind === ClientMessageKind.GUESS) {
                wordleServer.guess(player.socketPlayer, message.data);
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
