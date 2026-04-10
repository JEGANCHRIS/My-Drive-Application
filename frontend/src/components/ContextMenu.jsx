import React, { useEffect, useRef } from 'react';
import { FiEye, FiDownload, FiInfo, FiTrash2, FiEdit2, FiCopy, FiFileText, FiShare } from 'react-icons/fi';

function ContextMenu({ x, y, item, type, onClose, onPreview, onDownload, onMoveToBin, onRename, onCopy, onSummarize, onShare, onShowInfo }) {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { label: 'Preview', icon: FiEye, action: () => onPreview(item, type) },
    { label: 'Download', icon: FiDownload, action: () => onDownload(item, type) },
    { label: 'Rename', icon: FiEdit2, action: () => onRename(item, type) },
    { label: 'Make a copy', icon: FiCopy, action: () => onCopy(item, type) },
    { label: 'Summarize', icon: FiFileText, action: () => onSummarize(item, type) },
    { label: 'Share', icon: FiShare, action: () => onShare(item, type) },
    { label: 'Info', icon: FiInfo, action: () => onShowInfo(item, type) },
    { label: 'Move to bin', icon: FiTrash2, action: () => onMoveToBin(item, type), danger: true },
  ];

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ top: y, left: x, position: 'fixed' }}
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
          className={`context-menu-item ${item.danger ? 'danger' : ''}`}
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          <item.icon size={16} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default ContextMenu;