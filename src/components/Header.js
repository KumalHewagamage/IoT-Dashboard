import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const Header = ({ themeToggle }) => {
  return (
    <header className="header">
      <h1>IoT Device Dashboard</h1>
      <button onClick={themeToggle} className="theme-toggle-btn">
        <FaMoon /> Toggle Theme
      </button>
    </header>
  );
};

export default Header;
