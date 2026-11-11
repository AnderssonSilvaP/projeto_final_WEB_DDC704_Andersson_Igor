import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Plus,
  Clock,
  Activity,
  UserPlus,
  CalendarPlus,
  Sun,
  Moon,
  Palette,
  Check,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header = ({ onOpenNewPatient, onOpenNewAppointment }) => {
  const { soundEnabled, toggleSound, playMove } = useAudio();
  const { user } = useAuth();
  const { mode, isDark, toggleMode, theme, selectTheme, themes } = useTheme();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="h-16 bg-chess-dark border-b border-chess-border px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left: Chairs Status Indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-chess-gray bg-chess-panel px-3 py-1.5 rounded-lg border border-chess-border">
          <Activity className="w-4 h-4 text-chess-green" />
          <span className="hidden sm:inline">Consultórios:</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-chess-light font-bold">
              <span className="w-2 h-2 rounded-full bg-chess-green animate-ping inline-block" />
              C1: Cirurgia
            </span>
            <span className="text-chess-border">|</span>
            <span className="flex items-center gap-1 text-[11px] text-chess-light font-bold">
              <span className="w-2 h-2 rounded-full bg-chess-blue inline-block" />
              C2: Ortodontia
            </span>
            <span className="text-chess-border">|</span>
            <span className="flex items-center gap-1 text-[11px] text-chess-light font-bold">
              <span className="w-2 h-2 rounded-full bg-chess-gold inline-block" />
              C3: Geral
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Clock, Theme, Mode, Audio, Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-chess-gray bg-chess-panel px-3 py-1.5 rounded-lg border border-chess-border">
          <Clock className="w-3.5 h-3.5 text-chess-gold" />
          <span className="capitalize">{formattedDate}</span>
          <span className="text-chess-light font-mono">{formattedTime}</span>
        </div>

        {/* 1-Click Dark/Light Mode Switcher */}
        <button
          onClick={() => {
            playMove();
            toggleMode();
          }}
          title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-2 rounded-lg bg-chess-panel border border-chess-border text-chess-gray hover:text-chess-green transition-all"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-chess-gold hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-chess-blue" />
          )}
        </button>

        {/* Theme Palette Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              playMove();
              setThemeDropdownOpen((prev) => !prev);
            }}
            title="Escolher Tema Visual"
            className="p-2 rounded-lg bg-chess-panel border border-chess-border text-chess-gray hover:text-chess-green transition-all flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4 text-chess-green" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-chess-panel border border-chess-border rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn space-y-2">
              <div className="px-2 py-1 text-xs font-extrabold uppercase tracking-wider text-chess-gray border-b border-chess-border pb-1.5 flex items-center justify-between">
                <span>Temas da Clínica</span>
                <span className="text-[10px] text-chess-gold font-mono">{mode.toUpperCase()}</span>
              </div>

              <div className="space-y-1">
                {themes.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        playMove();
                        selectTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-chess-darker font-bold border border-chess-border'
                          : 'hover:bg-chess-darker/60 text-chess-gray hover:text-chess-light'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <div>
                          <div className={`text-xs ${isSelected ? 'text-chess-light' : ''}`}>
                            {t.label}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-chess-green" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-chess-border flex items-center justify-between text-[11px] px-2 text-chess-gray">
                <span>Modo de Exibição:</span>
                <button
                  onClick={() => {
                    playMove();
                    toggleMode();
                  }}
                  className="font-bold text-chess-green hover:underline flex items-center gap-1"
                >
                  {isDark ? <Sun className="w-3 h-3 text-chess-gold" /> : <Moon className="w-3 h-3 text-chess-blue" />}
                  <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audio Effects Toggle */}
        <button
          onClick={() => {
            toggleSound();
            playMove();
          }}
          title={soundEnabled ? 'Silenciar sons táticos' : 'Ativar sons de xadrez'}
          className={`p-2 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-chess-panel border-chess-border text-chess-green hover:text-chess-greenHover'
              : 'bg-chess-panel border-chess-border text-chess-gray hover:text-chess-light'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Quick Action: Portal do Paciente */}
        <a
          href="/portal"
          title="Abrir Portal do Paciente & Recepção Virtual"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-chess-panel border border-chess-border text-chess-gray hover:text-chess-green hover:border-chess-green transition-all"
        >
          <span className="text-sm">👩‍⚕️</span>
          <span>Portal & Recepção</span>
        </a>

        {/* Quick Action: Nova Consulta */}
        {user?.role !== 'paciente' && onOpenNewAppointment && (
          <button
            onClick={() => {
              playMove();
              onOpenNewAppointment();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold chess-btn-dark"
          >
            <CalendarPlus className="w-4 h-4 text-chess-gold" />
            <span>Nova Consulta</span>
          </button>
        )}

        {/* Quick Action: Novo Paciente */}
        {user?.role !== 'paciente' && onOpenNewPatient && (
          <button
            onClick={() => {
              playMove();
              onOpenNewPatient();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold chess-btn-green"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden md:inline">Novo Paciente</span>
          </button>
        )}
      </div>
    </header>
  );
};
