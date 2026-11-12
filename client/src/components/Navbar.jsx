import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  Stethoscope,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  X,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Início', icon: Home, end: true },
    { to: '/procedimentos', label: 'Procedimentos', icon: Stethoscope },
    ...(isAuthenticated
      ? [
          { to: '/agendamentos', label: 'Agendamentos', icon: Calendar },
          { to: '/pacientes', label: 'Pacientes', icon: Users },
        ]
      : []),
    ...(isAdmin ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              OC
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base block leading-none">
                Odonto<span className="text-brand-600">Check</span>
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-brand-600" /> Unidade Boa Vista
              </span>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <div className="flex justify-end mt-0.5">
                  <Badge variant={user?.role} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair"
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              <LogIn className="w-4 h-4" /> Entrar
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">{user?.name}</span>
                  <Badge variant={user?.role} />
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair
                </button>
              </>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/login');
                }}
              >
                <LogIn className="w-4 h-4" /> Entrar
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
