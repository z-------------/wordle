import { sample } from "./common.mjs";
import Game, { State } from "./game.mjs";

export default class Round {
  private readonly _word: string;
  readonly games: Game[];

  constructor(
    maxGuesses: number,
    playersCount: number,
    wordList: string[],
    word?: string, // for unit tests
  ) {
    this._word = word || sample(wordList);
    this.games = Array(playersCount)
      .fill(undefined)
      .map(() => new Game(maxGuesses, this._word, wordList));
    console.log("new round", { word: this._word });
  }

  /**
   * Check whether every game in this round is finished.
   */
  get isFinished(): boolean {
    return this.games.every(game => game.state !== State.IN_PROGRESS);
  }

  /**
   * Calculate scores for each player in this round.
   */
  get scores(): number[] {
    if (this.isFinished) {
      return this.games.map(game => game.score);
    }
    return this.games.map(() => 0);
  }

  get word(): string {
    return this._word;
  }
}
