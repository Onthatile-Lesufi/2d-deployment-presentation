import React, { useState, useEffect } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ searchQuery, setSearchQuery, products, setFilteredProducts }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
    } else {
      const filtered = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Show up to 5 suggestions
    }
  }, [searchQuery, products]);

  const handleSelect = (value) => {
    setSearchQuery(value);
    setFilteredProducts(products.filter(
      (p) =>
        p.title.toLowerCase().includes(value.toLowerCase()) ||
        p.category.toLowerCase().includes(value.toLowerCase())
    ));
    setSuggestions([]);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((s, index) => (
            <li key={index} onClick={() => handleSelect(s.title)}>
              {s.title} <small>({s.category})</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
