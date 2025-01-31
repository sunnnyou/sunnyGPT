import { useState } from "react";
import "./ExpandableContainer.css"; // Import the CSS file

const ExpandableContainer = ({ title, message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!message.trim()) return null;
  return (
    <div className="expandable-container">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="expand-button"
      >
        {title} <span>{isExpanded ? "▲" : "▼"}</span>
      </button>
      {isExpanded && (
        <div className="content">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default ExpandableContainer;
