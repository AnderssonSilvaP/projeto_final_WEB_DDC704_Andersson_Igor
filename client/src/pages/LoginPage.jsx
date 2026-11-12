import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import FormField from '../components/FormField';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, cpf, phone, email, password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Falha ao autenticar conta de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para a página inicial
        </Link>
        <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
          OC
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
          Odonto<span className="text-brand-600">Check</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-brand-600" /> Clínica Odontológica • Unidade Boa Vista
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-sm rounded-2xl border border-slate-200 sm:px-8">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <FormField
                  label="Nome completo"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    label="CPF"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                  />
                  <FormField
                    label="Telefone / WhatsApp"
                    type="text"
                    placeholder="(95) 99100-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <FormField
              label="E-mail"
              type="email"
              placeholder="voce@odontocheck.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormField
              label="Senha"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full py-2.5">
              {mode === 'login' ? 'Acessar Sistema' : 'Cadastrar Conta'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Acesso rápido de demonstração
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('admin@odontocheck.com', 'admin123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50/40 text-left transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-800">Admin</span>
                  <span className="block text-[10px] text-slate-500">Gestão completa</span>
                </div>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('paciente@odontocheck.com', 'paciente123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50/40 text-left transition-colors"
              >
                <User className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-slate-800">Paciente</span>
                  <span className="block text-[10px] text-slate-500">Acesso comum</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
