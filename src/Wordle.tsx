import { useEffect, useState } from "react";
import { createMessage, MessageKind, parseMessage } from "../common/message.mts";
import { socket } from "./socket";
import WordHistory, { WordHistoryEntry } from "./WordHistory";

enum Phase {
  BEFORE_START,
  WAITING,
  CAN_GUESS,
}

export default function Wordle() {
  const [phase, setPhase] = useState(Phase.BEFORE_START);
  const [guessedWord, setGuessedWord] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [wordHistory, setWordHistory] = useState([] as WordHistoryEntry[]);
  const [opponentGuessesLeft, setOpponentGuessesLeft] = useState(0);
  const [opponentWordHistory, setOpponentWordHistory] = useState([] as WordHistoryEntry[]);

  useEffect(() => {
    function handleMessage(data: unknown) {
      const message = parseMessage(data);
      if (message) {
        if (message.kind === MessageKind.VERDICTS || message.kind === MessageKind.OPPONENT_VERDICTS) {
          const [guessedWord, verdicts] = JSON.parse(message.data);
          const setter = message.kind === MessageKind.VERDICTS ? setWordHistory : setOpponentWordHistory;
          setter((prev) => prev.concat({
            word: guessedWord,
            verdicts,
          }));
        } else if (message.kind === MessageKind.TURN) {
          setGuessesLeft(Number(message.data));
          setPhase(Phase.CAN_GUESS);
        } else if (message.kind === MessageKind.OPPONENT_TURN) {
          setOpponentGuessesLeft(Number(message.data));
        }
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
