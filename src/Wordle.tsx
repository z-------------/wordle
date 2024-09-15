import { useEffect, useState } from "react";
import { MessageKind, parseMessage } from "../common/message.mts";
import { Verdict } from "../common/verdict.mts";
import Word from "./Word";
import { socket } from "./socket";

export default function Wordle() {
  const [guessedWord, setGuessedWord] = useState("");
  const [wordHistory, setWordHistory] = useState([] as { word: string, verdicts: Verdict[] }[]);

  useEffect(() => {
    function handleMessage(data: unknown) {
      const message = parseMessage(data);
      if (message && message.kind === MessageKind.VERDICTS) {
        const [guessedWord, verdicts] = JSON.parse(message.data);
        setWordHistory((prev) => prev.concat({
          word: guessedWord,
          verdicts,
        }));
      }
    }

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  function handleClickEnter() {
    if (guessedWord) {
      socket.send({
        kind: "GUESS",
        data: guessedWord,
      });
    }
  }

  return (
    <>
      <input
        value={guessedWord}
        onChange={(e) => setGuessedWord(e.target.value.toUpperCase())}
      />
      <button
        onClick={handleClickEnter}
      >Enter</button>
      <ol>
        {wordHistory.map(({ word, verdicts }, i) => (
          <li key={i}>
            <Word word={word} verdicts={verdicts} />
          </li>
        ))}
      </ol>
    </>
  );
}
