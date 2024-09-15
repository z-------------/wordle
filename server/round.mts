import { sample } from "./common.mjs";
import Game, { State } from "./game.mjs";

export default class Round {
    readonly games: Game[];

    constructor(maxGuesses: number, playersCount: number, wordList: string[]) {
        const word = sample(wordList);
        this.games = Array(playersCount)
            .fill(undefined)
            .map(() => new Game(maxGuesses, word, wordList));
        console.log("new round", { word });
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
}
