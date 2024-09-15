import { Outcome, Verdict } from "../common/types.mjs";

export default interface Player {
    playerIdx: number;
    notifyPlayerIdx(playerIdx: number): void;
    notifyInvalidGuess(error: string): void;
    notifyVerdicts(playerIdx: number, guessedWord: string, verdicts: Verdict[]): void;
    notifyTurn(): void;
    notifyGuessesLeft(playerIdx: number, guessesLeft: number): void;
    notifyRound(currentRound: number, totalRounds: number): void;
    notifyRoundOutcome(scores: number[]): void;
    notifyOverallOutcome(outcome: Outcome, scores: number[]): void;
}
