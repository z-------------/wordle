import { Verdict } from "../common/types.mts";
import "./Letter.css";

export default function Letter(props: { letter: string, verdict: Verdict }) {
    return (
        <div className={`letter letter-${props.verdict}`}>{props.letter}</div>
    );
}
