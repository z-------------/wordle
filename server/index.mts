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
    const player: Player = {
        playerIdx: -1,
        notifyPlayerIdx: function (pidx: number): void {
            this.playerIdx = pidx;
            socket.send(createMessage(MessageKind.PLAYER_IDX, this.playerIdx.toString()));
        },
        notifyInvalidGuess: function (error: string): void {
            socket.send(createMessage(MessageKind.INVALID_GUESS, error));
        },
        notifyVerdicts: function (playerIdx: number, guessedWord: string, verdicts: Verdict[]): void {
            const data = JSON.stringify([playerIdx, guessedWord, verdicts]);
            socket.send(createMessage(MessageKind.VERDICTS, data));
        },
        notifyTurn: function (): void {
            socket.send(createMessage(MessageKind.TURN, ""));
        },
        notifyOutcome: function (win: boolean): void {
            socket.send(createMessage(MessageKind.OUTCOME, win ? "win" : "lose"));
        },
        notifyGuessesLeft: function (playerIdx: number, guessesLeft: number): void {
            const data = JSON.stringify([playerIdx, guessesLeft]);
            socket.send(createMessage(MessageKind.GUESSES_LEFT, data));
        },
        notifyRound: function (currentRound: number, totalRounds: number): void {
            const data = JSON.stringify([currentRound, totalRounds]);
            socket.send(createMessage(MessageKind.ROUND, data));
        },
        notifyRoundOutcome: function (): void {
            socket.send(createMessage(MessageKind.ROUND_OUTCOME, ""));
        },
        notifyOverallOutcome: function (): void {
            socket.send(createMessage(MessageKind.OVERALL_OUTCOME, ""));
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
                lobby.guess(player, guessedWord);
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
