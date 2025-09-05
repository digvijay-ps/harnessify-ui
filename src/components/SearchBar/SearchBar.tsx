// src/components/Layout/SearchBar.tsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';

const SearchBar: React.FC = () => {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        disabled
      />
    </div>
  );
};

export default SearchBar;
