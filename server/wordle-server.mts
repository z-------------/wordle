import Lobby from "./lobby.mjs";
import Player from "./player.mjs";

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
        if (player.lobby) {
            player.lobby.guess(player, guessedWord);
            if (player.lobby.isFinished) {
                this.deleteLobby(player.lobby);
                player.lobby.end();
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
