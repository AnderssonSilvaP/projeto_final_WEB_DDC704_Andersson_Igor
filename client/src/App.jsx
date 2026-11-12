import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AgendamentosPage from './pages/AgendamentosPage';
import PacientesPage from './pages/PacientesPage';
import MinhaFichaPage from './pages/MinhaFichaPage';
import ProcedimentosPage from './pages/ProcedimentosPage';
import DashboardPage from './pages/DashboardPage';

function MainLayout() {
  const { loading } = useAuth();
  if (loading) return <Spinner label="Carregando sistema..." />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <Spinner label="Verificando sessão..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(role)) {
    if (role === 'paciente' && roles.includes('medico')) {
      return <Navigate to="/minha-ficha" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner label="Verificando sessão..." />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/procedimentos" element={<ProcedimentosPage />} />
            <Route
              path="/agendamentos"
              element={
                <ProtectedRoute roles={['admin', 'medico', 'paciente']}>
                  <AgendamentosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/minha-ficha"
              element={
                <ProtectedRoute roles={['paciente']}>
                  <MinhaFichaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes"
              element={
                <ProtectedRoute roles={['admin', 'medico']}>
                  <PacientesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
