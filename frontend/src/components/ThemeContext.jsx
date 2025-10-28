// ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    // This line allows DaisyUI components to use the theme
    document.documentElement.setAttribute('data-theme', saved);

    // This block now uses a more soothing color palette
    if (saved === 'light') {
      // Light Mode: Soft off-white background with dark slate text
      document.body.classList.add('bg-slate-50', 'text-slate-800');
      document.body.classList.remove('bg-slate-900', 'text-slate-200');
    } else {
      // Dark Mode: Deep charcoal background with soft off-white text
      document.body.classList.add('bg-slate-900', 'text-slate-200');
      document.body.classList.remove('bg-slate-50', 'text-slate-800');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // This block now uses a more soothing color palette
    if (newTheme === 'light') {
      // Light Mode: Soft off-white background with dark slate text
      document.body.classList.add('bg-slate-50', 'text-slate-800');
      document.body.classList.remove('bg-slate-900', 'text-slate-200');
    } else {
      // Dark Mode: Deep charcoal background with soft off-white text
      document.body.classList.add('bg-slate-900', 'text-slate-200');
      document.body.classList.remove('bg-slate-50', 'text-slate-800');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// You can create a custom hook for easier access in other components
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;