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
  const [roundInfo, setRoundInfo] = useState({ currentRound: 0, totalRounds: 0 });
  const [playerIdx, setPlayerIdx] = useState(-1);

  useEffect(() => {
    function handleMessage(data: unknown) {
      const message = parseMessage(data);
      if (message) {
        if (message.kind === MessageKind.VERDICTS) {
          const [pidx, guessedWord, verdicts] = JSON.parse(message.data);
          const setter = pidx === playerIdx ? setWordHistory : setOpponentWordHistory;
          setter((prev) => prev.concat({
            word: guessedWord,
            verdicts,
          }));
        } else if (message.kind === MessageKind.TURN) {
          setPhase(Phase.CAN_GUESS);
        } else if (message.kind === MessageKind.GUESSES_LEFT) {
          const [pidx, guessesLeft] = JSON.parse(message.data);
          const setter = pidx === playerIdx ? setGuessesLeft : setOpponentGuessesLeft;
          setter(guessesLeft);
        } else if (message.kind === MessageKind.ROUND) {
          const [currentRound, totalRounds] = JSON.parse(message.data);
          setRoundInfo({ currentRound, totalRounds });
        } else if (message.kind === MessageKind.PLAYER_IDX) {
          setPlayerIdx(Number(message.data));
        }
      }
    }
    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [playerIdx]);

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
      <p>Round {roundInfo.currentRound} out of {roundInfo.totalRounds}</p>
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
