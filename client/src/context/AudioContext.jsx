import React, { createContext, useContext, useState, useEffect } from 'react';
import { playMoveSound, playCaptureSound, playBlunderSound, playBrilliantSound } from '../utils/audio';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('odontochess_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('odontochess_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const playMove = () => {
    if (soundEnabled) playMoveSound();
  };

  const playCapture = () => {
    if (soundEnabled) playCaptureSound();
  };

  const playBlunder = () => {
    if (soundEnabled) playBlunderSound();
  };

  const playBrilliant = () => {
    if (soundEnabled) playBrilliantSound();
  };

  return (
    <AudioContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playMove,
        playCapture,
        playBlunder,
        playBrilliant,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
