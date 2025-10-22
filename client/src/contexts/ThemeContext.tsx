import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  direction: Direction;
  setDirection: (direction: Direction) => void;
  toggleTheme: () => void;
  toggleDirection: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'light';
  });

  const [direction, setDirection] = useState<Direction>(() => {
    const stored = localStorage.getItem('direction');
    return (stored as Direction) || 'rtl'; // Default to RTL for Arabic
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // Apply direction
    root.setAttribute('dir', direction);
    localStorage.setItem('direction', direction);
  }, [theme, direction]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, direction, setDirection, toggleTheme, toggleDirection }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
