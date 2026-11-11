import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'classic', label: 'Verde Clássico (Chess.com)', color: '#81b64c', description: 'O clássico tabuleiro verde e elegante' },
  { id: 'wood', label: 'Madeira Elegante (Nogueira)', color: '#b45309', description: 'Tons acolhedores de madeira nobre' },
  { id: 'marble', label: 'Mármore Clínico (Ciano)', color: '#0284c7', description: 'Estética clínica cirúrgica e moderna' },
  { id: 'sapphire', label: 'Safira Real (Azul)', color: '#4f46e5', description: 'Azul cobalto de alta precisão' },
  { id: 'mint', label: 'Menta Preventiva (Esmeralda)', color: '#059669', description: 'Verde refrescante focado em higiene' },
];

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('odontocheck_mode');
    return saved || 'dark';
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('odontocheck_theme');
    return saved || 'classic';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', theme);
    localStorage.setItem('odontocheck_mode', mode);
    localStorage.setItem('odontocheck_theme', theme);

    if (mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [mode, theme]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const selectTheme = (themeId) => {
    setTheme(themeId);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme,
        isDark: mode === 'dark',
        toggleMode,
        selectTheme,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
