import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  FileText,
  Users,
  Calculator,
  DollarSign,
  Package,
  Layers,
  LogOut,
  ShieldCheck,
  Award,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';

const navItems = [
  { path: '/dashboard', label: 'Painel Clínico Geral', icon: LayoutDashboard, roles: ['admin', 'dentista', 'recepcao'] },
  { path: '/', label: 'Portal & Recepção Sofia', icon: Smile, roles: ['admin', 'dentista', 'recepcao', 'paciente'] },
  { path: '/odontograma', label: 'Odontograma 2D/3D', icon: Sparkles, roles: ['admin', 'dentista'] },
  { path: '/agenda', label: 'Agenda & Consultórios', icon: Calendar, roles: ['admin', 'dentista', 'recepcao'] },
  { path: '/prontuario', label: 'Prontuário & PEP', icon: FileText, roles: ['admin', 'dentista'] },
  { path: '/pacientes', label: 'Pacientes & CRM', icon: Users, roles: ['admin', 'dentista', 'recepcao'] },
  { path: '/orcamentos', label: 'Orçamentos & Planos', icon: Calculator, roles: ['admin', 'dentista', 'recepcao', 'paciente'] },
  { path: '/financeiro', label: 'Fluxo Financeiro', icon: DollarSign, roles: ['admin', 'dentista'] },
  { path: '/estoque', label: 'Estoque de Insumos', icon: Package, roles: ['admin', 'dentista', 'recepcao'] },
  { path: '/proteses', label: 'Ordens de Prótese', icon: Layers, roles: ['admin', 'dentista'] },
];

export const Sidebar = () => {
  const { user, logout, quickSwitchRole } = useAuth();
  const { playMove } = useAudio();

  const userRole = user?.role || 'recepcao';
  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-chess-darker border-r border-chess-border flex flex-col h-screen sticky top-0 select-none z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-chess-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chess-panel border border-chess-border flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-chess-green" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 18 C38 18 32 26 32 40 C32 50 36 62 42 78 C44 83 48 84 50 78 C52 72 54 64 56 64 C58 64 60 72 62 78 C64 84 68 83 70 78 C76 62 80 50 80 40 C80 26 74 18 62 18 C58 18 54 22 50 22 C46 22 42 18 50 18 Z" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-['Montserrat']">
              ODONTO<span className="text-chess-green">CHECK</span>
            </h1>
            <p className="text-[10px] text-chess-gray uppercase tracking-wider font-semibold">
              Clínica Odontológica
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-chess-gray">
          Módulos Clínicos
        </div>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={playMove}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-chess-green text-white shadow-chess-btn font-bold translate-y-[-1px]'
                    : 'text-chess-gray hover:text-white hover:bg-chess-panel'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-chess-gray group-hover:text-chess-green'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Quick Demo Switcher Section */}
        <div className="pt-4 mt-4 border-t border-chess-border">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-chess-gold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Demonstração Rápida</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-2">
            <button
              onClick={() => { playMove(); quickSwitchRole('admin'); }}
              className={`text-xs py-1.5 px-2 rounded font-bold border transition-all text-left ${
                userRole === 'admin'
                  ? 'bg-chess-gold/20 border-chess-gold text-chess-gold'
                  : 'bg-chess-panel border-chess-border text-chess-gray hover:text-white'
              }`}
            >
              👑 Diretor (Admin)
            </button>
            <button
              onClick={() => { playMove(); quickSwitchRole('dentista'); }}
              className={`text-xs py-1.5 px-2 rounded font-bold border transition-all text-left ${
                userRole === 'dentista'
                  ? 'bg-chess-green/20 border-chess-green text-chess-green'
                  : 'bg-chess-panel border-chess-border text-chess-gray hover:text-white'
              }`}
            >
              🦷 Dentista
            </button>
            <button
              onClick={() => { playMove(); quickSwitchRole('recepcao'); }}
              className={`text-xs py-1.5 px-2 rounded font-bold border transition-all text-left ${
                userRole === 'recepcao'
                  ? 'bg-chess-blue/20 border-chess-blue text-chess-blue'
                  : 'bg-chess-panel border-chess-border text-chess-gray hover:text-white'
              }`}
            >
              📋 Recepção
            </button>
            <button
              onClick={() => { playMove(); quickSwitchRole('paciente'); }}
              className={`text-xs py-1.5 px-2 rounded font-bold border transition-all text-left ${
                userRole === 'paciente'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                  : 'bg-chess-panel border-chess-border text-chess-gray hover:text-white'
              }`}
            >
              👤 Paciente
            </button>
          </div>
        </div>
      </nav>

      {/* User Profile Card */}
      <div className="p-3 border-t border-chess-border bg-chess-dark">
        <div className="bg-chess-panel p-2.5 rounded-lg border border-chess-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-chess-darker flex items-center justify-center font-bold text-chess-green border border-chess-border flex-shrink-0 text-xs">
              🦷
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                {user?.name || 'Usuário'}
              </div>
              <div className="text-[10px] text-chess-gray truncate flex items-center gap-1">
                <span className="text-chess-green font-semibold">{user?.cro || user?.specialty || user?.role}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sair do sistema"
            className="p-1.5 text-chess-gray hover:text-chess-red hover:bg-chess-dark rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
