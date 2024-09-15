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
      </ol>
      <div>{props.guessesLeft} guesses left</div>
    </>
  );
}
