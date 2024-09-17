import { Scoreboard } from "./Scoreboard";
import { socket } from "./socket";
import useWordle, { Phase } from "./useWordle";
import WordHistory from "./WordHistory";
import WordInput from "./WordInput";

export default function Wordle() {
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
  } = useWordle(socket);

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
