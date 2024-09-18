import { Socket } from "socket.io-client";
import { Scoreboard } from "./Scoreboard";
import useWordle, { Phase } from "./useWordle";
import WordHistory from "./WordHistory";
import WordInput from "./WordInput";
import ActivityLog from "./ActivityLog";
import { Ability } from "../common/types.mts";

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
      <WordInput disabled={phase !== Phase.CAN_GUESS} onEnter={handleEnter} />
      <div style={{"display": "flex"}}>
        <WordHistory guessesLeft={guessesLeft} wordHistory={wordHistory} />
        <WordHistory guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
      </div>
    </>
  );
}
