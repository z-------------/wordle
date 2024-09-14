import { InvalidArgumentError, program } from "commander";
import { open } from "node:fs/promises";
import WebSocket, { WebSocketServer } from "ws";
import { MessageKind, parseMessage } from "../common/message.mjs";
import { isValidWord } from "./common.mjs";
import Game, { State } from "./game.mjs";

const PORT = 8000;

async function readWordList(filename: string): Promise<string[]> {
    try {
        const wordList = [];
        const file = await open(filename);
        for await (const line of file.readLines()) {
            const word = line.trim();
            if (isValidWord(word)) {
                wordList.push(word.toUpperCase());
            } else {
                console.warn(`Ignoring invalid word in word list: "${word}"`);
            }
        }
        if (wordList.length === 0) {
            throw new Error("Word list is empty");
        }
        return wordList;
    } catch (e) {
        throw new Error(`Failed to read words list: ${e}`);
    }
}

function parsePositiveOption(s: string): number {
    const value = parseInt(s);
    if (Number.isNaN(value) || value < 1) {
        throw new InvalidArgumentError("Not a positive integer.");
    }
    return value;
}

function sendMessage(ws: WebSocket, kind: MessageKind, data: string) {
    ws.send(JSON.stringify({ kind, data }));
}

program
    .option("--maxGuesses <n>", "maximum number of guesses", parsePositiveOption)
    .requiredOption("--wordsList <filename>", "filename containing the newline-delimited word list");
program.parse();
const opts = program.opts();
const maxGuesses = opts.maxGuesses || 5;
const wordList = await readWordList(opts.wordsList);

const wss = new WebSocketServer({ port: PORT });
wss.on("connection", (ws) => {
    console.log("client connected");

    const game = new Game(maxGuesses, wordList);
    sendMessage(ws, MessageKind.TURN, game.guessesLeft.toString());

    ws.on("error", console.error);
    ws.on("close", () => console.log("client disconnected"));
    ws.on("message", (data) => {
        const message = parseMessage(data.toString("utf-8"));
        console.log(message);
        if (message) {
            if (message.kind === MessageKind.GUESS) {
                console.log("received guess", message.data);
                const guessResult = game.guess(message.data);
                if (guessResult.error) {
                    sendMessage(ws, MessageKind.INVALID_GUESS, guessResult.error);
                } else if (guessResult.verdicts) {
                    sendMessage(ws, MessageKind.VERDICTS, JSON.stringify(guessResult.verdicts));
                }
                if (game.state === State.IN_PROGRESS) {
                    sendMessage(ws, MessageKind.TURN, game.guessesLeft.toString());
                } else {
                    sendMessage(ws, MessageKind.OUTCOME, game.state === State.WIN ? "win" : "lose");
                    ws.close();
                }
            } else {
                console.warn("unexpected message kind", message.kind);
            }
        } else {
            console.warn("received invalid message", data);
        }
    });
});
console.log("listening on", PORT);
