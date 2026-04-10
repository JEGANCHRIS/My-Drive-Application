import React from 'react';
import { FiX, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';

function InfoModal({ item, type, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Information</h3>
          <button onClick={onClose}><FiX /></button>
        </div>
        
        <div className="info-content">
          <div className="info-section">
            <h4><FiClock /> Timeline</h4>
            <p>Created: {format(new Date(item.createdAt), 'PPPpp')}</p>
            <p>Last Modified: {format(new Date(item.lastModified), 'PPPpp')}</p>
            {item.deletedAt && <p>Deleted: {format(new Date(item.deletedAt), 'PPPpp')}</p>}
          </div>
          
          <div className="info-section">
            <h4><FiUser /> Creator</h4>
            <p>Name: {item.createdBy?.name}</p>
            <p>Email: {item.createdBy?.email}</p>
          </div>
          
          <div className="info-section">
            <h4><FiActivity /> Modification History</h4>
            {item.modifiedBy?.map((mod, index) => (
              <div key={index} className="modification-entry">
                <p>{mod.action} by {mod.name} ({mod.email})</p>
                <small>{format(new Date(mod.modifiedAt), 'PPPpp')}</small>
              </div>
            ))}
          </div>
          
          {type === 'file' && (
            <div className="info-section">
              <h4>File Details</h4>
              <p>Size: {(item.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p>Type: {item.type}</p>
              <p>Extension: {item.extension}</p>
            </div>
          )}
          
          {type === 'folder' && (
            <div className="info-section">
              <h4>Folder Details</h4>
              <p>Contents: {item.contentsCount || 0} items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoModal;