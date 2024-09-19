import { Ability } from "../common/types.mjs";
import Lobby from "./lobby.mjs";
import Player from "./player.mjs";

/**
 * Manages lobbies, assigning players to lobbies, and proxying game commands to the correct lobby.
 */
export default class WordleServer {
    private lobbies: Lobby[] = [];

    constructor(
        private readonly maxGuesses: number,
        private readonly wordList: string[],
        private readonly roundsCount: number,
    ) {}

    addPlayer(player: Player) {
        if (!player.lobby) {
            player.notifyLeave("No current lobby");
        }
    }

    joinLobby(player: Player) {
        if (!player.lobby) {
            this.findOrCreateLobby(player);
        }
    }

    leaveLobby(player: Player) {
        if (player.lobby) {
            this.deleteLobby(player.lobby);
            player.lobby.end(player);
        }
    }

    guess(player: Player, guessedWord: string) {
        console.log("received guess", guessedWord);
        const lobby = player.lobby;
        if (lobby) {
            lobby.guess(player, guessedWord);
            if (lobby.isFinished) {
                this.deleteLobby(lobby);
            }
        }
    }

    useAbility(player: Player, ability: Ability) {
        const lobby = player.lobby;
        if (lobby) {
            lobby.useAbility(player, ability);
            if (lobby.isFinished) {
                this.deleteLobby(lobby);
            }
        }
    }

    private findOrCreateLobby(player: Player): Lobby {
        let lobby: Lobby | undefined;
        console.log(this.lobbies.length, "existing lobbies");
        for (const existingLobby of this.lobbies) {
            if (!existingLobby.isFull) {
                console.log("using existing lobby");
                lobby = existingLobby;
                break;
            }
        }
        if (!lobby) {
            lobby = new Lobby(this.maxGuesses, this.wordList, this.roundsCount);
            this.lobbies.push(lobby);
            console.log("created new lobby");
        }
        lobby.addPlayer(player);
        return lobby;
    }

    private deleteLobby(lobby: Lobby) {
        this.lobbies = this.lobbies.filter((l) => l !== lobby);
        console.log("deleted a lobby,", this.lobbies.length, "remaining lobbies");
    }
}
