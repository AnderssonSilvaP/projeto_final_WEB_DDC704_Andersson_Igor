import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Modal } from './components/Modal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { OdontogramaPage } from './pages/OdontogramaPage';
import { ProntuarioPage } from './pages/ProntuarioPage';
import { PacientesPage } from './pages/PacientesPage';
import { OrcamentosPage } from './pages/OrcamentosPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { EstoquePage } from './pages/EstoquePage';
import { ProtesesPage } from './pages/ProtesesPage';
import { LoginPage } from './pages/LoginPage';
import { PortalPaciente } from './pages/PortalPaciente';

// Layout com Proteção de Rota
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [globalPatientModal, setGlobalPatientModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-chess-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-chess-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-chess-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenNewPatient={() => setGlobalPatientModal(true)}
          onOpenNewAppointment={() => window.location.href = '/agenda'}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global New Patient Modal */}
      {globalPatientModal && (
        <PacientesPage
          isCreateModalOpen={globalPatientModal}
          onCloseCreateModal={() => setGlobalPatientModal(false)}
        />
      )}
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AudioProvider>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PortalPaciente />} />
            <Route path="/portal" element={<PortalPaciente />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />

            <Route
              path="/agenda"
              element={
                <ProtectedLayout>
                  <Agenda />
                </ProtectedLayout>
              }
            />

            <Route
              path="/odontograma"
              element={
                <ProtectedLayout>
                  <OdontogramaPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/prontuario"
              element={
                <ProtectedLayout>
                  <ProntuarioPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/pacientes"
              element={
                <ProtectedLayout>
                  <PacientesPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/orcamentos"
              element={
                <ProtectedLayout>
                  <OrcamentosPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/financeiro"
              element={
                <ProtectedLayout>
                  <FinanceiroPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/estoque"
              element={
                <ProtectedLayout>
                  <EstoquePage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/proteses"
              element={
                <ProtectedLayout>
                  <ProtesesPage />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AudioProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
};

export default App;
