# Wordle

## Running and testing

1. Have a recent Node.js and npm installed.
2. Run `npm install` to install dependencies and devDependencies.
3. Run `npm run start -- --wordsList <filename>` to start the server.
    * `filename` should be a file containing the list of words separated by newlines.
    * Add `--help` for additional options.
4. Run `npm run dev` to start the HTTP server for the client.
5. Visit `http://localhost:5173/` to play the game.

Run unit tests by running `npm run test`.

### Notes

* Tested on environment:
    * Windows 11
    * Server side:
        * openSUSE Tumbleweed on WSL2
        * Node.js 22
    * Client side:
        * Firefox 130
* It is possible that the ports used by the game are not available on your system. In this case, change it in the code. The server and client must agree on the websocket port.

## Features

### Multiplayer

* Players join lobbies of 2 players each.
* There can be multiple concurrent lobbies.
* Each match consists of multiple rounds (configurable).
* Each round consists of multiple guess attempts (configurable).
* At each round, each player receives a score. The fewer guess attempts needed to correctly guess the word, the more score the player receives. Failure to guess the word before running out of attempts results in 0 score for that round.
* During gameplay, players can choose to use certain abilities:
  * "Steal": Steal one guess attempt from the opponent.
  * "Hint": Reveal one letter (not implemented).
  * "Switch": Switch boards with the opponent (not implemented).
* Abilities cost score to use and may have usage restrictions. For example, the "Steal" ability can only be used once per player per match.
* After all rounds have finished, each player is assigned an overall score based on the round scores. If both players have the same overall score, it is a tie. Otherwise, the player with the higher overall score wins and the other loses.
* The match ends and the player may choose to join a new lobby.

#### Design considerations

* Implemented in TypeScript to allow easy sharing of code and types between server and client side.
* Uses React on the client side because it's easier and more maintainable than trying to manage UI state with plain JavaScript. Also because I have some experience using it.
* Uses Socket.IO on the server side to allow real-time interaction between players.
* Some connection state recovery is implemented to handle short disconnections in the websocket. However, in order to limit complexity, pending messages are stored in memory only and players who are disconnected for extended periods of time are treated as lost.
* In order to keep the server's lobby management simple, players cannot choose which lobby to join, and are assigned one by the server.
* In order to provide for the aforementioned "abilities" feature, there are multiple rounds so that players can accumulate score to use them.
* The system is designed under the assumption that the client trusts the server, but the server doesn't trust the client. This is so that the client code can be kept simple and focused on displaying the game state as reported by the server, and leave most of the input validation and game logic on the server side.
* On the server side, the code is layered so that each part focuses on one concern. For example, the Game class implements the core Wordle logic and scoring for one player, the Lobby class implements round management and abilities, the WordleServer class implements lobby assignment, and the top-level websocket server implements connection state recovery and mapping from websocket messages to game actions.

### Enhancements

#### Implemented

* The "abilities" feature mentioned above.
    * Adds variety to the base game and increases interactivity between players.
* Display player's current high score.
    * Uses localStorage.
    * Motivates the player to keep playing and beat their high score.
* Animations in the UI.
    * Subtle grow animation as each letter is typed.
    * Card flipping animation as colors are revealed.
    * Implemented using CSS animations.
    * Makes the game more visually interesting.

#### Not implemented

* More abilities, such as those mentioned above.
* Reveal opponent's guesses at the end of each round.
    * Adds another dimension to the game by allowing players to compare each other's strategies.

## Possible future work

* Simplify the server messages: instead of sending messages for every possible game event, simply have the server report the current game state (including guess history, scores, etc.) to the client. This would make both the client and server logic simpler and more maintainable, as well as make unit testing easier.
* Increase unit test coverage.
* Serve client files from the Express server instead of `npm run dev`.
