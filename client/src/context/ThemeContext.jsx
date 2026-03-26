import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

const ThemeContext = createContext();

// Helper to get initial state without "flashing"
const getInitialTheme = () => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  // Fallback to OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // useLayoutEffect runs before paint to prevent theme flickering
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const theme = isDark ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {/* No wrapper div needed here; managed at <html> level now */}
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};