import React, { useState } from "react";
import { FiGitMerge, FiX, FiExternalLink } from "react-icons/fi";

const N8N_URL = "https://my-drive-n8n-backend.onrender.com";

function Workflow() {
  const [selected, setSelected] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);

  const handleSelect = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (val === "n8n") {
      window.open(N8N_URL, "_blank");
      setShowCanvas(true);
    }
  };

  return (
    <div className="workflow-container">
      <div className="workflow-top">
        <select
          className="workflow-select"
          value={selected}
          onChange={handleSelect}
        >
          <option value="" disabled>
            Select workflow
          </option>
          <option value="n8n">n8n workflow</option>
        </select>
      </div>

      {!showCanvas && (
        <>
          <div className="workflow-header">
            <FiGitMerge size={32} />
            <h2>Workflow</h2>
          </div>
          <p className="workflow-description">
            Select a workflow from the dropdown above.
          </p>
        </>
      )}

      {showCanvas && (
        <div className="workflow-canvas-wrapper">
          <div className="workflow-canvas-bar">
            <span>n8n Workflow</span>
            <div className="workflow-canvas-actions">
              <a
                href={N8N_URL}
                target="_blank"
                rel="noreferrer"
                className="workflow-open-btn"
              >
                <FiExternalLink size={14} /> Open in new tab
              </a>
              <button
                className="workflow-close-btn"
                onClick={() => {
                  setShowCanvas(false);
                  setSelected("");
                }}
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

<div className="workflow-iframe-blocked">
              <FiGitMerge size={40} />
              <p>n8n Workflow opened in new tab!</p>
              <a href={N8N_URL} target="_blank" rel="noreferrer" className="workflow-open-link">
                <FiExternalLink size={14} /> Open n8n Workflow
              </a>
              <p className="workflow-hint">Due to security restrictions, n8n runs in a separate tab.</p>
            </div>
        </div>
      )}
    </div>
  );
}

export default Workflow;
