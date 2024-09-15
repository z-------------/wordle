import { InvalidArgumentError, program } from "commander";
import express from "express";
import * as http from "node:http";
import { Server, Socket } from "socket.io";
import { createMessage, MessageKind, parseMessage } from "../common/message.mjs";
import { readWordList } from "./common.mjs";
import Game, { State } from "./game.mjs";

function parsePositiveOption(s: string): number {
    const value = parseInt(s);
    if (Number.isNaN(value) || value < 1) {
        throw new InvalidArgumentError("Not a positive integer.");
    }
    return value;
}

program
    .option("--maxGuesses <n>", "maximum number of guesses", parsePositiveOption)
    .requiredOption("--wordsList <filename>", "filename containing the newline-delimited word list");
program.parse();
const opts = program.opts();
const maxGuesses = opts.maxGuesses || 5;
const wordList = await readWordList(opts.wordsList);

const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("client connected");

    const game = new Game(maxGuesses, wordList);
    socket.send(createMessage(MessageKind.TURN, game.guessesLeft.toString()));

    socket.on("disconnect", () => console.log("client disconnected"));
    socket.on("message", (data) => {
        const message = parseMessage(data);
        console.log(message);
        if (message) {
            if (message.kind === MessageKind.GUESS) {
                console.log("received guess", message.data);
                const guessedWord = message.data;
                const guessResult = game.guess(guessedWord);
                if (guessResult.error) {
                    socket.send(createMessage(MessageKind.INVALID_GUESS, guessResult.error));
                } else if (guessResult.verdicts) {
                    socket.send(createMessage(MessageKind.VERDICTS, JSON.stringify([guessedWord, guessResult.verdicts])));
                }
                if (game.state === State.IN_PROGRESS) {
                    socket.send(createMessage(MessageKind.TURN, game.guessesLeft.toString()));
                } else {
                    socket.send(createMessage(MessageKind.OUTCOME, game.state === State.WIN ? "win" : "lose"));
                    socket.disconnect();
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
