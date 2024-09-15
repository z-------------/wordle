import Game, { State } from "./game.mjs";
import Player from "./player.mjs";

const MAX_PLAYERS = 2;

function sample<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
}

export default class Lobby {
    private readonly players = [] as Player[];
    private readonly games = [] as Game[];
    private readonly word: string;

    constructor(
        private readonly maxGuesses: number,
        private readonly wordList: string[],
    ) {
        this.word = sample(wordList);
    }

    get isFull(): boolean {
        return this.games.length >= MAX_PLAYERS;
    }

    addPlayer(player: Player) {
        if (this.players.length < MAX_PLAYERS) {
            const playerIdx = this.players.length;
            this.players.push(player);
            this.games.push(new Game(this.maxGuesses, this.word, this.wordList));
            player.notifyPlayerIdx(playerIdx);
            if (this.isFull) {
                this.notifyGameStart();
            }
        }
    }

    notifyGameStart() {
        this.players.forEach((player, playerIdx) => {
            const game = this.games[playerIdx];
            player.notifyTurn();
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft);
            });
        });
    }

    guess(playerIdx: number, guessedWord: string) {
        if (this.isFull) {
            const player = this.players[playerIdx];
            const game = this.games[playerIdx];
            const { verdicts, error } = game.guess(guessedWord);
            if (error) {
                player.notifyInvalidGuess(error);
            } else if (verdicts) {
                player.notifyVerdicts(playerIdx, guessedWord, verdicts);
                const emptyWord = Array(guessedWord.length + 1).join(" ");
                this.players.forEach((otherPlayer) => {
                    if (otherPlayer !== player) {
                        otherPlayer.notifyVerdicts(playerIdx, emptyWord, verdicts);
                    }
                });
            }
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft);
            });
            if (game.state === State.IN_PROGRESS) {
                player.notifyTurn();
            } else {
                player.notifyOutcome(game.state === State.WIN);
            }
        }
    }
}
