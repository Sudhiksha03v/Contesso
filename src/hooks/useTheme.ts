import { useState, useEffect } from 'react';

/**
 * Custom hook to manage light/dark theme switching.
 * Persists the theme in localStorage and applies it to the document root.
 * @returns {object} - Contains the current theme and a function to toggle it.
 */
export function useTheme() {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
  });

  // Apply theme to document and persist it on change
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Clear existing theme classes
    root.classList.add(theme); // Add current theme class
    localStorage.setItem('theme', theme); // Save to localStorage
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}