import { CSSProperties } from "react";
import { Verdict } from "../../common/types.mts";
import "./Letter.css";

export default function Letter(props: { letter: string, verdict: Verdict, letterIndex: number }) {
  return (
    <div
      className={`letter letter-${props.verdict} ${props.letter.trim() ? "letter-present" : ""}`}
      data-letter={props.letter}
      style={{ "--letter-index": props.letterIndex } as CSSProperties}
    ></div>
  );
}
