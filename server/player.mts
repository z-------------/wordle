import { Verdict } from "../common/verdict.mjs";

export default interface Player {
    playerIdx: number;
    notifyPlayerIdx(playerIdx: number): void;
    notifyInvalidGuess(error: string): void;
    notifyVerdicts(playerIdx: number, guessedWord: string, verdicts: Verdict[]): void;
    notifyTurn(): void;
    notifyOutcome(win: boolean): void;
    notifyGuessesLeft(playerIdx: number, guessesLeft: number): void;
    notifyRound(currentRound: number, totalRounds: number): void;
    notifyRoundOutcome(): void;
    notifyOverallOutcome(): void;
}
