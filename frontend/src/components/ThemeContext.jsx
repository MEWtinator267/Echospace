// ThemeContext.jsx
import React, { createContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    if (saved === 'light') {
      document.body.classList.add('bg-gray-100', 'text-gray-900');
      document.body.classList.remove('bg-base-100', 'text-base-content');
    } else {
      document.body.classList.add('bg-base-100', 'text-base-content');
      document.body.classList.remove('bg-gray-100', 'text-gray-900');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'light') {
      document.body.classList.add('bg-gray-100', 'text-gray-900');
      document.body.classList.remove('bg-base-100', 'text-base-content');
    } else {
      document.body.classList.add('bg-base-100', 'text-base-content');
      document.body.classList.remove('bg-gray-100', 'text-gray-900');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
