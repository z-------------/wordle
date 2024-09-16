import { Socket } from "socket.io";
import { ServerMessage } from "../common/message.mjs";
import { Outcome, Verdict } from "../common/types.mjs";
import Player from "./player.mjs";

function sendMessage(socket: Socket, message: ServerMessage) {
    socket.send(message);
}

export default class SocketPlayer implements Player {
    playerIdx = -1;

    constructor(private readonly socket: Socket) {}

    notifyPlayerIdx(pidx: number) {
        this.playerIdx = pidx;
    }

    notifyInvalidGuess(reason: string) {
        sendMessage(this.socket, {
            kind: "INVALID_GUESS",
            reason,
        });
    }

    notifyVerdicts(pidx: number, guessedWord: string, verdicts: Verdict[]) {
        sendMessage(this.socket, {
            kind: "VERDICTS",
            isOwn: pidx === this.playerIdx,
            guessedWord,
            verdicts,
        });
    }

    notifyTurn() {
        sendMessage(this.socket, {
            kind: "TURN",
        });
    }

    notifyGuessesLeft(pidx: number, guessesLeft: number) {
        sendMessage(this.socket, {
            kind: "GUESSES_LEFT",
            isOwn: pidx === this.playerIdx,
            guessesLeft,
        });
    }

    notifyRound(currentRound: number, totalRounds: number) {
        sendMessage(this.socket, {
            kind: "ROUND",
            currentRound,
            totalRounds,
        });
    }

    notifyRoundOutcome(scores: number[]) {
        sendMessage(this.socket, {
            kind: "ROUND_OUTCOME",
            scores,
        });
    }

    notifyOverallOutcome(outcome: Outcome, scores: number[]) {
        sendMessage(this.socket, {
            kind: "OVERALL_OUTCOME",
            outcome,
            scores,
        });
    }

    notifyLeave(reason: string): void {
        sendMessage(this.socket, {
            kind: "LEAVE",
            reason,
        });
    }
}
