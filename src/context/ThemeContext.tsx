import React, { createContext, useContext, useState, useEffect } from 'react';
import { UIStyle } from '../types';

interface ThemeContextType {
  uiStyle: UIStyle;
  setUIStyle: (style: UIStyle) => void;
  toggleUIStyle: () => void;
  isRetro: boolean;
}

const UI_STYLE_STORAGE_KEY = 'uiStyle';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiStyle, setUIStyleState] = useState<UIStyle>(() => {
    try {
      const saved = localStorage.getItem(UI_STYLE_STORAGE_KEY);
      if (saved === 'retro1997' || saved === 'neo') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'neo';
  });

  const setUIStyle = (style: UIStyle) => {
    setUIStyleState(style);
    try {
      localStorage.setItem(UI_STYLE_STORAGE_KEY, style);
    } catch {
      // Ignore
    }
  };

  const toggleUIStyle = () => {
    const nextStyle = uiStyle === 'neo' ? 'retro1997' : 'neo';
    setUIStyle(nextStyle);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (uiStyle === 'retro1997') {
      root.classList.add('theme-retro1997');
      root.classList.remove('theme-neo');
      body.classList.add('theme-retro1997');
      body.classList.remove('theme-neo');
    } else {
      root.classList.add('theme-neo');
      root.classList.remove('theme-retro1997');
      body.classList.add('theme-neo');
      body.classList.remove('theme-retro1997');
    }
  }, [uiStyle]);

  const isRetro = uiStyle === 'retro1997';

  return (
    <ThemeContext.Provider value={{ uiStyle, setUIStyle, toggleUIStyle, isRetro }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
