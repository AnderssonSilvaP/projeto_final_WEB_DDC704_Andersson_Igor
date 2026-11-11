import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Award,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, quickSwitchRole } = useAuth();
  const { playClick, playSuccess, playError } = useAudio();
  const { isDark, toggleMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      playSuccess();
      if (loggedUser && loggedUser.role === 'paciente') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      playError();
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    playClick();
    setLoading(true);
    setError('');
    try {
      await quickSwitchRole(role);
      playSuccess();
      if (role === 'paciente') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      playError();
      setError('Erro ao entrar com perfil demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chess-darkest flex flex-col justify-center items-center p-4 relative overflow-hidden select-none transition-colors">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            playClick();
            toggleMode();
          }}
          title={isDark ? 'Modo Claro' : 'Modo Escuro'}
          className="p-2.5 rounded-xl bg-chess-panel border border-chess-border text-chess-gray hover:text-chess-green shadow-md transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-chess-gold" /> : <Moon className="w-4 h-4 text-chess-blue" />}
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-chess-green/10 via-transparent to-transparent" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chess-panel border border-chess-border shadow-chess-card mb-2">
            <svg className="w-10 h-10 text-chess-green" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 18 C38 18 32 26 32 40 C32 50 36 62 42 78 C44 83 48 84 50 78 C52 72 54 64 56 64 C58 64 60 72 62 78 C64 84 68 83 70 78 C76 62 80 50 80 40 C80 26 74 18 62 18 C58 18 54 22 50 22 C46 22 42 18 50 18 Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-['Montserrat']">
            ODONTO<span className="text-chess-green">CHECK</span>
          </h1>
          <p className="text-xs text-chess-gray font-medium">
            Sistema Integrado de Gestão Odontológica
          </p>
        </div>

        <div className="bg-chess-dark border border-chess-border rounded-2xl p-6 sm:p-8 shadow-chess-card space-y-5">
          <div className="border-b border-chess-border pb-3">
            <h2 className="text-base font-extrabold text-white">Acesse o Sistema Odontológico</h2>
            <p className="text-xs text-chess-gray">Entre com suas credenciais ou escolha um perfil de acesso</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-chess-red/15 border border-chess-red/40 text-xs text-chess-red font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1.5">
                E-mail Institucional:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-chess-gray" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@odontocheck.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-chess-darker border border-chess-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-chess-gray focus:outline-none focus:border-chess-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-chess-gray uppercase mb-1.5">
                Senha de Acesso:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-chess-gray" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-chess-darker border border-chess-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-chess-gray focus:outline-none focus:border-chess-green transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-black chess-btn-green flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Acessando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playSuccess();
                navigate('/portal');
              }}
              className="w-full p-3 rounded-xl bg-chess-green/15 border-2 border-chess-green text-chess-green hover:bg-chess-green hover:text-white transition-all flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div>
                  <div className="text-xs font-black uppercase tracking-wide">
                    Visitar Apresentação & Recepção Sofia
                  </div>
                  <div className="text-[11px] opacity-80 font-medium">
                    Portal do Paciente, Exames 3D, Fila & Mini-Mapa
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="pt-4 border-t border-chess-border space-y-2.5">
            <div className="text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-chess-gold flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Acesso Rápido para Avaliação (Demo 1-Click)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="p-2 rounded-xl bg-chess-panel border border-chess-border hover:border-chess-gold text-left transition-all group"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Diretor Clínico (Admin)</span>
                </div>
                <div className="text-[10px] text-chess-gray">Dr. Roberto Silveira</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('dentista')}
                className="p-2 rounded-xl bg-chess-panel border border-chess-border hover:border-chess-green text-left transition-all group"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Cirurgiã-Dentista</span>
                </div>
                <div className="text-[10px] text-chess-gray">Dra. Mariana Costa</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('recepcao')}
                className="p-2 rounded-xl bg-chess-panel border border-chess-border hover:border-chess-blue text-left transition-all group"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Recepção</span>
                </div>
                <div className="text-[10px] text-chess-gray">Camila Alencar</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('paciente')}
                className="p-2 rounded-xl bg-chess-panel border border-chess-border hover:border-purple-500 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Paciente</span>
                </div>
                <div className="text-[10px] text-chess-gray">Carlos Eduardo Silva</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-chess-gray">
          OdontoCheck • UFRR Arquitetura Web Full Stack • 2026
        </div>
      </div>
    </div>
  );
};
