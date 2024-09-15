import { Verdict } from "../common/verdict.mjs";
import { State } from "./game.mjs";
import Player from "./player.mjs";
import Round from "./round.mjs";

const PLAYERS_COUNT = 2;
const ROUNDS_COUNT = 2;

export default class Lobby {
    private readonly players = [] as Player[];
    private readonly rounds = [] as Round[];
    private readonly scores: number[] = Array(PLAYERS_COUNT).fill(0);

    constructor(
        private readonly maxGuesses: number,
        private readonly wordList: string[],
    ) {}

    get isFull(): boolean {
        return this.players.length >= PLAYERS_COUNT;
    }

    addPlayer(player: Player) {
        if (this.players.length < PLAYERS_COUNT) {
            const playerIdx = this.players.length;
            this.players.push(player);
            player.notifyPlayerIdx(playerIdx);
            if (this.isFull) {
                this.startNewRound();
            }
        }
    }

    private startNewRound() {
        const round = new Round(this.maxGuesses, PLAYERS_COUNT, this.wordList);
        this.rounds.push(round);

        this.players.forEach((player, playerIdx) => {
            const game = round.games[playerIdx];
            player.notifyRound(this.rounds.length, ROUNDS_COUNT);
            player.notifyTurn();
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft);
            });
        });
    }

    guess(player: Player, guessedWord: string) {
        const isValidPlayer = player && player.playerIdx >= 0 && player.playerIdx < PLAYERS_COUNT;
        const round = this.currentRound;
        if (isValidPlayer && round) {
            const game = round.games[player.playerIdx];
            const { verdicts, error } = game.guess(guessedWord);
            if (error) {
                player.notifyInvalidGuess(error);
            } else if (verdicts) {
                this.notifyVerdicts(player, guessedWord, verdicts);
            }
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(player.playerIdx, game.guessesLeft);
            });
            if (game.state === State.IN_PROGRESS) {
                player.notifyTurn();
            } else {
                player.notifyOutcome(game.state === State.WIN);
            }
            if (round.isFinished) {
                const roundScores = round.scores;
                roundScores.forEach((score, i) => this.scores[i] += score);
                this.players.forEach((player) => player.notifyRoundOutcome(roundScores));
                if (this.rounds.length >= ROUNDS_COUNT) {
                    this.players.forEach((player) => player.notifyOverallOutcome(this.scores));
                } else {
                    this.startNewRound();
                }
            }
        }
    }

    private notifyVerdicts(player: Player, guessedWord: string, verdicts: Verdict[]) {
        player.notifyVerdicts(player.playerIdx, guessedWord, verdicts);
        const emptyWord = Array(guessedWord.length + 1).join(" ");
        this.players.forEach((otherPlayer) => {
            if (otherPlayer !== player) {
                otherPlayer.notifyVerdicts(player.playerIdx, emptyWord, verdicts);
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
