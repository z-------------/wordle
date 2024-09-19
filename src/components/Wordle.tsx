import { Socket } from "socket.io-client";
import { Ability } from "../../common/types.mts";
import ActivityLog from "./ActivityLog";
import Board from "./Board";
import { Scoreboard } from "./Scoreboard";
import useWordle, { Phase } from "../useWordle";
import "./Wordle.css";

export default function Wordle(props: { socket: Socket }) {
  const {
    sendHello,
    sendBye,
    sendGuess,
    sendAbility,
    phase,
    guessesLeft,
    opponentGuessesLeft,
    wordHistory,
    opponentWordHistory,
    roundsInfo,
    activityLog,
  } = useWordle(props.socket);

  function handleEnter(guessedWord: string) {
    if (guessedWord) {
      sendGuess(guessedWord);
    }
  }

  return (
    <div className="wordle">
      <h1>Wordle</h1>
      <div className="wordle-lobby-controls">
        <button disabled={phase !== Phase.BEFORE_START} onClick={sendHello}>
          Join lobby
        </button>
        <button disabled={phase === Phase.BEFORE_START} onClick={sendBye}>
          Quit lobby
        </button>
      </div>
      <div className="wordle-status">
        <ActivityLog activityLog={activityLog} />
        <Scoreboard roundScores={roundsInfo.roundScores} outcome={roundsInfo.outcome} runningScores={roundsInfo.runningScores} />
      </div>
      <div className="wordle-ability-controls">
        <strong>Use ability</strong>
        <button onClick={() => sendAbility(Ability.STEAL)}>
          Steal (cost 1)
        </button>
      </div>
      <div style={{"display": "flex"}}>
        <Board onEnter={handleEnter} allowInput={phase === Phase.CAN_GUESS} guessesLeft={guessesLeft} wordHistory={wordHistory} />
        <Board guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
      </div>
    </div>
  );
}
