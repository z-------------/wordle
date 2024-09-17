import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Outcome } from "../common/types.mts";
import { WordHistoryEntry } from "./WordHistory";
import { ClientMessage, ClientMessageKind, ServerMessage } from "../common/message.mts";

export enum Phase {
  BEFORE_START,
  WAITING,
  CAN_GUESS,
}

export default function useWordle(socket: Socket) {
  const [phase, setPhase] = useState(Phase.BEFORE_START);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [opponentGuessesLeft, setOpponentGuessesLeft] = useState(0);
  const [wordHistory, setWordHistory] = useState([] as WordHistoryEntry[]);
  const [opponentWordHistory, setOpponentWordHistory] = useState([] as WordHistoryEntry[]);
  const [roundsInfo, setRoundsInfo] = useState({
    currentRound: 0,
    totalRounds: 0,
    scores: [] as number[][],
    overallOutcome: Outcome.UNDECIDED,
    overallScores: [] as number[],
  });

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
      } else if (message.kind === "GUESSES_LEFT") {
        const { isOwn, guessesLeft, canGuess } = message;
        if (isOwn) {
          setGuessesLeft(guessesLeft);
          if (canGuess) {
            setPhase(Phase.CAN_GUESS);
          }
        } else {
          setOpponentGuessesLeft(guessesLeft);
        }
      } else if (message.kind === "ROUND") {
        const { currentRound, totalRounds } = message;
        setRoundsInfo((prev) => ({
          ...prev,
          currentRound,
          totalRounds,
        }));
        setWordHistory([]);
        setOpponentWordHistory([]);
      } else if (message.kind === "ROUND_OUTCOME") {
        const { scores } = message;
        setRoundsInfo((prev) => ({
          ...prev,
          scores: prev.scores.concat([scores]),
        }));
      } else if (message.kind === "OVERALL_OUTCOME") {
        const { outcome, scores } = message;
        setRoundsInfo((prev) => ({
          ...prev,
          overallOutcome: outcome,
          overallScores: scores,
        }));
        setGuessesLeft(0);
        setWordHistory([]);
        setOpponentWordHistory([]);
        setOpponentGuessesLeft(0);
      } else if (message.kind === "LEAVE") {
        setPhase(Phase.BEFORE_START);
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

  function sendHello() {
    setPhase(Phase.WAITING);
    const message: ClientMessage = {
      kind: ClientMessageKind.HELLO,
      data: "",
    };
    socket.send(message);
  }

  function sendBye() {
    const message: ClientMessage = {
      kind: ClientMessageKind.BYE,
      data: "",
    };
    socket.send(message);
  }

  function sendGuess(guessedWord: string) {
    setPhase(Phase.WAITING);
    const message: ClientMessage = {
      kind: ClientMessageKind.GUESS,
      data: guessedWord,
    };
    socket.send(message);
  }

  return {
    sendHello,
    sendBye,
    sendGuess,
    phase,
    guessesLeft,
    opponentGuessesLeft,
    wordHistory,
    opponentWordHistory,
    roundsInfo,
  };
}
