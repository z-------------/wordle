import { useState } from "react";
import { Verdict } from "../../common/types.mts";
import Letter from "./Letter";
import "./WelcomeMessage.css";

export default function WelcomeMessage() {
  const [visible, setVisible] = useState(true);

  function handleClickPlay() {
    setVisible(false);
  }

  return (
    <>
      {visible &&
        <div className="welcome-container">
          <div className="welcome">
            <p><strong>Welcome to Wordle.</strong></p>
            <ul>
              <li>Upon joining a lobby, you will be randomly assigned an opponent.</li>
              <li>In each round, your objective to guess the word within the given number of attempts.</li>
              <li>Green means the letter is in the correct position: <Letter letter="A" verdict={Verdict.HIT} letterIndex={0} /></li>
              <li>Yellow means the letter is in the word but in the wrong position: <Letter letter="B" verdict={Verdict.PRESENT} letterIndex={0} /></li>
              <li>Grey means the letter is not in the word: <Letter letter="C" verdict={Verdict.MISS} letterIndex={0} /></li>
              <li>The fewer attempts you use to guess the word correctly, the more score you earn.</li>
              <li>Abilities, which cost score, may be used to gain an advantage over your opponent.</li>
              <li>The player who has the higher score at the end of all rounds wins.</li>
            </ul>
            <button onClick={handleClickPlay}>Play</button>
          </div>
        </div>
      }
    </>
  );
}
