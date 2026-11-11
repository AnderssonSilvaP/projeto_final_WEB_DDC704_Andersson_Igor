import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  Layers,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { EvaluationBar } from '../components/EvaluationBar';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard = ({ onOpenNewPatient, onOpenNewAppointment }) => {
  const { playMove, playCapture, playBrilliant } = useAudio();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Polling a cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      playCapture();
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchDashboardStats();
    } catch (err) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-chess-green border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-chess-gray">Carregando painel clínico da clínica...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Status Clínico */}
      <div className="bg-gradient-to-r from-chess-darker via-chess-panel to-chess-dark border border-chess-border rounded-2xl p-6 shadow-chess-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-black bg-chess-green/20 text-chess-green border border-chess-green/30">
              {user?.role === 'admin' ? 'DIREÇÃO' : user?.role === 'dentista' ? 'ESPECIALISTA' : 'EQUIPE'}
            </span>
            <span className="text-xs font-bold text-chess-gray">
              {user?.cro || user?.specialty || 'Cirurgião-Dentista'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Painel de Gestão Odontológica
          </h2>
          <p className="text-xs text-chess-gray mt-1">
            Status operacional das cadeiras, fluxo da recepção e rentabilidade em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-chess-darker border border-chess-border px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-chess-gray">Eficiência Operacional</span>
            <div className="text-xl font-black text-chess-green font-mono flex items-center justify-end gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>96.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Efficiency Evaluation Bar */}
      <EvaluationBar
        score={stats?.stockfishEvaluation?.score || 4.8}
        label={stats?.stockfishEvaluation?.advantage || 'Excelente Eficiência Operacional'}
        subtitle="Indicador de Eficiência & Rentabilidade"
      />

      {/* KPI Cards em Estilo Chess.com */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Consultas Hoje */}
        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <div className="flex items-center justify-between text-chess-gray mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Consultas Hoje</span>
            <Calendar className="w-4 h-4 text-chess-green" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.todayTotal || 0}
          </div>
          <div className="text-xs text-chess-gray mt-1 flex items-center gap-2">
            <span className="text-chess-green font-bold">{stats?.completedToday || 0} concluídas</span>
            <span>•</span>
            <span className="text-chess-gold font-bold">{stats?.inProgressToday || 0} em cadeira</span>
          </div>
        </div>

        {/* Card 2: Faturamento do Mês */}
        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <div className="flex items-center justify-between text-chess-gray mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Receita do Mês</span>
            <DollarSign className="w-4 h-4 text-chess-gold" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            R$ {(stats?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-chess-gray mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-chess-green" />
            <span className="text-chess-green font-bold">
              Lucro: R$ {(stats?.monthlyNetProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 3: Pacientes Ativos */}
        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <div className="flex items-center justify-between text-chess-gray mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pacientes Ativos</span>
            <Users className="w-4 h-4 text-chess-blue" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.totalPatients || 0}
          </div>
          <div className="text-xs text-chess-gray mt-1">
            <span>{stats?.pendingBudgets || 0} orçamentos em negociação</span>
          </div>
        </div>

        {/* Card 4: Alertas de Insumos & Próteses */}
        <div className="bg-chess-panel border border-chess-border rounded-xl p-4 shadow-chess-card">
          <div className="flex items-center justify-between text-chess-gray mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Alertas do Consultório</span>
            <AlertTriangle className="w-4 h-4 text-chess-red" />
          </div>
          <div className="text-2xl font-black text-chess-red font-mono">
            {stats?.lowStockCount || 0}
          </div>
          <div className="text-xs text-chess-gray mt-1 flex items-center gap-1.5">
            <span className="text-chess-red font-bold">Insumos em falta</span>
            <span>•</span>
            <span className="text-chess-gold font-bold">{stats?.pendingLabOrders || 0} próteses</span>
          </div>
        </div>
      </div>

      {/* Fila da Sala de Espera ao Vivo & Agenda de Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sala de Espera ao Vivo (Recepção) */}
        <div className="lg:col-span-5 bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-chess-border mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chess-green animate-ping" />
                <h3 className="text-base font-extrabold text-white">Sala de Espera (Ao Vivo)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-chess-darker text-chess-gray font-mono">
                {stats?.waitingRoomCount || 0} aguardando
              </span>
            </div>

            {(!stats?.waitingRoomQueue || stats.waitingRoomQueue.length === 0) ? (
              <div className="p-8 text-center text-chess-gray text-xs">
                Nenhum paciente aguardando na recepção no momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.waitingRoomQueue.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-3 bg-chess-darker border border-chess-border rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{apt.patient?.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-chess-panel text-chess-gold">
                          Cadeira {apt.chairNumber}
                        </span>
                      </div>
                      <div className="text-xs text-chess-gray mt-0.5">
                        {apt.procedure} • Dr(a). {apt.dentist?.name?.split(' ')[0]}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStatusChange(apt._id, 'em_atendimento')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold chess-btn-green flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Chamar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-chess-border flex items-center justify-between text-xs text-chess-gray">
            <span>Tempo médio de espera: ~12 minutos</span>
            <Link to="/agenda" className="text-chess-green hover:underline font-bold flex items-center gap-1">
              <span>Ver agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Próximos Atendimentos do Dia */}
        <div className="lg:col-span-7 bg-chess-panel border border-chess-border rounded-2xl p-5 shadow-chess-card">
          <div className="flex items-center justify-between pb-3 border-b border-chess-border mb-4">
            <h3 className="text-base font-extrabold text-white">Cronograma de Atendimentos de Hoje</h3>
            <span className="text-xs text-chess-gray font-mono">{stats?.todayAppointments?.length || 0} agendados</span>
          </div>

          {(!stats?.todayAppointments || stats.todayAppointments.length === 0) ? (
            <div className="p-8 text-center text-chess-gray text-xs">
              Nenhuma consulta agendada para hoje até o momento.
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {stats.todayAppointments.map((apt) => {
                const statusColors = {
                  agendado: 'bg-chess-panel text-chess-gray border-chess-border',
                  confirmado: 'bg-chess-blue/20 text-chess-blue border-chess-blue/30',
                  aguardando: 'bg-chess-gold/20 text-chess-gold border-chess-gold/30',
                  em_atendimento: 'bg-chess-green/20 text-chess-green border-chess-green/30 animate-pulse',
                  concluido: 'bg-gray-800 text-gray-400 border-gray-700',
                  cancelado: 'bg-chess-red/20 text-chess-red border-chess-red/30',
                };

                return (
                  <div
                    key={apt._id}
                    className="p-3 bg-chess-darker border border-chess-border/80 rounded-xl flex items-center justify-between hover:border-chess-border transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-black font-mono text-chess-light bg-chess-panel px-2.5 py-1.5 rounded-lg border border-chess-border">
                        {apt.timeSlot}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{apt.patient?.name}</span>
                          <span className="text-[10px] text-chess-gray">
                            ({apt.patient?.phone || 'Sem fone'})
                          </span>
                        </div>
                        <div className="text-xs text-chess-gray">
                          {apt.procedure} • Cadeira #{apt.chairNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold border capitalize ${
                          statusColors[apt.status] || statusColors.agendado
                        }`}
                      >
                        {apt.status.replace('_', ' ')}
                      </span>

                      {apt.status === 'agendado' && (
                        <button
                          onClick={() => handleStatusChange(apt._id, 'confirmado')}
                          className="px-2 py-1 rounded text-xs font-semibold chess-btn-dark"
                        >
                          Confirmar
                        </button>
                      )}
                      {apt.status === 'confirmado' && (
                        <button
                          onClick={() => handleStatusChange(apt._id, 'aguardando')}
                          className="px-2 py-1 rounded text-xs font-semibold chess-btn-gold"
                        >
                          Chegou
                        </button>
                      )}
                      {apt.status === 'em_atendimento' && (
                        <button
                          onClick={() => handleStatusChange(apt._id, 'concluido')}
                          className="px-2 py-1 rounded text-xs font-bold chess-btn-green"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
