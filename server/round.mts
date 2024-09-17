import { sample } from "./common.mjs";
import Game, { State } from "./game.mjs";

export default class Round {
    private readonly _word: string;
    readonly games: Game[];

    constructor(maxGuesses: number, playersCount: number, wordList: string[], word?: string) {
        this._word = word || sample(wordList);
        this.games = Array(playersCount)
            .fill(undefined)
            .map(() => new Game(maxGuesses, this._word, wordList));
        console.log("new round", { word: this._word });
    }

    get isFinished(): boolean {
        return this.games.every(game => game.state !== State.IN_PROGRESS);
    }

    get scores(): number[] {
        if (this.isFinished) {
            return this.games.map(game => game.state === State.LOSE ? 0 : game.guessesLeft + 1);
        }
        return this.games.map(() => 0);
    }

    get word(): string {
        return this._word;
    }
}
