import { Verdict } from "../common/verdict.mjs";
import { sample } from "./common.mjs";
import Game, { State } from "./game.mjs";
import Player from "./player.mjs";

const MAX_PLAYERS = 2;
const MAX_ROUNDS = 2;

class Round {
    constructor(readonly games: Game[]) {}

    get isFinished(): boolean {
        return this.games.every(game => game.state !== State.IN_PROGRESS);
    }
}

export default class Lobby {
    private readonly players = [] as Player[];
    private readonly rounds = [] as Round[];
    private readonly word: string;

    constructor(
        private readonly maxGuesses: number,
        private readonly wordList: string[],
    ) {
        this.word = sample(wordList);
    }

    get isFull(): boolean {
        return this.players.length >= MAX_PLAYERS;
    }

    get isFinished(): boolean {
        const round = this.currentRound;
        return !!round && round.isFinished && this.rounds.length >= MAX_ROUNDS;
    }

    addPlayer(player: Player) {
        if (this.players.length < MAX_PLAYERS) {
            const playerIdx = this.players.length;
            this.players.push(player);
            player.notifyPlayerIdx(playerIdx);
            if (this.isFull) {
                this.startNewRound();
            }
        }
    }

    private startNewRound() {
        const games = Array(MAX_PLAYERS)
            .fill(undefined)
            .map(() => new Game(this.maxGuesses, this.word, this.wordList));
        const round = new Round(games);
        this.rounds.push(round);

        this.players.forEach((player, playerIdx) => {
            const game = games[playerIdx];
            player.notifyRound(this.rounds.length, MAX_ROUNDS);
            player.notifyTurn();
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft);
            });
        });
    }

    guess(playerIdx: number, guessedWord: string) {
        const round = this.currentRound;
        if (round && !this.isFinished && playerIdx >= 0 && playerIdx < MAX_PLAYERS) {
            const player = this.players[playerIdx];
            const game = round.games[playerIdx];
            const { verdicts, error } = game.guess(guessedWord);
            if (error) {
                player.notifyInvalidGuess(error);
            } else if (verdicts) {
                this.notifyVerdicts(player, playerIdx, guessedWord, verdicts);
            }
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft);
            });
            if (game.state === State.IN_PROGRESS) {
                player.notifyTurn();
            } else {
                player.notifyOutcome(game.state === State.WIN);
            }
            if (round.isFinished) {
                this.players.forEach((player) => player.notifyRoundOutcome());
                if (this.rounds.length < MAX_ROUNDS) {
                    this.startNewRound();
                } else {
                    this.players.forEach((player) => player.notifyOverallOutcome());
                }
            }
        }
    }

    private notifyVerdicts(player: Player, playerIdx: number, guessedWord: string, verdicts: Verdict[]) {
        player.notifyVerdicts(playerIdx, guessedWord, verdicts);
        const emptyWord = Array(guessedWord.length + 1).join(" ");
        this.players.forEach((otherPlayer) => {
            if (otherPlayer !== player) {
                otherPlayer.notifyVerdicts(playerIdx, emptyWord, verdicts);
            }
        });
    }

    private get currentRound(): Round | undefined {
        if (this.rounds.length > 0) {
            const round = this.rounds[this.rounds.length - 1];
            if (!round.isFinished) {
                return round;
            }
        }
        return undefined;
    }
}
