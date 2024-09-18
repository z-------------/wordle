import { Verdict } from "../../common/types.mts";
import Letter from "./Letter";
import "./Word.css";

export default function Word(props: { word: string, verdicts: Verdict[] }) {
    return (
        <div className="word">
            {[...props.word].map((letter, i) => (
                <Letter key={i} letter={letter} verdict={props.verdicts[i]} letterIndex={i} />
            ))}
        </div>
    );
}
