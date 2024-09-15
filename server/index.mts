import express from "express";
import * as http from "node:http";
import { Server } from "socket.io";
import { createMessage, MessageKind, parseMessage } from "../common/message.mjs";
import { Verdict } from "../common/verdict.mjs";
import { readWordList } from "./common.mjs";
import Lobby from "./lobby.mjs";
import { parseOpts } from "./opts.mjs";
import Player from "./player.mjs";

const opts = parseOpts();
const wordList = await readWordList(opts.wordsList);
const lobbies = [] as Lobby[];

const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

function findOrCreateLobby(player: Player): Lobby {
    let lobby: Lobby | undefined;
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

io.on("connection", (socket) => {
    console.log("client connected");

    let lobby: Lobby | undefined;
    let playerIdx = -1;
    const player: Player = {
        notifyPlayerIdx: function(pidx: number): void {
            playerIdx = pidx;
        },
        notifyInvalidGuess: function (error: string): void {
            socket.send(createMessage(MessageKind.INVALID_GUESS, error));
        },
        notifyVerdicts: function (pidx: number, guessedWord: string, verdicts: Verdict[]): void {
            const kind = pidx === playerIdx ? MessageKind.VERDICTS : MessageKind.OPPONENT_VERDICTS;
            socket.send(createMessage(kind, JSON.stringify([guessedWord, verdicts])));
        },
        notifyTurn: function (pidx: number, guessesLeft: number): void {
            const kind = pidx === playerIdx ? MessageKind.TURN : MessageKind.OPPONENT_TURN;
            socket.send(createMessage(kind, guessesLeft.toString()));
        },
        notifyOutcome: function (win: boolean): void {
            socket.send(createMessage(MessageKind.OUTCOME, win ? "win" : "lose"));
        }
    };

    socket.on("disconnect", () => {
        console.log("client disconnected");
    });
    socket.on("message", (data) => {
        const message = parseMessage(data);
        if (message) {
            if (message.kind === MessageKind.HELLO) {
                if (!lobby) {
                    lobby = findOrCreateLobby(player);
                }
            } else if (message.kind === MessageKind.GUESS && lobby) {
                const guessedWord = message.data;
                console.log("received guess", guessedWord);
                lobby.guess(playerIdx, guessedWord);
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
