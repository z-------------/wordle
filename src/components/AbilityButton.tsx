export default function AbilityButton(props: {
  canUse: boolean,
  cost: number,
  name: string,
  onClick: () => void,
}) {
  return (
    <button disabled={!props.canUse} onClick={props.onClick}>
      {props.name} (cost {props.cost})
    </button>
  );
}
