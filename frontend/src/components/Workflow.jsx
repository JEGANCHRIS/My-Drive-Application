import React, { useState } from "react";
import { FiGitMerge } from "react-icons/fi";

function Workflow() {
  const [selected, setSelected] = useState("");

  return (
    <div className="workflow-container">
      <div className="workflow-top">
        <select
          className="workflow-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="" disabled>Select workflow</option>
          <option value="n8n">n8n workflow</option>
        </select>
      </div>
      <div className="workflow-header">
        <FiGitMerge size={32} />
        <h2>Workflow</h2>
      </div>
      <p className="workflow-description">Workflow features coming soon.</p>
    </div>
  );
}

export default Workflow;
