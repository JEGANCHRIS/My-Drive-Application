import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

function CustomSelect({ value, onChange, options, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const selectedOption = options[highlightedIndex];
      if (!selectedOption.disabled) {
        onChange(selectedOption.value);
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (option) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className={`custom-select-wrapper ${disabled ? 'disabled' : ''}`}
      ref={wrapperRef}
    >
      <div
        className={`custom-select ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">
          {selectedOption?.label || 'Select...'}
        </span>
        <FiChevronDown className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`custom-select-option ${
                option.value === value ? 'selected' : ''
              } ${highlightedIndex === index ? 'highlighted' : ''} ${
                option.disabled ? 'disabled' : ''
              } ${option.isGroupLabel ? 'group-label' : ''}`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.value === value && <FiCheck className="check-icon" />}
              <span className="option-label">{option.label}</span>
              {option.count !== undefined && (
                <span className="option-count">{option.count}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
