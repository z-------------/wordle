import { useEffect, useState } from "react";
import { createMessage, MessageKind, parseMessage } from "../common/message.mts";
import { Verdict } from "../common/verdict.mts";
import Word from "./Word";
import { socket } from "./socket";

enum Phase {
  BEFORE_START,
  WAITING,
  CAN_GUESS,
}

export default function Wordle() {
  const [phase, setPhase] = useState(Phase.BEFORE_START);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [guessedWord, setGuessedWord] = useState("");
  const [wordHistory, setWordHistory] = useState([] as { word: string, verdicts: Verdict[] }[]);

  useEffect(() => {
    function handleMessage(data: unknown) {
      const message = parseMessage(data);
      if (message) {
        if (message.kind === MessageKind.VERDICTS) {
          const [guessedWord, verdicts] = JSON.parse(message.data);
          setWordHistory((prev) => prev.concat({
            word: guessedWord,
            verdicts,
          }));
        } else if (message.kind === MessageKind.TURN) {
          setGuessesLeft(Number(message.data));
          setPhase(Phase.CAN_GUESS);
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
      <ol>
        {wordHistory.map(({ word, verdicts }, i) => (
          <li key={i}>
            <Word word={word} verdicts={verdicts} />
          </li>
        ))}
      </ol>
      <div>{guessesLeft} guesses left</div>
    </>
  );
}
