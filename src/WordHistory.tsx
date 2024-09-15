import { WORD_LENGTH } from "../common/consts.mts";
import { Verdict } from "../common/types.mts";
import Word from "./Word";

export interface WordHistoryEntry {
  word: string;
  verdicts: Verdict[];
}

export default function WordHistory(props: { guessesLeft: number, wordHistory: WordHistoryEntry[] }) {
  return (
    <div>
      {props.wordHistory.map(({ word, verdicts }, i) => (
        <Word key={i} word={word} verdicts={verdicts} />
      ))}
      {[...Array(props.guessesLeft)].map((_n, i) => (
        <Word
          key={props.wordHistory.length + i}
          word={Array(WORD_LENGTH + 1).join(" ")}
          verdicts={Array(WORD_LENGTH).fill(Verdict.EMPTY)}
        />
      ))}
    </div>
  );
}
