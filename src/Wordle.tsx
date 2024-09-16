import { useEffect, useState } from "react";
import { ClientMessage, ClientMessageKind, ServerMessage } from "../common/message.mts";
import { socket } from "./socket";
import WordHistory, { WordHistoryEntry } from "./WordHistory";
import { Scoreboard } from "./Scoreboard";
import { Outcome } from "../common/types.mts";
import WordInput from "./WordInput";

enum Phase {
  BEFORE_START,
  WAITING,
  CAN_GUESS,
}

export default function Wordle() {
  const [phase, setPhase] = useState(Phase.BEFORE_START);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [opponentGuessesLeft, setOpponentGuessesLeft] = useState(0);
  const [wordHistory, setWordHistory] = useState([] as WordHistoryEntry[]);
  const [opponentWordHistory, setOpponentWordHistory] = useState([] as WordHistoryEntry[]);
  const [roundInfo, setRoundInfo] = useState({ currentRound: 0, totalRounds: 0 });
  const [roundScores, setRoundScores] = useState([] as number[][]);
  const [overallOutcome, setOverallOutcome] = useState({ outcome: Outcome.UNDECIDED, scores: [] as number[] });

  useEffect(() => {
    function handleConnect() {
      console.log("connected", socket.id, "recovered?", socket.recovered);
    }

    function handleDisconnect() {
      console.log("disconnected");
    }

    function handleMessage(message: ServerMessage) {
      console.log("handleMessage", message);
      if (message.kind === "VERDICTS") {
        const { isOwn, guessedWord, verdicts } = message;
        const setter = isOwn ? setWordHistory : setOpponentWordHistory;
        setter((prev) => prev.concat({
          word: guessedWord,
          verdicts,
        }));
      } else if (message.kind === "TURN") {
        setPhase(Phase.CAN_GUESS);
      } else if (message.kind === "GUESSES_LEFT") {
        const { isOwn, guessesLeft } = message;
        const setter = isOwn ? setGuessesLeft : setOpponentGuessesLeft;
        setter(guessesLeft);
      } else if (message.kind === "ROUND") {
        const { currentRound, totalRounds } = message;
        setRoundInfo({ currentRound, totalRounds });
        setWordHistory([]);
        setOpponentWordHistory([]);
      } else if (message.kind === "ROUND_OUTCOME") {
        const { scores } = message;
        setRoundScores((prev) => prev.concat([scores]));
      } else if (message.kind === "OVERALL_OUTCOME") {
        const { outcome, scores } = message;
        setOverallOutcome({ outcome, scores });
        setGuessesLeft(0);
        setWordHistory([]);
        setOpponentWordHistory([]);
        setOpponentGuessesLeft(0);
      }
    }
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  function handleClickStart() {
    setPhase(Phase.WAITING);
    const message: ClientMessage = {
      kind: ClientMessageKind.HELLO,
      data: "",
    };
    socket.send(message);
  }

  function handleEnter(guessedWord: string) {
    if (guessedWord) {
      setPhase(Phase.WAITING);
      const message: ClientMessage = {
        kind: ClientMessageKind.GUESS,
        data: guessedWord,
      };
      socket.send(message);
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
      <Scoreboard roundScores={roundScores} overallOutcome={overallOutcome} />
      <p>Round {roundInfo.currentRound} of {roundInfo.totalRounds}</p>
      <WordInput disabled={phase !== Phase.CAN_GUESS} onEnter={handleEnter} />
      <div style={{"display": "flex"}}>
        <WordHistory guessesLeft={guessesLeft} wordHistory={wordHistory} />
        <WordHistory guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
      </div>
    </>
  );
}
