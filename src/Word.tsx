import { Verdict } from "../common/verdict.mts";
import Letter from "./Letter";

export default function Word(props: { word: string, verdicts: Verdict[] }) {
    return (
        <div>
            {[...props.word].map((letter, i) => (
                <Letter key={i} letter={letter} verdict={props.verdicts[i]} />
            ))}
        </div>
    );
}
