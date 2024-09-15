import { WORD_LENGTH } from "../common/consts.mts";
import { Verdict } from "../common/verdict.mts";
import Word from "./Word";

export interface WordHistoryEntry {
  word: string;
  verdicts: Verdict[];
}

export default function WordHistory(props: { guessesLeft: number, wordHistory: WordHistoryEntry[] }) {
  return (
    <>
      <ol>
        {props.wordHistory.map(({ word, verdicts }, i) => (
          <li key={i}>
            <Word word={word} verdicts={verdicts} />
          </li>
        ))}
        {[...Array(props.guessesLeft)].map((_n, i) => (
          <li key={props.wordHistory.length + i}>
            <Word word={Array(WORD_LENGTH + 1).join(" ")} verdicts={Array(WORD_LENGTH).fill(Verdict.EMPTY)} />
          </li>
        ))}
      </ol>
      <div>{props.guessesLeft} guesses left</div>
    </>
  );
}
