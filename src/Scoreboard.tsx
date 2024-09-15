export function Scoreboard(props: { roundScores: number[][], overallScores: number[] }) {
  return (
    <table>
      <tbody>
        {props.roundScores.map(([score, opponentScore], i) => (
          <tr key={i}>
            <th>Round {i + 1}</th>
            <td>{score}</td>
            <td>{opponentScore}</td>
          </tr>
        ))}
        {props.overallScores.length > 0 ? (
          <tr key="overall">
            <th>Overall</th>
            <td>{props.overallScores[0]}</td>
            <td>{props.overallScores[1]}</td>
          </tr>
        ) : []}
      </tbody>
    </table>
  );
}
