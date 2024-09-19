import { ABILITY_COSTS } from "../common/consts.mjs";
import { Ability, Outcome, Verdict } from "../common/types.mjs";
import { State } from "./game.mjs";
import Player from "./player.mjs";
import Round from "./round.mjs";

const PLAYERS_COUNT = 2; // must be 2

function isValidPlayer(player: Player): boolean {
    return player && player.playerIdx >= 0 && player.playerIdx < PLAYERS_COUNT;
}

function afterDelay(f: () => void, ms: number) {
    if (ms <= 0) {
        f();
    } else {
        setTimeout(f, ms);
    }
}

export default class Lobby {
    private _isFinished = false;
    private players = [] as Player[];
    private readonly rounds = [] as Round[];
    private readonly roundScores = [] as number[][];
    private readonly abilityUseCounts: Record<Ability, number>[] = Array(PLAYERS_COUNT).fill(undefined).map(() => ({
        [Ability.STEAL]: 0,
    }));
    private readonly isTest = process.env["TEST"] === "true";

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

    /**
     * Add a player to the lobby. Starts a round if both players are present.
     */
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

    /**
     * End the lobby.
     * @param playerWhoLeft The player whose leaving triggered the lobby ending, if any
     */
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

    /**
     * Make a guess and broadcast the results, advancing to the next round if needed
     */
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

    /**
     * Use an ability and broadcast the results
     */
    useAbility(player: Player, ability: Ability) {
        const round = this.currentRound;
        if (isValidPlayer(player) && round) {
            const runningScore = this.runningScores[player.playerIdx];
            const cost = ABILITY_COSTS[ability];
            if (runningScore >= cost) {
                let used = false;
                if (ability === Ability.STEAL) {
                    used = this.useAbilitySteal(player, round);
                }
                if (used) {
                    // broadcast new guesses left, etc.
                    this.afterMove(round);
                    // subtract cost
                    this.roundScores[this.roundScores.length - 1][player.playerIdx] -= cost;
                    // update use count
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
            this.notifyScores(round.word);
            if (!this._isFinished) {
                this.startNewRound();
            }
        }
    }

    private startNewRound() {
        // create new round
        const round = new Round(this.maxGuesses, PLAYERS_COUNT, this.wordList, this.word);
        this.rounds.push(round);
        this.roundScores.push(Array<number>(PLAYERS_COUNT).fill(0));

        // notify players of new round after short delay
        const delay = this.rounds.length <= 1 || this.isTest ? 0 : 1000;
        this.players.forEach((player, playerIdx) => {
            const game = round.games[playerIdx];
            afterDelay(() => {
                player.notifyRound(this.rounds.length, this.roundsCount);
                this.players.forEach((otherPlayer) => {
                    otherPlayer.notifyGuessesLeft(playerIdx, game.guessesLeft, true);
                });
            }, delay);
        });
    }

    private notifyVerdicts(player: Player, guessedWord: string, verdicts: Verdict[]) {
        // broadcast verdicts to both players, censoring the word for the opponent
        player.notifyVerdicts(player.playerIdx, guessedWord, verdicts);
        const emptyWord = Array(guessedWord.length + 1).join(" ");
        this.players.forEach((otherPlayer) => {
            if (otherPlayer !== player) {
                otherPlayer.notifyVerdicts(player.playerIdx, emptyWord, verdicts);
            }
        });
    }

    private notifyScores(word?: string) {
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
                word,
            );
        });
        if (this.isFinished) {
            this.end();
        }
    }

    private notifyUsedAbility(player: Player, ability: Ability, cost: number) {
        this.players.forEach((otherPlayer) => {
            otherPlayer.notifyUsedAbility(player.playerIdx, ability, cost);
        });
        this.notifyScores();
    }

    private get currentRound(): Round | undefined {
        // get the current non-finished round, if any
        if (this.rounds.length > 0) {
            const round = this.rounds[this.rounds.length - 1];
            if (!round.isFinished) {
                return round;
            }
        }
        return undefined;
    }

    private get runningScores(): number[] {
        // calculate running scores from round scores
        return this.roundScores.reduce((a, b) => a.map((_, i) => a[i] + b[i]));
    }
}
