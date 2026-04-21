import React from "react";
import { FiGitMerge } from "react-icons/fi";

function Workflow() {
  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <FiGitMerge size={32} />
        <h2>Workflow</h2>
      </div>
      <p className="workflow-description">Workflow features coming soon.</p>
    </div>
  );
}

export default Workflow;
