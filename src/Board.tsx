import { useState } from "react";
import { WORD_LENGTH } from "../common/consts.mts";
import { Verdict } from "../common/types.mts";
import Keyboard from "./Keyboard";
import Word from "./Word";

export interface WordHistoryEntry {
  word: string;
  verdicts: Verdict[];
}

export default function Board(props: {
  allowInput?: boolean,
  onEnter?: (guessedWord: string) => void,
  guessesLeft: number,
  wordHistory: WordHistoryEntry[],
}) {
  const [guessedWord, setGuessedWord] = useState("");

  const words = [...props.wordHistory];
  let emptyCount = props.guessesLeft;
  const emptyWord = Array<string>(WORD_LENGTH + 1).join(" ");
  const emptyVerdicts = Array<Verdict>(WORD_LENGTH).fill(Verdict.EMPTY);
  if (guessedWord) {
    words.push({
      word: guessedWord.padEnd(WORD_LENGTH, " "),
      verdicts: emptyVerdicts,
    });
    --emptyCount;
  }
  words.push(...Array<WordHistoryEntry>(emptyCount).fill({
    word: emptyWord,
    verdicts: emptyVerdicts,
  }));

  function handleEnter() {
    if (props.onEnter) {
      props.onEnter(guessedWord);
    }
    setGuessedWord("");
  }

  function handleInput(letter: string) {
    setGuessedWord((prev) => prev.length < WORD_LENGTH ? prev + letter : prev);
  }

  function handleBackspace() {
    setGuessedWord((prev) => prev.substring(0, prev.length - 1));
  }

  return (
    <>
      <div>
        {words.map(({ word, verdicts }, i) => (
          <Word key={i} word={word} verdicts={verdicts} />
        ))}
      </div>
      {props.onEnter &&
        <Keyboard
          allowEnter={!!props.allowInput}
          onInput={handleInput}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          letterVerdicts={{}}
        />
      }
    </>
  );
}
