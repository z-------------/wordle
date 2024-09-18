import "./ActivityLog.css";

export default function ActivityLog(props: { activityLog: string[] }) {
  return (
    <div className="activity-log">
      {props.activityLog.map((activity, i) => (
        <div key={i}>{activity}</div>
      ))}
    </div>
  );
}
