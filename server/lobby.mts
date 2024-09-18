import { Outcome, Verdict } from "../common/types.mjs";
import { State } from "./game.mjs";
import Player from "./player.mjs";
import Round from "./round.mjs";

const PLAYERS_COUNT = 2; // must be 2

export default class Lobby {
    private _isFinished = false;
    private players = [] as Player[];
    private readonly rounds = [] as Round[];
    private readonly runningScores: number[] = Array(PLAYERS_COUNT).fill(0);

    constructor(
        private readonly maxGuesses: number,
        private readonly wordList: string[],
        private readonly roundsCount: number,
    ) {}

    get isFull(): boolean {
        return this.players.length >= PLAYERS_COUNT;
    }

    get isFinished(): boolean {
        return this._isFinished;
    }

    addPlayer(player: Player) {
        if (this.players.length < PLAYERS_COUNT) {
            const playerIdx = this.players.length;
            this.players.push(player);
            player.lobby = this;
            player.notifyPlayerIdx(playerIdx);
            if (this.isFull) {
                this.startNewRound();
            }
        }
    }

    end(playerWhoLeft?: Player) {
        this.players.forEach((player) => {
            player.lobby = undefined;
            if (playerWhoLeft) {
                if (player === playerWhoLeft) {
                    player.notifyLeave("You left");
                } else {
                    player.notifyLeave("Opponent left");
                }
            } else {
                player.notifyLeave("Lobby ended");
            }
        });
    }

    private startNewRound() {
        const round = new Round(this.maxGuesses, PLAYERS_COUNT, this.wordList);
        this.rounds.push(round);

        this.players.forEach((player, playerIdx) => {
            const game = round.games[playerIdx];
            player.notifyRound(this.rounds.length, this.roundsCount);
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft, true);
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
                otherPlayer.notifyGuessesLeft(player.playerIdx, game.guessesLeft, game.state === State.IN_PROGRESS);
            });
            if (round.isFinished) {
                const roundScores = round.scores;
                roundScores.forEach((score, i) => this.runningScores[i] += score);
                if (this.rounds.length >= this.roundsCount) {
                    this._isFinished = true;
                }
                this.notifyRoundOutcome(roundScores);
                if (!this._isFinished) {
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

    private notifyRoundOutcome(roundScores: number[]) {
        this.players.forEach((player) => {
            const opponentPlayerIdx = 1 - player.playerIdx;
            const playerRunningScore = this.runningScores[player.playerIdx];
            const opponentRunningScore = this.runningScores[opponentPlayerIdx];
            const outcome =
                !this._isFinished ? Outcome.UNDECIDED :
                playerRunningScore > opponentRunningScore ? Outcome.WIN :
                playerRunningScore === opponentRunningScore ? Outcome.TIE :
                Outcome.LOSE;
            player.notifyRoundOutcome(
                {
                    player: roundScores[player.playerIdx],
                    opponent: roundScores[opponentPlayerIdx],
                },
                {
                    player: playerRunningScore,
                    opponent: opponentRunningScore,
                },
                outcome,
            )
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
