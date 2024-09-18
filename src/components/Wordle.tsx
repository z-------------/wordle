import { Socket } from "socket.io-client";
import { Ability } from "../../common/types.mts";
import ActivityLog from "./ActivityLog";
import Board from "./Board";
import { Scoreboard } from "./Scoreboard";
import useWordle, { Phase } from "../useWordle";

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
    <>
      <button disabled={phase !== Phase.BEFORE_START} onClick={sendHello}>
        Start
      </button>
      <button disabled={phase === Phase.BEFORE_START} onClick={sendBye}>
        Quit
      </button>
      <ActivityLog activityLog={activityLog} />
      <Scoreboard roundScores={roundsInfo.roundScores} outcome={roundsInfo.outcome} runningScores={roundsInfo.runningScores} />
      <p>Round {roundsInfo.currentRound} of {roundsInfo.totalRounds}</p>
      <button onClick={() => sendAbility(Ability.STEAL)}>
        Use steal
      </button>
      <div style={{"display": "flex"}}>
        <Board onEnter={handleEnter} allowInput={phase === Phase.CAN_GUESS} guessesLeft={guessesLeft} wordHistory={wordHistory} />
        <Board guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
      </div>
    </>
  );
}
