import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import PatientClinicalCard from '../components/PatientClinicalCard';
import PatientProfileFields, { INITIAL_PATIENT_FORM } from '../components/PatientProfileFields';

export default function MinhaFichaPage() {
  const { refreshUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(INITIAL_PATIENT_FORM);
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
        birthDate: p.birthDate ? String(p.birthDate).slice(0, 10) : '',
        gender: p.gender || 'Não informado',
        phone: p.phone || '',
        emergencyContact: p.emergencyContact || '',
        cep: p.cep || '',
        address: p.address || '',
        city: p.city || 'Boa Vista',
        state: p.state || 'RR',
        healthInsurance: p.healthInsurance || 'Particular',
        insuranceNumber: p.insuranceNumber || '',
        allergies: p.allergies || '',
        email: p.email || '',
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
    setError('');
    setSuccessMsg('');

    if (form.cpf.length < 14) {
      setError('Informe o CPF completo no formato 000.000.000-00.');
      return;
    }
    if (form.phone.length < 14) {
      setError('Informe o telefone completo com DDD.');
      return;
    }

    setSaving(true);
    try {
      await api.put('/patients/me', {
        name: form.name,
        cpf: form.cpf,
        birthDate: form.birthDate,
        gender: form.gender,
        phone: form.phone,
        emergencyContact: form.emergencyContact,
        cep: form.cep,
        address: form.address,
        city: form.city,
        state: form.state,
        healthInsurance: form.healthInsurance,
        insuranceNumber: form.insuranceNumber,
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
          Gerencie seus dados pessoais, endereço, convênio, alergias e acompanhe recomendações dos seus dentistas.
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
          subtitle={form.insuranceNumber ? `Carteira: ${form.insuranceNumber}` : 'Cobertura cadastrada'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FormField
            label="E-mail vinculado à conta"
            type="email"
            value={form.email}
            disabled
          />

          <PatientProfileFields form={form} onChange={setForm} />

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
