import { Socket } from "socket.io-client";
import { Scoreboard } from "./Scoreboard";
import useWordle, { Phase } from "./useWordle";
import WordHistory from "./WordHistory";
import WordInput from "./WordInput";
import ActivityLog from "./ActivityLog";

export default function Wordle(props: { socket: Socket }) {
  const {
    sendHello,
    sendBye,
    sendGuess,
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
      <button
        disabled={phase !== Phase.BEFORE_START}
        onClick={sendHello}
      >
        Start
      </button>
      <button
        disabled={phase === Phase.BEFORE_START}
        onClick={sendBye}
      >
        Quit
      </button>
      <ActivityLog activityLog={activityLog} />
      <Scoreboard roundScores={roundsInfo.scores} overallOutcome={roundsInfo.overallOutcome} overallScores={roundsInfo.overallScores} />
      <p>Round {roundsInfo.currentRound} of {roundsInfo.totalRounds}</p>
      <WordInput disabled={phase !== Phase.CAN_GUESS} onEnter={handleEnter} />
      <div style={{"display": "flex"}}>
        <WordHistory guessesLeft={guessesLeft} wordHistory={wordHistory} />
        <WordHistory guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
      </div>
    </>
  );
}
