import { ABILITY_COSTS } from "../common/consts.mjs";
import { Ability, Outcome, Verdict } from "../common/types.mjs";
import { State } from "./game.mjs";
import Player from "./player.mjs";
import Round from "./round.mjs";

const PLAYERS_COUNT = 2; // must be 2

function isValidPlayer(player: Player): boolean {
    return player && player.playerIdx >= 0 && player.playerIdx < PLAYERS_COUNT;
}

export default class Lobby {
    private _isFinished = false;
    private players = [] as Player[];
    private readonly rounds = [] as Round[];
    private readonly roundScores = [] as number[][];
    private readonly abilityUseCounts: Record<Ability, number>[] = Array(PLAYERS_COUNT).fill(undefined).map(() => ({
        [Ability.STEAL]: 0,
    }));

    constructor(
        private readonly maxGuesses: number,
        private readonly wordList: string[],
        private readonly roundsCount: number,
        private readonly word?: string, // for unit tests
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

    guess(player: Player, guessedWord: string) {
        const round = this.currentRound;
        if (isValidPlayer(player) && round) {
            const game = round.games[player.playerIdx];
            const { verdicts, error } = game.guess(guessedWord);
            if (error) {
                player.notifyInvalidGuess(error);
            } else if (verdicts) {
                this.notifyVerdicts(player, guessedWord, verdicts);
            }
            this.afterMove(round);
        }
    }

    useAbility(player: Player, ability: Ability) {
        const round = this.currentRound;
        if (isValidPlayer(player) && round) {
            const runningScore = this.runningScores[player.playerIdx];
            const cost = ABILITY_COSTS[ability];
            if (runningScore > cost) {
                let used = false;
                if (ability === Ability.STEAL) {
                    used = this.useAbilitySteal(player, round);
                }
                if (used) {
                    this.afterMove(round);
                    this.roundScores[this.roundScores.length - 1][player.playerIdx] -= cost;
                    ++this.abilityUseCounts[player.playerIdx][ability];
                    this.notifyUsedAbility(player, ability, cost);
                }
            }
        }
    }

    private useAbilitySteal(player: Player, round: Round): boolean {
        // can only use steal once per player per lobby
        if (this.abilityUseCounts[player.playerIdx][Ability.STEAL] > 0) {
            return false;
        }
        const playerGame = round.games[player.playerIdx];
        const opponentGame = round.games[1 - player.playerIdx];
        // cannot use steal if opponent has no guesses left to steal
        if (opponentGame.guessesLeft <= 0) {
            return false;
        }
        ++playerGame.maxGuesses;
        --opponentGame.maxGuesses;
        return true;
    }

    private afterMove(round: Round) {
        // tell each player how many guesses each player has left
        this.players.forEach((_player, playerIdx) => {
            const game = round.games[playerIdx];
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft, game.state === State.IN_PROGRESS);
            });
        });
        if (round.isFinished) {
            // update scores
            const roundScores = round.scores;
            roundScores.forEach((score, i) => {
                this.roundScores[this.roundScores.length - 1][i] += score;
            });

            if (this.rounds.length >= this.roundsCount) {
                this._isFinished = true;
            }
            this.notifyRoundOutcome();
            if (!this._isFinished) {
                this.startNewRound();
            }
        }
    }

    private startNewRound() {
        const round = new Round(this.maxGuesses, PLAYERS_COUNT, this.wordList, this.word);
        this.rounds.push(round);
        this.roundScores.push(Array<number>(PLAYERS_COUNT).fill(0));

        this.players.forEach((player, playerIdx) => {
            const game = round.games[playerIdx];
            player.notifyRound(this.rounds.length, this.roundsCount);
            this.players.forEach((otherPlayer) => {
                otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft, true);
            });
        });
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

    private notifyRoundOutcome() {
        this.players.forEach((player) => {
            const opponentPlayerIdx = 1 - player.playerIdx;
            const runningScores = this.runningScores;
            const playerRunningScore = runningScores[player.playerIdx];
            const opponentRunningScore = runningScores[opponentPlayerIdx];
            const outcome =
                !this._isFinished ? Outcome.UNDECIDED :
                playerRunningScore > opponentRunningScore ? Outcome.WIN :
                playerRunningScore === opponentRunningScore ? Outcome.TIE :
                Outcome.LOSE;
            player.notifyScores(
                this.roundScores.map((roundScores) => ({
                    player: roundScores[player.playerIdx],
                    opponent: roundScores[opponentPlayerIdx],
                })),
                {
                    player: playerRunningScore,
                    opponent: opponentRunningScore,
                },
                outcome,
            );
        });
    }

    private notifyUsedAbility(player: Player, ability: Ability, cost: number) {
        this.players.forEach((otherPlayer) => {
            otherPlayer.notifyUsedAbility(player.playerIdx, ability, cost);
        });
        this.notifyRoundOutcome();
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

    private get runningScores(): number[] {
        return this.roundScores.reduce((a, b) => a.map((_, i) => a[i] + b[i]));
    }
}
