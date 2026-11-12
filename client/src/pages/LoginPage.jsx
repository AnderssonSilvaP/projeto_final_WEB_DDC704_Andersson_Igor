import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import FormField from '../components/FormField';
import PatientProfileFields, { INITIAL_PATIENT_FORM } from '../components/PatientProfileFields';
import { formatEmail, formatTextLimit } from '../utils/masks';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [profileForm, setProfileForm] = useState(INITIAL_PATIENT_FORM);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (profileForm.cpf.length < 14) {
        setError('Informe o CPF completo no formato 000.000.000-00.');
        return;
      }
      if (profileForm.phone.length < 14) {
        setError('Informe o telefone completo com DDD.');
        return;
      }
      if (profileForm.cep.length < 9) {
        setError('Informe o CEP completo no formato 00000-000.');
        return;
      }
      if (profileForm.state.length < 2) {
        setError('Informe a sigla da UF com 2 letras (ex: RR).');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter entre 6 e 32 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('A confirmação de senha não confere.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          ...profileForm,
          email,
          password,
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
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

      <div
        className={`mt-6 sm:mx-auto sm:w-full transition-all ${
          isRegister ? 'sm:max-w-2xl' : 'sm:max-w-md'
        }`}
      >
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
              Criar Conta Completa
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <PatientProfileFields
                form={profileForm}
                onChange={setProfileForm}
              />
            )}

            <div className="space-y-3">
              {isRegister && (
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Lock className="w-3.5 h-3.5" /> Credenciais de Acesso
                </h3>
              )}

              <FormField
                label={isRegister ? 'E-mail de acesso *' : 'E-mail'}
                hint={isRegister ? `${email.length}/80` : undefined}
                type="email"
                maxLength={80}
                placeholder="voce@odontocheck.com"
                value={email}
                onChange={(e) => setEmail(formatEmail(e.target.value))}
                required
              />

              <div className={isRegister ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
                <FormField
                  label={isRegister ? 'Senha *' : 'Senha'}
                  hint={isRegister ? '6 a 32 caracteres' : undefined}
                  type="password"
                  minLength={6}
                  maxLength={32}
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(formatTextLimit(e.target.value, 32))}
                  required
                />

                {isRegister && (
                  <FormField
                    label="Confirmar Senha *"
                    hint="Repita a senha"
                    type="password"
                    minLength={6}
                    maxLength={32}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(formatTextLimit(e.target.value, 32))}
                    required
                  />
                )}
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-2.5">
              {isRegister ? 'Concluir Cadastro Completo' : 'Acessar Sistema'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
