import { MouseEvent, useEffect } from "react";
import { Verdict } from "../common/types.mts";
import "./Keyboard.css";

const rows = [
  "QWERTYUIOP",
  "ASDFGHJKL",
  "ZXCVBNM",
].map((s) => s.split(""));

export default function Keyboard(props: {
  onEnter: () => void,
  onInput: (letter: string) => void,
  onBackspace: () => void,
  allowEnter: boolean,
  letterVerdicts: Record<string, Verdict>,
}) {
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (props.allowEnter && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "Enter") {
          props.onEnter();
        } else if (/^[A-Za-z]$/.test(e.key)) {
          props.onInput(e.key.toUpperCase());
        } else if (e.key === "Backspace") {
          props.onBackspace();
        }
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [props.onEnter, props.onInput, props.onBackspace, props.allowEnter]);

  function handleClickLetter(e: MouseEvent<HTMLElement>) {
    const { letter } = (e.target as HTMLElement).dataset;
    if (letter) {
      props.onInput(letter);
    }
  }

  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div key={i} className="keyboard-row">
          {i === rows.length - 1 &&
            <button disabled={!props.allowEnter} className="keyboard-key" onClick={props.onEnter}>Enter</button>
          }
          {row.map((letter) => (
            <button
              key={letter}
              className={`keyboard-key keyboard-key-${props.letterVerdicts[letter] ?? Verdict.EMPTY}`}
              disabled={!props.allowEnter}
              data-letter={letter}
              onClick={handleClickLetter}
            >
              {letter}
            </button>
          ))}
          {i === rows.length - 1 &&
            <button disabled={!props.allowEnter} className="keyboard-key" onClick={props.onBackspace}>⌫</button>
          }
        </div>
      ))}
    </div>
  );
}
