import React, { useState } from "react";
import { FiGitMerge, FiExternalLink } from "react-icons/fi";

const N8N_URL = "https://my-drive-n8n-backend.onrender.com";

function Workflow() {
  const [selected, setSelected] = useState("");

  const handleSelect = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (val === "n8n") {
      window.open(N8N_URL, "_blank", "noopener,noreferrer");
      setSelected("");
    }
  };

  return (
    <div className="workflow-container">
      <div className="workflow-top">
        <select className="workflow-select" value={selected} onChange={handleSelect}>
          <option value="" disabled>Select workflow</option>
          <option value="n8n">n8n workflow</option>
        </select>
      </div>
      <div className="workflow-header">
        <FiGitMerge size={32} />
        <h2>Workflow</h2>
      </div>
      <p className="workflow-description">Select a workflow from the dropdown above.</p>
    </div>
  );
}

export default Workflow;
