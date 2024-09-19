import { useState } from "react";
import { WORD_LENGTH } from "../../common/consts.mts";
import { Verdict } from "../../common/types.mts";
import Keyboard from "./Keyboard";
import Word from "./Word";

export interface WordHistoryEntry {
  word: string;
  verdicts: Verdict[];
}

function calculateEffectiveWordHistory(guessesLeft: number, wordHistory: WordHistoryEntry[], guessedWord: string): WordHistoryEntry[] {
  const words = [...wordHistory];
  let emptyCount = guessesLeft;
  const emptyWord = Array<string>(WORD_LENGTH + 1).join(" ");
  const emptyVerdicts = Array<Verdict>(WORD_LENGTH).fill(Verdict.EMPTY);
  if (guessedWord) {
    words.push({
      word: guessedWord.padEnd(WORD_LENGTH, " "),
      verdicts: emptyVerdicts,
    });
    --emptyCount;
  }
  if (emptyCount > 0) {
    words.push(...Array<WordHistoryEntry>(emptyCount).fill({
      word: emptyWord,
      verdicts: emptyVerdicts,
    }));
  }
  return words;
}

function calculateLetterVerdicts(wordHistory: WordHistoryEntry[]): Record<string, Verdict> {
  const letterVerdicts: Record<string, Verdict> = {};
  for (const { word, verdicts } of wordHistory) {
    [...word].forEach((letter, i) => {
      const verdict = verdicts[i];
      const prevVerdict = letterVerdicts[letter];
      if (typeof prevVerdict === "undefined" || verdict < prevVerdict) {
        letterVerdicts[letter] = verdict;
      }
    });
  }
  return letterVerdicts;
}

export default function Board(props: {
  allowInput?: boolean,
  onEnter?: (guessedWord: string) => void,
  guessesLeft: number,
  wordHistory: WordHistoryEntry[],
}) {
  const [guessedWord, setGuessedWord] = useState("");
  const effectiveWordHistory = calculateEffectiveWordHistory(props.guessesLeft, props.wordHistory, guessedWord);
  const letterVerdicts = calculateLetterVerdicts(props.wordHistory);

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
    <div>
      <div>
        {effectiveWordHistory.map(({ word, verdicts }, i) => (
          <Word key={i} word={word} verdicts={verdicts} />
        ))}
      </div>
      {props.onEnter &&
        <Keyboard
          allowEnter={!!props.allowInput}
          onInput={handleInput}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          letterVerdicts={letterVerdicts}
        />
      }
    </div>
  );
}
