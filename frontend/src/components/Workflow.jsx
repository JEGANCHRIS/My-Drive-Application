import React, { useState, useRef } from "react";
import { FiGitMerge, FiRefreshCw } from "react-icons/fi";

const N8N_PROXY = "https://my-drive-application.onrender.com/n8n-proxy";

function Workflow() {
  const [selected, setSelected] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const iframeRef = useRef(null);

  const handleSelect = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (val === "n8n") setShowCanvas(true);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = N8N_PROXY;
    }
  };

  return (
    <div className="workflow-container">
      <div className="workflow-top">
        <select className="workflow-select" value={selected} onChange={handleSelect}>
          <option value="" disabled>Select workflow</option>
          <option value="n8n">n8n workflow</option>
        </select>
        {showCanvas && (
          <button className="workflow-refresh-btn" onClick={handleRefresh}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        )}
      </div>

      {!showCanvas ? (
        <>
          <div className="workflow-header">
            <FiGitMerge size={32} />
            <h2>Workflow</h2>
          </div>
          <p className="workflow-description">Select a workflow from the dropdown above.</p>
        </>
      ) : (
        <iframe
          ref={iframeRef}
          src={N8N_PROXY}
          className="workflow-iframe"
          title="n8n Workflow"
        />
      )}
    </div>
  );
}

export default Workflow;
