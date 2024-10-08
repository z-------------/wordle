import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Ability, Outcome } from "../../common/types.mts";
import { WordHistoryEntry } from "./../components/Board";
import { ClientMessage, ClientMessageKind, Scores, ServerMessage } from "../../common/message.mts";

export enum Phase {
  BEFORE_START,
  WAITING,
  CAN_GUESS,
}

const initialRoundsInfo = {
  currentRound: 0,
  totalRounds: 0,
  roundScores: [] as Scores[],
  outcome: Outcome.UNDECIDED,
  runningScores: { player: 0, opponent: 0 } as Scores,
};

const initialAbilityUseCount = {
  [Ability.STEAL]: 0,
};

export default function useWordle(socket: Socket) {
  const [phase, setPhase] = useState(Phase.BEFORE_START);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [opponentGuessesLeft, setOpponentGuessesLeft] = useState(0);
  const [wordHistory, setWordHistory] = useState([] as WordHistoryEntry[]);
  const [opponentWordHistory, setOpponentWordHistory] = useState([] as WordHistoryEntry[]);
  const [roundsInfo, setRoundsInfo] = useState(initialRoundsInfo);
  const [activityLog, setActivityLog] = useState([] as string[]);
  const [abilityUseCount, setAbilityUseCount] = useState(initialAbilityUseCount);

  function canUseAbility(ability: Ability) {
    return phase !== Phase.BEFORE_START
      && abilityUseCount[ability] < 1
      && roundsInfo.runningScores.player >= 1
      && opponentGuessesLeft > 0;
  }

  function clearCurrentGameState() {
    setGuessesLeft(0);
    setWordHistory([]);
    setOpponentGuessesLeft(0);
    setOpponentWordHistory([]);
  }

  function addActivity(activity: string) {
    setActivityLog((prev) => [activity].concat(prev));
  }

  useEffect(() => {
    function handleConnect() {
      console.log("connected", socket.id, "recovered?", socket.recovered);
      addActivity("Connected");
    }

    function handleDisconnect() {
      console.log("disconnected");
      addActivity("Disconnected");
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
        addActivity(`Round ${currentRound} of ${totalRounds} started`);
      } else if (message.kind === "SCORES") {
        const { roundScores, runningScores, outcome, word } = message;
        setRoundsInfo((prev) => ({
          ...prev,
          roundScores,
          runningScores,
          outcome,
        }));
        if (word) {
          addActivity(`The answer is "${word}"`);
        }
      } else if (message.kind === "LEAVE") {
        const { reason } = message;
        setPhase(Phase.BEFORE_START);
        setAbilityUseCount(initialAbilityUseCount);
        addActivity(reason);
      } else if (message.kind === "INVALID_GUESS") {
        const { reason } = message;
        addActivity(reason);
      } else if (message.kind === "USED_ABILITY") {
        const { isOwn, ability, cost } = message;
        addActivity(`${isOwn ? "You" : "Opponent"} used ability for cost ${cost}`);
        if (isOwn) {
          setAbilityUseCount((prev) => ({
            ...prev,
            [ability]: (prev[ability] ?? 0) + 1,
          }));
        }
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
    setRoundsInfo(initialRoundsInfo);
    addActivity("Waiting for lobby");
    clearCurrentGameState();
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

  function sendAbility(ability: Ability) {
    const message: ClientMessage = {
      kind: ClientMessageKind.ABILITY,
      data: ability.toString(),
    };
    socket.send(message);
  }

  return {
    sendHello,
    sendBye,
    sendGuess,
    sendAbility,
    phase,
    guessesLeft,
    opponentGuessesLeft,
    wordHistory,
    opponentWordHistory,
    roundsInfo,
    activityLog,
    canUseAbility: {
      [Ability.STEAL]: canUseAbility(Ability.STEAL),
    },
  };
}
