import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('odontochess_token'));
  const [loading, setLoading] = useState(true);

  // Carregar usuário logado ao iniciar
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Sessão expirada:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('odontochess_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('odontochess_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('odontochess_token');
    setToken(null);
    setUser(null);
  };

  // Troca rápida de perfil para apresentação ao professor / testes
  const quickSwitchRole = async (targetRole) => {
    const roleCredentials = {
      admin: { email: 'admin@odontochess.com', password: 'admin123' },
      dentista: { email: 'dentista@odontochess.com', password: 'dentista123' },
      recepcao: { email: 'recepcao@odontochess.com', password: 'recepcao123' },
      paciente: { email: 'paciente@odontochess.com', password: 'paciente123' },
    };

    const creds = roleCredentials[targetRole];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        quickSwitchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
