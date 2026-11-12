import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import PatientClinicalCard from '../components/PatientClinicalCard';

const INSURANCES = ['Particular', 'Uniodonto', 'Bradesco Dental', 'Amil Dental'];

export default function MinhaFichaPage() {
  const { refreshUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    birthDate: '',
    healthInsurance: 'Particular',
    allergies: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const loadMyProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/patients/me');
      const p = res.patient || {};
      setForm({
        name: p.name || '',
        cpf: p.cpf || '',
        phone: p.phone || '',
        email: p.email || '',
        birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : '',
        healthInsurance: p.healthInsurance || 'Particular',
        allergies: p.allergies || '',
      });
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar sua ficha cadastral.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyProfile();
  }, [loadMyProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.put('/patients/me', {
        name: form.name,
        cpf: form.cpf,
        phone: form.phone,
        birthDate: form.birthDate,
        healthInsurance: form.healthInsurance,
        allergies: form.allergies,
      });
      await refreshUser();
      setSuccessMsg('Seus dados cadastrais foram atualizados com sucesso.');
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar sua ficha.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Carregando sua ficha cadastral..." />;

  const activeCount = appointments.filter((a) => a.status !== 'cancelado').length;
  const completedCount = appointments.filter((a) => a.status === 'concluido').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Minha Ficha Odontológica</h1>
        <p className="text-sm text-slate-500">
          Gerencie seus dados pessoais, convênio, alergias e acompanhe recomendações dos seus dentistas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Minhas Consultas"
          value={activeCount}
          subtitle="Histórico ativo na clínica"
          icon={CalendarCheck}
        />
        <StatCard
          title="Atendimentos Concluídos"
          value={completedCount}
          subtitle="Procedimentos finalizados"
          icon={CheckCircle2}
        />
        <StatCard
          title="Convênio Atual"
          value={form.healthInsurance}
          subtitle="Cobertura cadastrada"
          icon={ShieldCheck}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Meus Dados Cadastrais e Anamnese
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Apenas você e a equipe clínica autorizada têm acesso a estas informações.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <FormField
              label="E-mail da conta"
              type="email"
              value={form.email}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label="CPF"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              required
            />
            <FormField
              label="Telefone / WhatsApp"
              placeholder="(95) 99100-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <FormField
              label="Data de nascimento"
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Convênio Odontológico"
              as="select"
              value={form.healthInsurance}
              onChange={(e) => setForm({ ...form, healthInsurance: e.target.value })}
            >
              {INSURANCES.map((ins) => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </FormField>

            <label className="block">
              <span className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Alergias ou Restrições Medicamentosas
              </span>
              <input
                type="text"
                placeholder="Ex: Dipirona, Penicilina, Látex ou Nenhuma"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="w-full rounded-lg border border-amber-300 bg-amber-50/30 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" /> Atualizar Minha Ficha
            </Button>
          </div>
        </form>
      </div>

      <PatientClinicalCard appointments={appointments} />
    </div>
  );
}
