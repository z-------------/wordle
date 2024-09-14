import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Message, MessageKind, parseMessage } from "../common/message.mts";
import { Verdict } from "../common/verdict.mts";
import Word from "./Word";

const wsUrl = "ws://localhost:8000";

export default function Wordle() {
  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(wsUrl);
  const [message, setMessage] = useState(undefined as Message | undefined);
  const [guessedWord, setGuessedWord] = useState("");
  const [wordHistory, setWordHistory] = useState([] as { word: string, verdicts: Verdict[] }[]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN && lastMessage?.data) {
      const message = parseMessage(lastMessage.data);
      setMessage(message);
      if (message && message.kind === MessageKind.VERDICTS) {
        const verdicts = JSON.parse(message.data);
        setWordHistory((prev) => prev.concat({
          word: guessedWord,
          verdicts,
        }));
      }
    }
  }, [lastMessage]);

  function handleClickEnter() {
    if (guessedWord) {
      sendJsonMessage({
        kind: "GUESS",
        data: guessedWord,
      });
    }
  }

  return (
    <>
      <div>Connection state = {readyState}</div>
      <div>Last message = {lastMessage?.data}</div>
      <div>Last message kind = {message?.kind}</div>
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
