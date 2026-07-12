import React from "react";

const PRIORITY_COLOR = {
  Low: "var(--success)",
  Medium: "var(--warning)",
  High: "#ff9f5b",
  Urgent: "var(--danger)",
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="bubble-row bubble-row--user">
        <div className="bubble bubble--user">{message.text}</div>
      </div>
    );
  }

  if (message.kind === "error") {
    return (
      <div className="bubble-row bubble-row--ai">
        <div className="bubble bubble--ai bubble--error">{message.text}</div>
      </div>
    );
  }

  if (message.kind === "classification") {
    const { category, priority, reasoning } = message.data;
    return (
      <div className="bubble-row bubble-row--ai">
        <div className="bubble bubble--ai result-card">
          <div className="result-card__tags">
            <span className="tag tag--category">{category}</span>
            <span
              className="tag tag--priority"
              style={{ borderColor: PRIORITY_COLOR[priority] || "var(--text-muted)", color: PRIORITY_COLOR[priority] || "var(--text-muted)" }}
            >
              {priority} priority
            </span>
          </div>
          <p className="result-card__reasoning">{reasoning}</p>
        </div>
      </div>
    );
  }

  if (message.kind === "summary") {
    const { summary, keyPoints } = message.data;
    return (
      <div className="bubble-row bubble-row--ai">
        <div className="bubble bubble--ai result-card">
          <p className="result-card__summary">{summary}</p>
          {keyPoints && keyPoints.length > 0 && (
            <ul className="result-card__points">
              {keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bubble-row bubble-row--ai">
      <div className="bubble bubble--ai">{message.text}</div>
    </div>
  );
}
