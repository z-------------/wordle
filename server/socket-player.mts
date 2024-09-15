import { Socket } from "socket.io";
import { createMessage, MessageKind } from "../common/message.mjs";
import { Verdict } from "../common/verdict.mjs";
import Player from "./player.mjs";

export default class SocketPlayer implements Player {
    playerIdx = -1;

    constructor(private readonly socket: Socket) {}

    notifyPlayerIdx(pidx: number) {
        this.playerIdx = pidx;
        this.socket.send(createMessage(MessageKind.PLAYER_IDX, this.playerIdx.toString()));
    }

    notifyInvalidGuess(error: string) {
        this.socket.send(createMessage(MessageKind.INVALID_GUESS, error));
    }

    notifyVerdicts(playerIdx: number, guessedWord: string, verdicts: Verdict[]) {
        const data = JSON.stringify([playerIdx, guessedWord, verdicts]);
        this.socket.send(createMessage(MessageKind.VERDICTS, data));
    }

    notifyTurn() {
        this.socket.send(createMessage(MessageKind.TURN, ""));
    }

    notifyOutcome(win: boolean) {
        this.socket.send(createMessage(MessageKind.OUTCOME, win ? "win" : "lose"));
    }

    notifyGuessesLeft(playerIdx: number, guessesLeft: number) {
        const data = JSON.stringify([playerIdx, guessesLeft]);
        this.socket.send(createMessage(MessageKind.GUESSES_LEFT, data));
    }

    notifyRound(currentRound: number, totalRounds: number) {
        const data = JSON.stringify([currentRound, totalRounds]);
        this.socket.send(createMessage(MessageKind.ROUND, data));
    }

    notifyRoundOutcome() {
        this.socket.send(createMessage(MessageKind.ROUND_OUTCOME, ""));
    }

    notifyOverallOutcome() {
        this.socket.send(createMessage(MessageKind.OVERALL_OUTCOME, ""));
    }
}
