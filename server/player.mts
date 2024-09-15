import { Verdict } from "../common/verdict.mjs";

export default interface Player {
    notifyPlayerIdx(playerIdx: number): void;
    notifyInvalidGuess(error: string): void;
    notifyVerdicts(playerIdx: number, guessedWord: string, verdicts: Verdict[]): void;
    notifyTurn(playerIdx: number, guessesLeft: number): void;
    notifyOutcome(win: boolean): void;
}
