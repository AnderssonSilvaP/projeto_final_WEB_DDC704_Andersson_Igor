import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/appointments/summary')
      .then((res) => setSummary(res.summary))
      .catch((err) => setError(err.message || 'Erro ao carregar indicadores.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Carregando indicadores da clínica..." />;

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700">
        {error}
      </div>
    );
  }

  const todayAppointments = summary?.todayAppointments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard da Clínica</h1>
        <p className="text-sm text-slate-500">
          Visão gerencial exclusiva para administradores da unidade.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pacientes Cadastrados"
          value={summary?.totalPatients || 0}
          subtitle="Base ativa da unidade"
          icon={Users}
        />
        <StatCard
          title="Consultas Hoje"
          value={summary?.todayCount || 0}
          subtitle="Agendadas para a data atual"
          icon={CalendarCheck}
        />
        <StatCard
          title="Atendimentos Concluídos"
          value={summary?.completedCount || 0}
          subtitle={`De ${summary?.totalAppointments || 0} agendamentos ativos`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Receita Prevista"
          value={`R$ ${Number(summary?.estimatedRevenue || 0).toFixed(2)}`}
          subtitle={`${summary?.totalServices || 0} procedimentos ativos`}
          icon={DollarSign}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Agenda de Hoje</h2>
          <span className="text-xs text-slate-500">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Nenhuma consulta agendada para hoje.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((app) => (
              <div
                key={app._id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" /> {app.timeSlot}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {app.patient?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {app.service?.name} • {app.dentistName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    R$ {Number(app.service?.price || 0).toFixed(2)}
                  </span>
                  <Badge variant={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
