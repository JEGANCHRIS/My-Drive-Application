import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

function SearchBar({ files, folders, onSearchResult }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      onSearchResult(null);
      return;
    }
    
    const allItems = [
      ...files.map(f => ({ ...f, type: 'file' })),
      ...folders.map(f => ({ ...f, type: 'folder' }))
    ];
    
    const matched = allItems.filter(item => 
      item.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSuggestions(matched.slice(0, 10));
    setShowSuggestions(true);
    onSearchResult(matched);
  };

  const handleSuggestionClick = (item) => {
    setQuery(item.originalName || item.name);
    setShowSuggestions(false);
    onSearchResult([item]);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search in Drive..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowSuggestions(true)}
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map(item => (
            <div
              key={item._id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(item)}
            >
              <div className="suggestion-name">{item.originalName || item.name}</div>
              <div className="suggestion-type">{item.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;