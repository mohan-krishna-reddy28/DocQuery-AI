export default function Notification({ notification, duration = 3000 }) {
  if (!notification) return null;

  return (
    <div className={`toast-msg`}>
      <div className="toast-text ">{notification.message}</div>

      {/* Progress Bar */}
      <div
        className={`toast-progress ${notification.type}`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}
