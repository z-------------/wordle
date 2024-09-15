import { useState } from "react";

export default function WordInput(props: { disabled: boolean, onEnter: (word: string) => void }) {
  const [word, setWord] = useState("");

  function handleClick() {
    props.onEnter(word.trim().toUpperCase());
    setWord("");
  }

  return (
    <>
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
      />
      <button
        disabled={props.disabled}
        onClick={handleClick}
      >
        Enter
      </button>
    </>
  );
}
