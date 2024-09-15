import { Outcome } from "../common/types.mts";

export function Scoreboard(props: {
  roundScores: number[][],
  overallOutcome: { outcome: Outcome, scores: number[] },
}) {
  function formatOutcome(outcome: Outcome): string {
    return outcome === Outcome.WIN ? "You win" :
      outcome === Outcome.TIE ? "Tie" :
      outcome === Outcome.LOSE ? "You lose" :
      "";
  }

  return (
    <>
      <table>
        <tbody>
          {props.roundScores.map(([score, opponentScore], i) => (
            <tr key={i}>
              <th>Round {i + 1}</th>
              <td>{score}</td>
              <td>{opponentScore}</td>
            </tr>
          ))}
          {props.overallOutcome.scores.length > 0 ? (
            <tr key="overall">
              <th>Overall</th>
              {props.overallOutcome.scores.map((score, i) => (
                <td key={i}>{score}</td>
              ))}
            </tr>
          ) : []}
        </tbody>
      </table>
      {props.overallOutcome.outcome === Outcome.UNDECIDED ? null : <strong>{formatOutcome(props.overallOutcome.outcome)}</strong>}
    </>
  );
}
