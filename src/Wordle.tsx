import { useEffect, useState } from "react";
import { createMessage, MessageKind, parseMessage } from "../common/message.mts";
import { socket } from "./socket";
import WordHistory, { WordHistoryEntry } from "./WordHistory";
import { Scoreboard } from "./Scoreboard";
import { Outcome } from "../common/types.mts";

enum Phase {
  BEFORE_START,
  WAITING,
  CAN_GUESS,
}

export default function Wordle() {
  const [phase, setPhase] = useState(Phase.BEFORE_START);
  const [guessedWord, setGuessedWord] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [opponentGuessesLeft, setOpponentGuessesLeft] = useState(0);
  const [wordHistory, setWordHistory] = useState([] as WordHistoryEntry[]);
  const [opponentWordHistory, setOpponentWordHistory] = useState([] as WordHistoryEntry[]);
  const [roundInfo, setRoundInfo] = useState({ currentRound: 0, totalRounds: 0 });
  const [roundScores, setRoundScores] = useState([] as number[][]);
  const [overallScores, setOverallScores] = useState([] as number[]);
  const [outcome, setOutcome] = useState(Outcome.UNDECIDED);

  useEffect(() => {
    function handleMessage(data: unknown) {
      const message = parseMessage(data);
      if (message?.kind === MessageKind.VERDICTS) {
        const [isOurs, guessedWord, verdicts] = JSON.parse(message.data);
        const setter = isOurs ? setWordHistory : setOpponentWordHistory;
        setter((prev) => prev.concat({
          word: guessedWord,
          verdicts,
        }));
      } else if (message?.kind === MessageKind.TURN) {
        setPhase(Phase.CAN_GUESS);
        setGuessedWord("");
      } else if (message?.kind === MessageKind.OUTCOME) {
        setGuessedWord("");
      } else if (message?.kind === MessageKind.GUESSES_LEFT) {
        const [isOurs, guessesLeft] = JSON.parse(message.data);
        const setter = isOurs ? setGuessesLeft : setOpponentGuessesLeft;
        setter(guessesLeft);
      } else if (message?.kind === MessageKind.ROUND) {
        const [currentRound, totalRounds] = JSON.parse(message.data);
        setRoundInfo({ currentRound, totalRounds });
        setWordHistory([]);
        setOpponentWordHistory([]);
      } else if (message?.kind === MessageKind.ROUND_OUTCOME) {
        const scores: number[] = JSON.parse(message.data);
        setRoundScores((prev) => prev.concat([scores]));
      } else if (message?.kind === MessageKind.OVERALL_OUTCOME) {
        const [outcome, scores]: [Outcome, number[]] = JSON.parse(message.data);
        setOverallScores(scores);
        setOutcome(outcome);
        setGuessesLeft(0);
        setWordHistory([]);
        setOpponentWordHistory([]);
        setOpponentGuessesLeft(0);
      }
    }
    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  function handleClickStart() {
    setPhase(Phase.WAITING);
    socket.send(createMessage(MessageKind.HELLO, ""));
  }

  function handleClickEnter() {
    if (guessedWord) {
      setPhase(Phase.WAITING);
      socket.send(createMessage(MessageKind.GUESS, guessedWord));
    }
  }

  return (
    <>
      <button
        disabled={phase !== Phase.BEFORE_START}
        onClick={handleClickStart}
      >
        Start
      </button>
      <Scoreboard roundScores={roundScores} overallScores={overallScores} outcome={outcome} />
      <p>Round {roundInfo.currentRound} of {roundInfo.totalRounds}</p>
      <input
        value={guessedWord}
        onChange={(e) => setGuessedWord(e.target.value.toUpperCase())}
      />
      <button
        disabled={phase !== Phase.CAN_GUESS}
        onClick={handleClickEnter}
      >
        Enter
      </button>
      <div style={{"display": "flex"}}>
        <WordHistory guessesLeft={guessesLeft} wordHistory={wordHistory} />
        <WordHistory guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
      </div>
    </>
  );
}
