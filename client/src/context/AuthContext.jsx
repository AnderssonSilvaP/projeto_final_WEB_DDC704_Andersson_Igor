import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'odontocheck_token';

const DEMO_CREDENTIALS = {
  admin: { email: 'admin@odontocheck.com', password: 'admin123' },
  dentista: { email: 'dentista@odontocheck.com', password: 'dentista123' },
  recepcao: { email: 'recepcao@odontocheck.com', password: 'recepcao123' },
  paciente: { email: 'paciente@odontocheck.com', password: 'paciente123' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const startSession = (res) => {
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const login = async (email, password) => startSession(await api.post('/auth/login', { email, password }));

  const register = async (userData) => startSession(await api.post('/auth/register', userData));

  const quickSwitchRole = async (targetRole) => {
    const creds = DEMO_CREDENTIALS[targetRole];
    if (creds) return login(creds.email, creds.password);
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
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
