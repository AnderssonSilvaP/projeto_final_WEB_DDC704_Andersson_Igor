import React, { createContext, useContext, useState, useEffect } from 'react';
import { playClickSound, playAlertSound, playErrorSound, playSuccessSound } from '../utils/audio';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('odontocheck_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('odontocheck_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const playClick = () => {
    if (soundEnabled) playClickSound();
  };

  const playAlert = () => {
    if (soundEnabled) playAlertSound();
  };

  const playError = () => {
    if (soundEnabled) playErrorSound();
  };

  const playSuccess = () => {
    if (soundEnabled) playSuccessSound();
  };

  return (
    <AudioContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playClick,
        playAlert,
        playError,
        playSuccess,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
