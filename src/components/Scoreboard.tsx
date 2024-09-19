import { Scores } from "../../common/message.mts";
import { Outcome } from "../../common/types.mts";

export default function Scoreboard(props: {
  roundScores: Scores[],
  runningScores: Scores,
  outcome: Outcome,
}) {
  function formatOutcome(outcome: Outcome): string {
    return outcome === Outcome.WIN ? "You win" :
      outcome === Outcome.TIE ? "Tie" :
      outcome === Outcome.LOSE ? "You lose" :
      "";
  }

  return (
    <div>
      <table>
        <tbody>
          {props.roundScores.map(({ player, opponent }, i) => (
            <tr key={i}>
              <th>Round {i + 1}</th>
              <td>{player}</td>
              <td>{opponent}</td>
            </tr>
          ))}
          <tr key="overall">
            <th>Overall</th>
            <td>{props.runningScores.player}</td>
            <td>{props.runningScores.opponent}</td>
          </tr>
        </tbody>
      </table>
      {props.outcome !== Outcome.UNDECIDED && <strong>{formatOutcome(props.outcome)}</strong>}
    </div>
  );
}
