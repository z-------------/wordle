import { useState } from "react";
import { Socket } from "socket.io-client";
import { Ability } from "../../common/types.mts";
import useWordle, { Phase } from "../useWordle";
import ActivityLog from "./ActivityLog";
import Board from "./Board";
import { Scoreboard } from "./Scoreboard";
import WelcomeMessage from "./WelcomeMessage";
import "./Wordle.css";
import AbilityButton from "./AbilityButton";

export default function Wordle(props: { socket: Socket }) {
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const {
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
    canUseAbility,
  } = useWordle(props.socket);

  function handleClickJoin() {
    setIsFirstPlay(false);
    sendHello();
  }

  function handleEnter(guessedWord: string) {
    if (guessedWord) {
      sendGuess(guessedWord);
    }
  }

  return (
    <div className="wordle">
      <WelcomeMessage/>
      <h1>Wordle</h1>
      <div className="wordle-lobby-controls">
        <button disabled={phase !== Phase.BEFORE_START} onClick={handleClickJoin}>
          Join lobby
        </button>
        <button disabled={phase === Phase.BEFORE_START} onClick={sendBye}>
          Quit lobby
        </button>
      </div>
      {!isFirstPlay &&
        <>
          <div className="wordle-status">
            <ActivityLog activityLog={activityLog} />
            <Scoreboard roundScores={roundsInfo.roundScores} outcome={roundsInfo.outcome} runningScores={roundsInfo.runningScores} />
          </div>
          <div className="wordle-ability-controls">
            <strong>Abilities</strong>
            <AbilityButton canUse={canUseAbility[Ability.STEAL]} cost={1} name="Steal" onClick={() => sendAbility(Ability.STEAL)}/>
          </div>
          <div className="wordle-boards-container">
            <Board onEnter={handleEnter} allowInput={phase === Phase.CAN_GUESS} guessesLeft={guessesLeft} wordHistory={wordHistory} />
            <Board guessesLeft={opponentGuessesLeft} wordHistory={opponentWordHistory} />
          </div>
        </>
      }
    </div>
  );
}
