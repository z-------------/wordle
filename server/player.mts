import { Scores } from "../common/message.mjs";
import { Ability, Outcome, Verdict } from "../common/types.mjs";
import Lobby from "./lobby.mjs";

export default interface Player {
    playerIdx: number;
    lobby: Lobby | undefined;
    notifyPlayerIdx(playerIdx: number): void;
    notifyInvalidGuess(reason: string): void;
    notifyVerdicts(playerIdx: number, guessedWord: string, verdicts: Verdict[]): void;
    notifyGuessesLeft(playerIdx: number, guessesLeft: number, canGuess: boolean): void;
    notifyRound(currentRound: number, totalRounds: number): void;
    notifyScores(roundScores: Scores[], runningScores: Scores, outcome: Outcome, word?: string): void;
    notifyLeave(reason: string): void;
    notifyUsedAbility(playerIdx: number, ability: Ability, cost: number): void;
}
