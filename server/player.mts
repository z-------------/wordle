import { Outcome, Verdict } from "../common/types.mjs";
import Lobby from "./lobby.mjs";

export default interface Player {
    playerIdx: number;
    lobby: Lobby | undefined;
    notifyPlayerIdx(playerIdx: number): void;
    notifyInvalidGuess(reason: string): void;
    notifyVerdicts(playerIdx: number, guessedWord: string, verdicts: Verdict[]): void;
    notifyGuessesLeft(playerIdx: number, guessesLeft: number, canGuess: boolean): void;
    notifyRound(currentRound: number, totalRounds: number): void;
    notifyRoundOutcome(scores: number[]): void;
    notifyOverallOutcome(outcome: Outcome, scores: number[]): void;
    notifyLeave(reason: string): void;
}
