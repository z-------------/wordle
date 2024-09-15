import { Socket } from "socket.io";
import { createMessage, MessageKind } from "../common/message.mjs";
import { Outcome, Verdict } from "../common/types.mjs";
import Player from "./player.mjs";

export default class SocketPlayer implements Player {
    playerIdx = -1;

    constructor(private readonly socket: Socket) {}

    notifyPlayerIdx(pidx: number) {
        this.playerIdx = pidx;
    }

    notifyInvalidGuess(error: string) {
        this.socket.send(createMessage(MessageKind.INVALID_GUESS, error));
    }

    notifyVerdicts(pidx: number, guessedWord: string, verdicts: Verdict[]) {
        const data = JSON.stringify([pidx === this.playerIdx, guessedWord, verdicts]);
        this.socket.send(createMessage(MessageKind.VERDICTS, data));
    }

    notifyTurn() {
        this.socket.send(createMessage(MessageKind.TURN, ""));
    }

    notifyOutcome(win: boolean) {
        this.socket.send(createMessage(MessageKind.OUTCOME, win ? "win" : "lose"));
    }

    notifyGuessesLeft(pidx: number, guessesLeft: number) {
        const data = JSON.stringify([pidx === this.playerIdx, guessesLeft]);
        this.socket.send(createMessage(MessageKind.GUESSES_LEFT, data));
    }

    notifyRound(currentRound: number, totalRounds: number) {
        const data = JSON.stringify([currentRound, totalRounds]);
        this.socket.send(createMessage(MessageKind.ROUND, data));
    }

    notifyRoundOutcome(scores: number[]) {
        const data = JSON.stringify(scores);
        this.socket.send(createMessage(MessageKind.ROUND_OUTCOME, data));
    }

    notifyOverallOutcome(outcome: Outcome, scores: number[]) {
        const data = JSON.stringify([outcome, scores]);
        this.socket.send(createMessage(MessageKind.OVERALL_OUTCOME, data));
    }
}
