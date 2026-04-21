import React, { useState } from "react";
import { FiGitMerge } from "react-icons/fi";

const N8N_URL = "https://my-drive-n8n-backend.onrender.com";

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

      {selected === "n8n" ? (
        <iframe
          src={N8N_URL}
          className="workflow-iframe"
          title="n8n Workflow"
          allow="fullscreen"
        />
      ) : (
        <>
          <div className="workflow-header">
            <FiGitMerge size={32} />
            <h2>Workflow</h2>
          </div>
          <p className="workflow-description">Select a workflow from the dropdown above.</p>
        </>
      )}
    </div>
  );
}

export default Workflow;
