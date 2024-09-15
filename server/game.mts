import { Verdict } from "../common/verdict.mjs";
import { isValidWord, WORD_LENGTH } from "./common.mjs";

export enum State {
    IN_PROGRESS,
    WIN,
    LOSE,
}

export interface GuessResult {
    verdicts?: Verdict[];
    error?: string;
}

function judge(word: string, guessedWord: string): Verdict[] {
    const verdicts: Verdict[] = Array(WORD_LENGTH).fill(Verdict.MISS);
    const usedIndexes: number[] = [];
    // check for HIT letters
    for (let i = 0; i < guessedWord.length; ++i) {
        if (guessedWord[i] === word[i]) {
            verdicts[i] = Verdict.HIT;
            usedIndexes.push(i);
        }
    }
    // check for PRESENT letters that aren't already used
    for (let i = 0; i < guessedWord.length; ++i) {
        for (let j = 0; j < word.length; ++j) {
            if (guessedWord[i] === word[j] && verdicts[i] !== Verdict.HIT && !usedIndexes.includes(j)) {
                verdicts[i] = Verdict.PRESENT;
                usedIndexes.push(j);
                break;
            }
        }
    }
    return verdicts;
}

export default class Game {
    private win = false;
    private _guessesLeft: number;

    constructor(
        private readonly maxGuesses: number,
        private readonly word: string,
        private readonly wordList: string[],
    ) {
        this._guessesLeft = this.maxGuesses;
    }

    get guessesLeft(): number {
        return this._guessesLeft;
    }

    get state(): State {
        if (this.win) {
            return State.WIN;
        }
        if (this._guessesLeft <= 0) {
            return State.LOSE;
        }
        return State.IN_PROGRESS;
    }

    guess(guessedWord: string): GuessResult {
        return this.guessImpl(guessedWord.toUpperCase());
    }

    private guessImpl(guessedWord: string): GuessResult {
        if (this.state !== State.IN_PROGRESS) {
            return { error: "Cannot guess: game is not in progress." };
        }
        if (isValidWord(guessedWord)) {
            if (this.wordList.includes(guessedWord)) {
                --this._guessesLeft;
                const verdicts = judge(this.word, guessedWord);
                this.win = verdicts.every(v => v === Verdict.HIT);
                return { verdicts };
            } else {
                return { error: "Invalid guess: not in word list." };
            }
        } else {
            return { error: "Invalid guess." };
        }
    }
}
